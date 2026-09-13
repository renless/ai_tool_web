import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  HelpCircle,
  Sparkles,
} from "lucide-react"
import { getToolBySlug } from "@/lib/dal/directory"
import type { Metadata } from "next"

/**
 * AI 工具详情页 —— async Server Component，数据全部来自 Supabase ai_tools。
 *
 * 调用链路：
 *   getToolBySlug(slug) → lib/dal/directory.ts (cache() 包装)
 *                        → lib/supabase/server.ts (PostgREST + ISR 60s)
 *
 * 业务型号（ToolDetail）从 lib/db/types.ts 进口，前端 UI 只看中文名、slug、icon、sort_order。
 *
 * 数据缺失时的兑底：
 * - description 为 null → 用一句话模杷（"<name> 是一个收录在 AI 工具集的 AI 应用。"）
 * - 工具介绍 / 常见问题 → 用通用文案（DB 没存这两块，先保证页面不空白）
 * - 找不到 slug → notFound() 抛错，由 app/not-found.tsx 兑底
 * - route 级 fetch 报错 → app/tools/[slug]/error.tsx 接住（提供 reset()）
 */

// 通用 FAQ，DB 没存 per-tool FAQ，先用一组覆盖所有人的；将来要扩展，
// 在 ai_tools 表加一个 faqs jsonb 字段就行，调用层不需要改。
const DEFAULT_FAQS: ReadonlyArray<{ q: string; a: string }> = [
  {
    q: "这个工具适合谁？",
    a: "适合需要 AI 提升效率的内容创作者、设计师、运营和开发者。",
  },
  {
    q: "是否需要付费？",
    a: "具体计费策略以工具官网为准，AI 工具集仅做收录和导流。",
  },
  {
    q: "如何提交类似工具？",
    a: "点击页面右上角「提交工具」，填写信息后会进入审核队列，审核通过即可公开收录。",
  },
]

// 详情页同样走 60s ISR，避免每次访问都打 Supabase；
// generateMetadata 跟 Page 共享 getToolBySlug 的 cache（单次请求只会发一趟 fetch）。
export const revalidate = 60

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  // generateMetadata 抛错会让整个路由 build 失败，所以这里包一层容错：
  // 拿不到数据就当成"未找到"返回通用标题，避免一个 DB 抖动炸掉整站 SEO。
  const tool = await getToolBySlug(slug).catch(() => null)
  if (!tool) {
    return { title: "未找到该工具 — AI 工具集" }
  }
  const summary = tool.description ?? `${tool.name} 是一个 ${tool.category} 分类。`
  return {
    title: `${tool.name} — AI 工具集`,
    description: summary.slice(0, 200),
  }
}

export default async function ToolDetail({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const tool = await getToolBySlug(slug)
  if (!tool) notFound()

  const fallbackSummary = `${tool.name} 是一个收录在 AI 工具集的 AI 应用。`
  const fallbackIntro = `${tool.name} 属于 ${tool.category} 分类，欢迎前往官网体验。`

  return (
    <main className="detail-page">
      <nav className="detail-nav">
        <Link href="/">
          <ArrowLeft />
          返回工具导航
        </Link>
        <span className="detail-brand">
          <Sparkles />
          AI工具集
        </span>
      </nav>
      <section className="detail-hero">
        <div
          className="detail-logo"
          style={{ background: tool.color ?? "#eef0f5" }}
        >
          {tool.letter}
        </div>
        <div>
          <span className="detail-category">{tool.category}</span>
          <h1>{tool.name}</h1>
          <p>{tool.description ?? fallbackSummary}</p>
        </div>
        {tool.url ? (
          <a
            className="website-button"
            href={tool.url}
            target="_blank"
            rel="noreferrer"
          >
            打开网站 <ArrowUpRight />
          </a>
        ) : null}
      </section>
      <div className="detail-layout">
        <article className="detail-content">
          <section>
            <h2>工具介绍</h2>
            <p>{tool.description ?? fallbackIntro}</p>
          </section>
          <section>
            <h2>常见问题</h2>
            <div className="faq-list">
              {DEFAULT_FAQS.map((faq) => (
                <details key={faq.q}>
                  <summary>
                    <HelpCircle />
                    {faq.q}
                    <span>＋</span>
                  </summary>
                  <p>{faq.a}</p>
                </details>
              ))}
            </div>
          </section>
        </article>
        <aside className="detail-aside">
          <div>
            <CheckCircle2 />
            已收录工具
          </div>
          <p>本站持续精选优质 AI 工具，帮助你找到更适合的工作伙伴。</p>
          {/* "查看更多 Xxx" 跳回首页并 anchor 到对应分类 section，依赖 DirectoryClient 里的 section id = category name */}
          <Link href={`/#${encodeURIComponent(tool.category)}`}>
            查看更多 {tool.category} <ArrowUpRight />
          </Link>
          <Link href="/account?tab=submit">
            提交类似工具 <ArrowUpRight />
          </Link>
        </aside>
      </div>
    </main>
  )
}
