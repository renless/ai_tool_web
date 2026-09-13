import { ArrowLeft, ArrowUpRight, CheckCircle2, HelpCircle, Sparkles } from 'lucide-react'

const detailMap: Record<string, { name: string; category: string; summary: string; content: string; color: string; letter: string; url: string; faqs: [string, string][] }> = {
  Loomy: { name: 'Loomy', category: 'AI 智能体', summary: '桌面端 AI 智能体，每天免费使用。', content: 'Loomy 是一个可以理解你的工作目标并主动完成任务的桌面端 AI 智能体。它支持资料整理、网页研究和日常办公协作，让重复工作变得更简单。', color: '#d9f8ec', letter: 'L', url: 'https://example.com', faqs: [['Loomy 适合谁？', '适合希望自动化处理资料、研究和日常办公任务的个人与小团队。'], ['是否支持免费使用？', '提供每日免费额度，具体服务以官网最新说明为准。']] },
  '即梦AI': { name: '即梦AI', category: 'AI 图像工具', summary: '一站式 AI 视频、图片、数字人创作。', content: '即梦AI 将图片生成、视频生成和数字人创作整合在一起，适合内容创作者快速完成从灵感到成片的制作流程。', color: '#101010', letter: '即', url: 'https://example.com', faqs: [['可以生成视频吗？', '可以，支持从文字或图片生成短视频。'], ['需要安装软件吗？', '无需安装，打开官网即可在线使用。']] },
}

export default async function ToolDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const tool = detailMap[decodeURIComponent(slug)] || detailMap.Loomy
  return <main className="detail-page"><nav className="detail-nav"><a href="/"><ArrowLeft />返回工具导航</a><span className="detail-brand"><Sparkles />AI工具集</span></nav><section className="detail-hero"><div className="detail-logo" style={{ background: tool.color }}>{tool.letter}</div><div><span className="detail-category">{tool.category}</span><h1>{tool.name}</h1><p>{tool.summary}</p></div><a className="website-button" href={tool.url} target="_blank" rel="noreferrer">打开网站 <ArrowUpRight /></a></section><div className="detail-layout"><article className="detail-content"><section><h2>工具介绍</h2><p>{tool.content}</p></section><section><h2>常见问题</h2><div className="faq-list">{tool.faqs.map(([question, answer]) => <details key={question}><summary><HelpCircle />{question}<span>＋</span></summary><p>{answer}</p></details>)}</div></section></article><aside className="detail-aside"><div><CheckCircle2 />已收录工具</div><p>本站持续精选优质 AI 工具，帮助你找到更适合的工作伙伴。</p><a href="/account?tab=submit">提交类似工具 <ArrowUpRight /></a></aside></div></main>
}
