"use client"

import { useMemo, useState } from "react"
import type { Tool, Category } from "@/lib/db/types"
import { authClient } from "@/lib/auth-client"
import { resolveCategoryIcon } from "@/lib/category-icons"
import {
  ArrowUpRight,
  ChevronRight,
  Clock3,
  Flame,
  LogIn,
  Menu,
  Plus,
  Search,
  Sparkles,
  X,
} from "lucide-react"

// 业务类型 Tool / Category 从 lib/db/types 进口，
// 与 DAL/page 块的 props 共享，避免同一个类型在多个文件里重复声明。

type Props = {
  categories: Category[]
  tools: Tool[]
}

const ALL_CATEGORY = "全部工具"

function ToolCard({ tool }: { tool: Tool }) {
  return (
    <button
      className="tool-card"
      onClick={() =>
        window.open(
          `/tools/${encodeURIComponent(tool.slug || tool.name)}`,
          "_blank",
        )
      }
      aria-label={`查看 ${tool.name} 详情`}
    >
      <span
        className="tool-logo"
        style={{ background: tool.color ?? "#eef0f5" }}
      >
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

export default function DirectoryClient({ categories, tools }: Props) {
  const [query, setQuery] = useState("")
  const [active, setActive] = useState(ALL_CATEGORY)
  // authClient.useSession 在没登录时返回 null，不发额外请求。
  const { data: session } = authClient.useSession()
  const loggedIn = Boolean(session?.user)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // 把数据库里的 icon 字符串解析成 lucide 组件，给侧栏 / 分类标题用。
  const resolvedCategories = useMemo(
    () =>
      categories.map((c) => ({
        ...c,
        Icon: resolveCategoryIcon(c.icon),
      })),
    [categories],
  )

  const filtered = useMemo(
    () =>
      tools.filter((tool) =>
        !query
          ? true
          : `${tool.name}${tool.description ?? ""}`
              .toLowerCase()
              .includes(query.toLowerCase()),
      ),
    [query, tools],
  )

  const scrollTo = (name: string) => {
    setActive(name)
    setSidebarOpen(false)
    document
      .getElementById(name)
      ?.scrollIntoView({ behavior: "smooth", block: "start" })
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
      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <span className="brand-symbol">
            <Sparkles />
          </span>
          <span>AI 工具集</span>
        </div>
        <nav className="category-nav" aria-label="工具分类导航">
          <button
            className={active === ALL_CATEGORY ? "active" : ""}
            onClick={() => scrollTo(ALL_CATEGORY)}
          >
            <Sparkles />
            {ALL_CATEGORY}
          </button>
          {resolvedCategories.map(({ name, Icon }) => (
            <button
              key={name}
              className={active === name ? "active" : ""}
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
                ? "/account?tab=submit"
                : `/login?redirect=${encodeURIComponent("/account?tab=submit")}`)
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
              (window.location.href = loggedIn ? "/account" : "/login")
            }
          >
            {loggedIn ? (
              <>
                <span className="avatar">
                  {(session?.user?.name || "U").slice(0, 1)}
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
            <button onClick={() => setQuery("AI 写作")}>AI 写作</button>
            <button onClick={() => setQuery("AI 图像")}>AI 图像</button>
            <button onClick={() => setQuery("AI 视频")}>AI 视频</button>
            <button onClick={() => setQuery("AI 编程")}>AI 编程</button>
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
              .filter((tool) => tool.isFeatured)
              .map((tool) => (
                <ToolCard key={tool.slug} tool={tool} />
              ))}
          </div>
          <SectionHeading
            icon={<Clock3 />}
            title="最新收录"
            hint="近期新发现"
          />
          <div className="tool-grid">
            {filtered
              .filter((tool) => tool.isLatest)
              .map((tool) => (
                <ToolCard key={tool.slug} tool={tool} />
              ))}
          </div>
        </div>
        {!hasResults && (
          <p
            className="empty-state"
            style={{
              textAlign: "center",
              padding: "40px 0",
              color: "#8891a0",
            }}
          >
            没有找到匹配 "{query}" 的工具，换个关键词试试。
          </p>
        )}
        <div className="category-list">
          {resolvedCategories.map(({ name, Icon }) => {
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
                    <ToolCard key={tool.slug} tool={tool} />
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
