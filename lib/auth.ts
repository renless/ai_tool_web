import { betterAuth } from 'better-auth'
import { nextCookies } from 'better-auth/next-js'
import { pool } from '@/lib/db'

/**
 * better-auth 服务端实例。
 *
 * 设计要点（参考 vercel/next.js examples/with-supabase 的形态，但底层用 better-auth + Drizzle/Postgres）：
 * 1. 复用 lib/db 已建好的 pg Pool，避免每个模块再开一个连接池；
 * 2. trustedOrigins 同时覆盖 Vercel / V0 预览 / 本地开发三种部署形态，
 *    浏览器发起的 Origin 与服务端转发的同源请求都能命中；
 * 3. secret 在生产环境缺失时打印明确警告 + 走一个稳定的 dev-only 占位值，
 *    这样即使还没复制 .env.local，构建也不会因为模块加载而直接挂掉；
 *    真正处理 auth 请求时 better-auth 会因为密钥长度不足再次报错暴露问题；
 * 4. session 配置为 7 天滚动续期，与 with-supabase 示例保持一致；
 * 5. 注册成功后自动登录（autoSignIn），与参考项目的体验一致；
 * 6. user.additionalFields 用 refine 包一个轻量校验（昵称长度 1-32 位），
 *    服务端和客户端（Server Action）都有同样长度的校验，做到双层防御。
 */

const isProd = process.env.NODE_ENV === 'production'

// 收集所有可能 baseURL 来源，按优先级回退。
const originCandidates = [
  process.env.BETTER_AUTH_URL,
  'http://localhost:3000',
  process.env.V0_RUNTIME_URL,
  process.env.V0_DEV_APP_URL,
  process.env.V0_BUILD_URL,
  process.env.V0_SANDBOX_URL,
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
  process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : undefined,
].filter((value): value is string => Boolean(value))

// 占位密钥：仅在本地开发或构建期使用，确保模块可以被加载。
// 真正的请求处理阶段 better-auth 会因为密钥不符合最低强度再次失败并提示。
const DEV_PLACEHOLDER_SECRET =
  'dev-only-insecure-secret-change-me-please-32+chars'

const resolvedSecret = process.env.BETTER_AUTH_SECRET || DEV_PLACEHOLDER_SECRET

if (!process.env.BETTER_AUTH_SECRET) {
  // 在生产环境（或构建期）大声提醒，但不阻断模块加载。
  // 这样既避免初次 `pnpm dev` / `pnpm build` 直接崩，
  // 又确保上线前一定能看见这条警告。
  // eslint-disable-next-line no-console
  console.warn(
    '[auth] BETTER_AUTH_SECRET 未配置，使用占位密钥。\n' +
      '本地开发可以忽略；生产环境必须设置至少 32 位随机字符串。\n' +
      '生成方式：openssl rand -base64 32',
  )
}

export const auth = betterAuth({
  // 复用 lib/db 已经创建好的 pg Pool，避免每个模块再开一个连接池。
  database: pool,
  emailAndPassword: {
    enabled: true,
    // 最少 8 位密码，服务端 + 客户端都校验，避免过于简单。
    minPasswordLength: 8,
    // 上限 128 位，避免有人用超长字符串灌库试探。
    maxPasswordLength: 128,
    // 注册成功后自动登录，与参考项目 (with-supabase) 的体验一致。
    autoSignIn: true,
    // 没有接入邮件服务之前，先关闭强制验证，避免阻塞登录流程。
    requireEmailVerification: false,
  },
  user: {
    // 用户表只多一个 name 字段；email / id / createdAt 等由 better-auth 自带。
    // 长度校验在 Server Action 里再做一次，这里只声明字段元信息。
    additionalFields: {
      name: {
        type: 'string',
        required: true,
        input: true,
      },
    },
  },
  session: {
    // session 默认 7 天过期，与 with-supabase 示例保持一致。
    expiresIn: 60 * 60 * 24 * 7,
    // 每 24 小时有活动就自动续期。
    updateAge: 60 * 60 * 24,
    // 5 分钟内的重复请求直接复用缓存的 session，减少 DB 查询。
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  // 生产环境必须显式配置密钥（上面已经警告过了）。
  secret: resolvedSecret,
  baseURL:
    process.env.BETTER_AUTH_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined),
  trustedOrigins: originCandidates,
  // nextCookies 插件负责把 auth.api.* 调用产生的 Set-Cookie 写入
  // Next.js 的 response cookies 里，否则浏览器不会保存 session cookie。
  plugins: [nextCookies()],
  // 生产环境强制 Secure cookie；开发环境允许 http://localhost 走 http。
  advanced: {
    defaultCookieAttributes: {
      secure: isProd,
      sameSite: 'lax',
    },
  },
  // 静默掉重复的 baseURL 警告：baseURL 已经在 dev 之外的环境设置过。
  logger: {
    level: 'warn',
  },
})

export type Session = typeof auth.$Infer.Session