import { ArrowLeft } from "lucide-react"

/**
 * /tools/[slug] 加载骨架 —— 复用全局 skeleton CSS，
 * 不在这里复制完整 detail-page DOM，只给个体面感。
 */
export default function ToolDetailLoading() {
  return (
    <main className="detail-page">
      <nav className="detail-nav">
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#7059e6" }}>
          <ArrowLeft size={16} />
          返回工具导航
        </span>
        <span className="detail-brand">AI工具集</span>
      </nav>
      <section className="detail-hero">
        <div className="detail-logo skeleton-row" style={{ width: 86, height: 86, borderRadius: 22 }} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
          <div className="skeleton-row" style={{ width: 80 }} />
          <div className="skeleton-bar" style={{ width: "40%", height: 32 }} />
          <div className="skeleton-row" style={{ width: "65%" }} />
        </div>
        <div className="skeleton-button" style={{ width: 110, marginLeft: "auto" }} />
      </section>
      <div className="detail-layout">
        <article className="detail-content">
          <section>
            <div className="skeleton-bar" style={{ width: 100, marginBottom: 18 }} />
            <div className="skeleton-block" />
            <div className="skeleton-block" style={{ marginTop: 10 }} />
            <div className="skeleton-block" style={{ marginTop: 10, width: "75%" }} />
          </section>
          <section>
            <div className="skeleton-bar" style={{ width: 100, marginBottom: 18 }} />
            <div className="skeleton-card" style={{ height: 60, marginBottom: 10 }} />
            <div className="skeleton-card" style={{ height: 60, marginBottom: 10 }} />
            <div className="skeleton-card" style={{ height: 60 }} />
          </section>
        </article>
        <aside className="detail-aside">
          <div className="skeleton-row" style={{ width: "60%", marginBottom: 18 }} />
          <div className="skeleton-block" />
          <div className="skeleton-block" style={{ marginTop: 10, width: "80%" }} />
          <div className="skeleton-button" style={{ marginTop: 22 }} />
          <div className="skeleton-button" style={{ marginTop: 10, opacity: 0.6 }} />
        </aside>
      </div>
    </main>
  )
}
