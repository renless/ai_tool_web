import { Suspense } from 'react'
import type { Metadata } from 'next'
import { ArrowLeft } from 'lucide-react'
import LoginForm from './login-form'

export const metadata: Metadata = {
  title: '登录 / 注册 · AI 工具集',
  description: '使用邮箱密码登录或注册 AI 工具集账号，管理你的工具投稿。',
}

/**
 * 登录 / 注册页面。
 *
 * - page.tsx 是 RSC，只负责布局与返回链接（用于绝对定位）；
 * - 真正的表单提交流程放在 ./actions.ts（Server Actions），
 *   让 page.tsx 可以静态预渲染，错误状态也不需要把整页变成客户端组件。
 */
export default function LoginPage() {
  return (
    <main className="auth-page">
      <a className="back-link" href="/">
        <ArrowLeft />
        返回工具导航
      </a>

      <Suspense
        fallback={
          <section className="auth-card">
            <p>加载中...</p>
          </section>
        }
      >
        <LoginForm />
      </Suspense>
    </main>
  )
}