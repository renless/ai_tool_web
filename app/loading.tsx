import { Sparkles } from "lucide-react"

/**
 * 首页加载骨架 —— Next.js 16 在 Server Component 请求未返回时
 * 会自动渲染这个文件。原则：
 * 1. 不去复制 .directory-shell 的完整 DOM，只拼个大脚手架，减少首屏 CLS；
 * 2. shimmer 动画全部用 CSS 跑，不占 JS 主线程。
 */
export default function Loading() {
  return (
    <main className="skeleton-page">
      <aside className="skeleton-sidebar">
        <div className="skeleton-row" style={{ width: "60%", height: 22 }} />
        <div className="skeleton-row" style={{ width: "80%" }} />
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="skeleton-pill"
            style={{ width: `${78 + (i % 3) * 6}%`, opacity: 1 - i * 0.06 }}
          />
        ))}
        <div className="skeleton-button" style={{ marginTop: 24 }} />
      </aside>
      <section className="skeleton-content">
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Sparkles size={28} color="#a594f5" />
        </div>
        <div className="skeleton-bar" style={{ width: "60%", alignSelf: "center", height: 40 }} />
        <div className="skeleton-row" style={{ width: "45%", alignSelf: "center" }} />
        <div className="skeleton-row" style={{ width: "70%", alignSelf: "center" }} />
        <div
          className="skeleton-tall"
          style={{ marginTop: 30, height: 86, borderRadius: 14 }}
        />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 18 }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton-card" />
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 18 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton-card" style={{ opacity: 1 - i * 0.08 }} />
          ))}
        </div>
      </section>
    </main>
  )
}
