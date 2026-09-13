"use client"

import { useEffect } from "react"
import Link from "next/link"
import { AlertTriangle, RotateCcw } from "lucide-react"

/**
 * 首页错误兑底 —— Supabase 挂了 / DNS 走了 / RPC 超时都会落进这里。
 *
 * 为什么不直接在 app/page.tsx 里 catch + render：
 * 1. Next.js 16 的 error.tsx 是路由级别的错误边界，
 *    只要路由树上有任何业务报错（包括后续以 Suspense 包装的代码块）都会被接住；
 * 2. 它必须是 Client Component，才能提供 reset() 重试按钮。
 *
 * console.error 的作用：上报到客户端日志（Vercel / Sentry），
 * 避免代码里的“隐藏异常”在生产上看不见。
 */
export default function HomeError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[HomeError]", error)
  }, [error])

  return (
    <main className="detail-page" style={{ padding: "60px 24px" }}>
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
          工具库加载出错了
        </h1>
        <p style={{ margin: 0, color: "#687386", maxWidth: 520 }}>
          数据源连接失败，可能是 Supabase 短暂不可用。
          点击下方按钮重试，或者稍后再访问。
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
