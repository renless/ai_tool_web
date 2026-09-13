'use client'

import { useMemo, useState } from 'react'
import { authClient } from '@/lib/auth-client'
import {
  ArrowUpRight,
  ChevronRight,
  Clock3,
  Code2,
  FileText,
  Flame,
  ImageIcon,
  LogIn,
  Menu,
  Mic2,
  Palette,
  Plus,
  Search,
  Sparkles,
  Video,
  X,
  Zap,
} from 'lucide-react'

type Tool = {
  name: string
  description: string
  category: string
  color: string
  letter: string
  featured?: boolean
  latest?: boolean
  slug?: string
}

// 侧边栏 / 分类区 / 提交表单共用一份分类列表，方便后续维护。
const categories = [
  { name: 'AI 写作工具', icon: FileText },
  { name: 'AI 图像工具', icon: ImageIcon },
  { name: 'AI 视频工具', icon: Video },
  { name: 'AI 办公工具', icon: Sparkles },
  { name: 'AI 聊天助手', icon: Mic2 },
  { name: 'AI 智能体', icon: Zap },
  { name: 'AI 编程工具', icon: Code2 },
  { name: 'AI 开发平台', icon: Code2 },
  { name: 'AI 设计工具', icon: Palette },
  { name: 'AI 音频工具', icon: Mic2 },
  { name: 'AI 搜索引擎', icon: Search },
  { name: 'AI 学习网站', icon: FileText },
]

const ALL_CATEGORY = '全部工具'

const tools: Tool[] = [
  {
    name: 'Loomy',
    description: '桌面级 AI 智能体，每天免费使用',
    category: 'AI 智能体',
    color: '#d9f8ec',
    letter: 'L',
    featured: true,
    slug: 'loomy',
  },
  {
    name: '即梦AI',
    description: '一站式 AI 视频、图片、数字人创作',
    category: 'AI 图像工具',
    color: '#101010',
    letter: '即',
    featured: true,
    slug: 'jimeng-ai',
  },
  {
    name: 'Seko',
    description: '首个集编一体的 AI 视频创作平台',
    category: 'AI 视频工具',
    color: '#e9f1db',
    letter: 'S',
    featured: true,
    slug: 'seko',
  },
  {
    name: 'AiPPT',
    description: 'AI 快速生成高质量 PPT',
    category: 'AI 办公工具',
    color: '#4b247f',
    letter: 'P',
    featured: true,
    slug: 'aippt',
  },
  {
    name: '秘塔AI搜索',
    description: '最好用的 AI 搜索工具，没有广告',
    category: 'AI 搜索引擎',
    color: '#2854cc',
    letter: 'M',
    featured: true,
    slug: 'meta-ai-search',
  },
  {
    name: '美图设计室',
    description: '一站式 AI 平面设计平台，海报、修图全搞定',
    category: 'AI 设计工具',
    color: '#e7edff',
    letter: '美',
    featured: true,
    slug: 'meitu-design',
  },
  {
    name: 'Lovart',
    description: '全球首个 AI 设计智能体',
    category: 'AI 设计工具',
    color: '#171717',
    letter: 'LO',
    featured: true,
    slug: 'lovart',
  },
  {
    name: '美图奇想AI',
    description: 'AI 图像生成与编辑设计平台',
    category: 'AI 图像工具',
    color: '#ecf6bd',
    letter: '奇',
    featured: true,
    slug: 'meitu-qixiang',
  },
  {
    name: '豆包图像',
    description: 'AI 一键生成高质量插画与图像',
    category: 'AI 图像工具',
    color: '#ffd2c5',
    letter: '豆',
    featured: true,
    slug: 'doubao-image',
  },
  {
    name: 'updream',
    description: '出海定制化 AI 视频创作平台',
    category: 'AI 视频工具',
    color: '#e3c7f3',
    letter: 'u',
    featured: true,
    slug: 'updream',
  },
  {
    name: '智谱清言',
    description: '国产 AI 智能体平台，对话即创作',
    category: 'AI 智能体',
    color: '#eef1f8',
    letter: '智',
    featured: true,
    slug: 'zhipu-qingyan',
  },
  {
    name: '智谱开放平台',
    description: '一站式 AI 模型 API 与开发服务',
    category: 'AI 开发平台',
    color: '#d9e7ff',
    letter: '开',
    featured: true,
    slug: 'zhipu-platform',
  },
  {
    name: '智能体PPT',
    description: '一键生成专业级 AI Agent PPT',
    category: 'AI 办公工具',
    color: '#ffe1cf',
    letter: 'P',
    latest: true,
    slug: 'agent-ppt',
  },
  {
    name: '智谱对话AI',
    description: '对话式 AI Agent，覆盖写作、编程与办公',
    category: 'AI 智能体',
    color: '#202020',
    letter: '对',
    latest: true,
    slug: 'zhipu-agent',
  },
  {
    name: 'SoWork',
    description: '团队协作 AI 办公平台，远程工作好帮手',
    category: 'AI 办公工具',
    color: '#f4f4f4',
    letter: 'So',
    latest: true,
    slug: 'sowork',
  },
  {
    name: 'Domery',
    description: '团队协作代码管理与 AI 编程工具',
    category: 'AI 编程工具',
    color: '#edf1f4',
    letter: 'D',
    latest: true,
    slug: 'domery',
  },
  {
    name: 'TArk 平台',
    description: '灵活高效的多模型 API 聚合平台',
    category: 'AI 开发平台',
    color: '#dcecff',
    letter: 'T',
    latest: true,
    slug: 'tark',
  },
  {
    name: 'AionClaw',
    description: '智能体驱动的自动化 AI 工作流',
    category: 'AI 智能体',
    color: '#ffe6d2',
    letter: 'A',
    latest: true,
    slug: 'aionclaw',
  },
  {
    name: '觅元素AI',
    description: 'AI 抠图与设计模板素材库',
    category: 'AI 设计工具',
    color: '#bdf4dc',
    letter: '觅',
    slug: 'miyuansu',
  },
  {
    name: 'Laper',
    description: 'AI 一键生成 PPT 与工作报告',
    category: 'AI 办公工具',
    color: '#dff1cd',
    letter: 'L',
    slug: 'laper',
  },
  {
    name: '觅元素AI模板',
    description: '600+ 优质 AI 生成设计模板',
    category: 'AI 设计工具',
    color: '#d2f0dc',
    letter: '模',
    slug: 'miyuansu-templates',
  },
  {
    name: '设计导航',
    description: 'AI 图像素材与设计资源聚合站',
    category: 'AI 设计工具',
    color: '#d8ddff',
    letter: '设',
    slug: 'design-nav',
  },
  {
    name: '千图设计网',
    description: '海量 AI 设计素材与模板下载',
    category: 'AI 学习网站',
    color: '#e9dcf6',
    letter: 'Q',
    slug: 'qiantu',
  },
  {
    name: '千图网',
    description: 'AI 设计与办公模板免费下载',
    category: 'AI 学习网站',
    color: '#e9ecee',
    letter: 'Q',
    slug: 'qiantu-net',
  },
]

