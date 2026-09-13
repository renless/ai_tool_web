import DirectoryClient from "@/components/directory-client"
import { getDirectory } from "@/lib/dal/directory"

/**
 * AI 工具集导航首页 —— 服务端组件。
 *
 * 数据源：Supabase public.ai_categories / public.ai_tools
 *（schema 和种子见 supabase/seed/ai_tools_nav.sql）。
 *
 * 调用链路：
 *   1. getDirectory() → lib/dal/directory.ts → lib/supabase/server.ts → PostgREST
 *      同时包装了类型映射 + request-scoped cache；
 *   2. 业务型号从 Drizzle schema 推导（lib/db/types.ts），UI 不看 snake_case；
 *   3. 交互部分始终以 props 形式交给 components/directory-client.tsx。
 *
 * 错误处理：
 *   - fetch 抛错时不 silent fallback，直接渲染一个简漂的错误占位页，
 *     比"空工具列表"更让用户 / 开发者意识到数据源有问题；
 *   - route 级错误由 app/error.tsx 接住，这里只负责“可预期”的失败。
 */

export const revalidate = 60

export default async function Page() {
  let data: Awaited<ReturnType<typeof getDirectory>>
  try {
    data = await getDirectory()
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return (
      <main className="directory-shell">
        <section
          className="content-area"
          style={{ padding: "60px 24px", textAlign: "left" }}
        >
          <h1 style={{ fontSize: 28, margin: "0 0 12px" }}>
            暂时打不开工具库
          </h1>
          <p style={{ color: "#687386", margin: 0 }}>
            数据源连接失败：{message}
          </p>
          <p style={{ color: "#8891a0", marginTop: 12 }}>
            请检查 Supabase 项目是否在线，或稍后重试。
          </p>
        </section>
      </main>
    )
  }

  return (
    <DirectoryClient
      categories={data.categories}
      tools={data.tools}
    />
  )
}
