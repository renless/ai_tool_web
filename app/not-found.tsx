import Link from "next/link"
import { Compass } from "lucide-react"

/**
 * 全局 404 —— /tools/[slug] 没命中 + 任何其它未匹配的路由都会落到这里。
 *
 * 设计：跟站点风格保持一致（白底卡片 + 紫主色），给两个出口：
 * 1. 回首页继续浏览
 * 2. 提交一个新工具（也算 SEO 友好的转化入口）
 */
export const metadata = {
  title: "页面不存在 — AI 工具集",
}

export default function NotFound() {
  return (
    <main className="detail-page" style={{ padding: "60px 24px" }}>
      <section
        className="detail-content"
        style={{
          padding: "60px 30px",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 18,
        }}
      >
        <Compass size={56} color="#7059e6" />
        <h1 style={{ margin: 0, fontSize: 32, color: "#151d30" }}>
          404 — 这个页面不存在
        </h1>
        <p style={{ margin: 0, color: "#687386", maxWidth: 520 }}>
          你请求的页面可能已下架、链接过期或误入。
          试试这些入口：
        </p>
        <div style={{ display: "flex", gap: 12, marginTop: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <Link
            href="/"
            style={{
              padding: "12px 20px",
              background: "#7059e6",
              color: "#fff",
              borderRadius: 9,
              textDecoration: "none",
              fontSize: 14,
            }}
          >
            ← 返回首页寻找
          </Link>
          <Link
            href="/account?tab=submit"
            style={{
              padding: "12px 20px",
              border: "1px solid #e6e8ed",
              color: "#596477",
              borderRadius: 9,
              textDecoration: "none",
              fontSize: 14,
            }}
          >
            提交一个新工具
          </Link>
        </div>
      </section>
    </main>
  )
}