function ToolCard({ tool }: { tool: Tool }) {
  return (
    <button
      className="tool-card"
      onClick={() =>
        window.open(
          `/tools/${encodeURIComponent(tool.slug || tool.name)}`,
          '_blank',
        )
      }
      aria-label={`查看 ${tool.name} 详情`}
    >
      <span className="tool-logo" style={{ background: tool.color }}>
        {tool.letter}
      </span>
      <span className="tool-copy">
        <strong>{tool.name}</strong>
        <small>{tool.description}</small>
      </span>
      <ArrowUpRight className="card-arrow" />
    </button>
  )
}

function SectionHeading({
  icon,
  title,
  hint,
}: {
  icon: React.ReactNode
  title: string
  hint: string
}) {
  return (
    <div className="section-heading">
      <div>
        <span className="heading-icon">{icon}</span>
        <h2>{title}</h2>
        <span className="heading-hint">{hint}</span>
      </div>
      <button>
        查看全部 <ArrowUpRight />
      </button>
    </div>
  )
}

export default function Page() {
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(ALL_CATEGORY)
  // authClient.useSession 在没登录时返回 null，不发额外请求。
  const { data: session } = authClient.useSession()
  const loggedIn = Boolean(session?.user)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const filtered = useMemo(
    () =>
      tools.filter((tool) =>
        !query
          ? true
          : `${tool.name}${tool.description}`
              .toLowerCase()
              .includes(query.toLowerCase()),
      ),
    [query],
  )

  const scrollTo = (name: string) => {
    setActive(name)
    setSidebarOpen(false)
    document
      .getElementById(name)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const sectionTools = (category: string) =>
    filtered.filter((tool) => tool.category === category)

  const hasResults = filtered.length > 0

  return (
    <main className="directory-shell">
      <header className="mobile-header">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="切换侧边栏导航"
        >
          {sidebarOpen ? <X /> : <Menu />}
        </button>
        <span className="brand-mark">AI</span>
        <strong>AI 工具集</strong>
      </header>
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="brand">
          <span className="brand-symbol">
            <Sparkles />
          </span>
          <span>AI 工具集</span>
        </div>
        <nav className="category-nav" aria-label="工具分类导航">
          <button
            className={active === ALL_CATEGORY ? 'active' : ''}
            onClick={() => scrollTo(ALL_CATEGORY)}
          >
            <Sparkles />
            {ALL_CATEGORY}
          </button>
          {categories.map(({ name, icon: Icon }) => (
            <button
              key={name}
              className={active === name ? 'active' : ''}
              onClick={() => scrollTo(name)}
            >
              <Icon />
              {name}
              <ChevronRight className="nav-chevron" />
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button
            className="submit-button"
            onClick={() =>
              (window.location.href = loggedIn
                ? '/account?tab=submit'
                : `/login?redirect=${encodeURIComponent('/account?tab=submit')}`)
            }
          >
            <Plus />
            提交工具
          </button>
          <p>分享你发现的优质 AI 工具，帮助更多人</p>
        </div>
      </aside>
      <section className="content-area">
        <div className="topbar">
          <div className="top-links">
            <span className="top-link active">发现工具</span>
            <span className="top-link">热门排行</span>
            <span className="top-link">AI 资讯</span>
            <span className="top-link">提交收录</span>
            <span className="top-link">帮助中心</span>
          </div>
          <button
            className="login-button"
            onClick={() =>
              (window.location.href = loggedIn ? '/account' : '/login')
            }
          >
            {loggedIn ? (
              <>
                <span className="avatar">
                  {(session?.user?.name || 'U').slice(0, 1)}
                </span>
                个人中心
              </>
            ) : (
              <>
                <LogIn />
                登录
              </>
            )}
          </button>
        </div>
        <div className="hero">
          <p className="eyebrow">
            <span></span>AI 工具集精选推荐
          </p>
          <h1>
            发现好工具，一起分享给更多人
            <br />
            <em>AI 工具</em>
          </h1>
          <p className="hero-subtitle">
            汇集全网优质 AI 工具，找到适合你的那一款，并分享给身边的朋友
          </p>
          <div className="search-wrap">
            <Search />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索工具名称、功能或关键词……"
            />
            <kbd>⌘ K</kbd>
          </div>
          <div className="quick-tags">
            <span>热门搜索</span>
            <button onClick={() => setQuery('AI 写作')}>AI 写作</button>
            <button onClick={() => setQuery('AI 图像')}>AI 图像</button>
            <button onClick={() => setQuery('AI 视频')}>AI 视频</button>
            <button onClick={() => setQuery('AI 编程')}>AI 编程</button>
          </div>
        </div>
        <div id={ALL_CATEGORY} className="featured-section">
          <SectionHeading
            icon={<Flame />}
            title="热门工具"
            hint="本周精选推荐"
          />
          <div className="tool-grid">
            {filtered
              .filter((tool) => tool.featured)
              .map((tool) => (
                <ToolCard key={tool.name} tool={tool} />
              ))}
          </div>
          <SectionHeading
            icon={<Clock3 />}
            title="最新收录"
            hint="近期新发现"
          />
          <div className="tool-grid">
            {filtered
              .filter((tool) => tool.latest)
              .map((tool) => (
                <ToolCard key={tool.name} tool={tool} />
              ))}
          </div>
        </div>
        {!hasResults && (
          <p
            className="empty-state"
            style={{
              textAlign: 'center',
              padding: '40px 0',
              color: '#8891a0',
            }}
          >
            没有找到匹配 "{query}" 的工具，换个关键词试试。
          </p>
        )}
        <div className="category-list">
          {categories.map(({ name, icon: Icon }) => {
            const items = sectionTools(name)
            return (
              <section id={name} className="category-section" key={name}>
                <div className="category-title">
                  <div>
                    <Icon />
                    <h2>{name}</h2>
                    <span>{items.length} 个工具</span>
                  </div>
                  <button>
                    查看全部 <ArrowUpRight />
                  </button>
                </div>
                <div className="tool-grid">
                  {items.map((tool) => (
                    <ToolCard key={tool.name} tool={tool} />
                  ))}
                </div>
              </section>
            )
          })}
        </div>
        <footer>
          <span className="brand-mark">AI</span>
          <span>AI 工具集 © 收录最前沿的 AI 应用</span>
          <span className="footer-right">记录 2,800+ 优质 AI 工具</span>
        </footer>
      </section>
    </main>
  )
}
