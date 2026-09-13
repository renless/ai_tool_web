"use client"

import { useEffect } from "react"
import Link from "next/link"
import { AlertTriangle, RotateCcw } from "lucide-react"

/**
 * /tools/[slug] 错误兑底 —— fetchToolBySlug 报错时走这里。
 *
 * 与首页 error.tsx 的区别：该路由上 fetchToolBySlug 被包在 generateMetadata 中
 * 并 catch 掉，所以这里看到的主要是真正意义上的数据报错，
 * 给个“试其他工具”的跨路由跳转。
 */
export default function ToolDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[ToolDetailError]", error)
  }, [error])

  return (
    <main className="detail-page" style={{ padding: "40px 24px" }}>
      <section
        className="detail-content"
        style={{
          padding: "50px 30px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 18,
          textAlign: "center",
        }}
      >
        <AlertTriangle size={48} color="#c2410c" />
        <h1 style={{ margin: 0, fontSize: 28, color: "#151d30" }}>
          该工具页面加载出错
        </h1>
        <p style={{ margin: 0, color: "#687386", maxWidth: 520 }}>
          可能是临时抽不到数据。重试一下还不行，
          可以返回首页看看其他工具。
        </p>
        {error.digest ? (
          <code style={{ fontSize: 12, color: "#8891a0" }}>
            digest: {error.digest}
          </code>
        ) : null}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <button
            onClick={reset}
            style={{
              padding: "12px 20px",
              background: "#7059e6",
              color: "#fff",
              border: 0,
              borderRadius: 9,
              fontSize: 14,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
            }}
          >
            <RotateCcw size={15} />
            重试一次
          </button>
          <Link
            href="/"
            style={{
              padding: "12px 20px",
              border: "1px solid #e6e8ed",
              color: "#596477",
              borderRadius: 9,
              textDecoration: "none",
              fontSize: 14,
            }}
          >
            返回首页
          </Link>
        </div>
      </section>
    </main>
  )
}
