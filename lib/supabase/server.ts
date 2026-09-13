/**
 * Server-only Supabase REST helpers for the AI tools directory.
 *
 * 设计要点：
 * 1. 走 PostgREST 而不是另装 @supabase/supabase-js，少一个依赖；
 * 2. 用 anon key 读：RLS 策略已放行 anon SELECT，anon key 也不会绕过权限；
 *    即便误从 Client Component 引用，泄漏出去的也只是只读公钥，不会泄漏写权限；
 * 3. fetch 用 next.revalidate 做 ISR 级别的短缓存（60s）+ tag 做定向失效，
 *    后台改完工具后可以调 revalidateTag("ai-directory") 立刻生效；
 * 4. 物理隔离：本文件写在 lib/supabase/server.ts，
 *    不在任何 Client Component 里 import（page.tsx 是 RSC，OK）。
 *
 * 注意：本文件是 transport layer（只负责 HTTP），业务映射放在 lib/dal/directory.ts。
 */

const RAW_URL = (process.env.VITE_SUPABASE_URL || "").trim()
const SUPABASE_URL = RAW_URL.replace(/\/+$/, "")
const ANON_KEY = (process.env.VITE_SUPABASE_ANON_KEY || "").trim()

// 列表接口用的 select 子集（不含 category.icon）
const LIST_TOOL_SELECT = [
  "slug",
  "name",
  "description",
  "color",
  "letter",
  "url",
  "is_featured",
  "is_latest",
  "sort_order",
  "category:ai_categories(slug,name)",
].join(",")
const LIST_CATEGORY_SELECT = ["slug", "name", "icon", "sort_order"].join(",")
// 详情接口再多带一个 category.icon，方便详情页侧栏切回分类时显示图标
const DETAIL_TOOL_SELECT = [
  "slug",
  "name",
  "description",
  "color",
  "letter",
  "url",
  "is_featured",
  "is_latest",
  "sort_order",
  "category:ai_categories(slug,name,icon,sort_order)",
].join(",")

export type DirectoryCategory = {
  slug: string
  name: string
  icon: string | null
  sortOrder: number
}

export type DirectoryTool = {
  slug: string
  name: string
  description: string | null
  color: string | null
  letter: string | null
  url: string | null
  isFeatured: boolean
  isLatest: boolean
  sortOrder: number
  /** 分类名（不是 slug），跟 categories 列表匹配做分块渲染。 */
  categoryName: string
  categorySlug: string
}

export type DirectoryToolDetail = DirectoryTool & {
  categoryIcon: string | null
  categorySortOrder: number
}

export type DirectoryData = {
  categories: DirectoryCategory[]
  tools: DirectoryTool[]
}

type RawCategory = {
  slug: string
  name: string
  icon: string | null
  sort_order: number
}

type RawTool = {
  slug: string
  name: string
  description: string | null
  color: string | null
  letter: string | null
  url: string | null
  is_featured: boolean
  is_latest: boolean
  sort_order: number
  category: { slug: string; name: string } | null
}

type RawToolDetail = RawTool & {
  category: { slug: string; name: string; icon: string | null; sort_order: number } | null
}

function authHeaders() {
  if (!SUPABASE_URL) {
    throw new Error("VITE_SUPABASE_URL 未配置，无法从 Supabase 读取工具数据。")
  }
  if (!ANON_KEY) {
    throw new Error("VITE_SUPABASE_ANON_KEY 未配置，无法从 Supabase 读取工具数据。")
  }
  return {
    apikey: ANON_KEY,
    Authorization: `Bearer ${ANON_KEY}`,
    "Content-Type": "application/json",
  } as const
}

/**
 * 拉取分类 + 工具全表（首页用）。
 *
 * 失败会抛错，让上层 page.tsx 决定怎么降级（不要在这里默认 silent fallback，
 * 否则前端显示空状态时用户会以为"工具都没了"，排查成本极高）。
 */
export async function fetchDirectory(): Promise<DirectoryData> {
  const headers = authHeaders()
  const fetchOpts = {
    headers,
    // ISR：60s 短缓存，避免每次请求都打 Supabase；
    // tag 让后台写操作（未来）能用 revalidateTag("ai-directory") 立刻失效。
    next: { revalidate: 60, tags: ["ai-directory"] },
  } as const

  const base = `${SUPABASE_URL}/rest/v1`

  const [categoriesRes, toolsRes] = await Promise.all([
    fetch(
      `${base}/ai_categories?select=${LIST_CATEGORY_SELECT}&order=sort_order.asc`,
      fetchOpts,
    ),
    fetch(
      `${base}/ai_tools?select=${LIST_TOOL_SELECT}&order=sort_order.asc`,
      fetchOpts,
    ),
  ])

  if (!categoriesRes.ok) {
    const text = await categoriesRes.text().catch(() => "")
    throw new Error(
      `Supabase ai_categories 返回 ${categoriesRes.status}：${text.slice(0, 200)}`,
    )
  }
  if (!toolsRes.ok) {
    const text = await toolsRes.text().catch(() => "")
    throw new Error(
      `Supabase ai_tools 返回 ${toolsRes.status}：${text.slice(0, 200)}`,
    )
  }

  const rawCategories = (await categoriesRes.json()) as RawCategory[]
  const rawTools = (await toolsRes.json()) as RawTool[]

  return {
    categories: rawCategories.map((c) => ({
      slug: c.slug,
      name: c.name,
      icon: c.icon,
      sortOrder: c.sort_order,
    })),
    tools: rawTools.map((t) => ({
      slug: t.slug,
      name: t.name,
      description: t.description,
      color: t.color,
      letter: t.letter,
      url: t.url,
      isFeatured: t.is_featured,
      isLatest: t.is_latest,
      sortOrder: t.sort_order,
      categorySlug: t.category?.slug ?? "",
      categoryName: t.category?.name ?? "",
    })),
  }
}

/**
 * 按 slug 查单个工具（详情页用）。找不到返回 null，不抛错。
 *
 * 跟 fetchDirectory 的区别：
 * 1. 多带一个 category.icon（详情页侧栏跳转要用）
 * 2. 用 PostgREST 的 `slug=eq.` 过滤，避免一次拉全表
 * 3. limit=1 + 单条 select，O(1) 查询
 */
export async function fetchToolBySlug(
  slug: string,
): Promise<DirectoryToolDetail | null> {
  const headers = authHeaders()
  const safeSlug = encodeURIComponent(slug)
  const fetchOpts = {
    headers,
    next: { revalidate: 60, tags: ["ai-directory", `ai-tool:${slug}`] },
  } as const

  const url =
    `${SUPABASE_URL}/rest/v1/ai_tools?slug=eq.${safeSlug}` +
    `&select=${DETAIL_TOOL_SELECT}&limit=1`

  const res = await fetch(url, fetchOpts)
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(
      `Supabase ai_tools 返回 ${res.status}：${text.slice(0, 200)}`,
    )
  }

  const rows = (await res.json()) as RawToolDetail[]
  if (rows.length === 0) return null

  const t = rows[0]
  return {
    slug: t.slug,
    name: t.name,
    description: t.description,
    color: t.color,
    letter: t.letter,
    url: t.url,
    isFeatured: t.is_featured,
    isLatest: t.is_latest,
    sortOrder: t.sort_order,
    categorySlug: t.category?.slug ?? "",
    categoryName: t.category?.name ?? "",
    categoryIcon: t.category?.icon ?? null,
    categorySortOrder: t.category?.sort_order ?? 0,
  }
}