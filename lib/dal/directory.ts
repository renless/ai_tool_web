import "server-only"

import { cache } from "react"
import {
  fetchDirectory,
  fetchToolBySlug,
  type DirectoryCategory,
  type DirectoryTool,
  type DirectoryToolDetail,
} from "@/lib/supabase/server"
import type { Category, Tool, ToolDetail } from "@/lib/db/types"

/**
 * DAL（Data Access Layer）—— 业务语义到运输层的转换点。
 *
 * 三个职责：
 * 1. 语义映射：snake_case 表行 → camelCase 业务类型。以前 app/page.tsx 里
 *    手动写了 map，现在集中这里，page 层只需要看 props；
 * 2. request-scoped cache：react.cache() 包装，保证 generateMetadata 和本体
 *    调用同一个函数只会发一趟 HTTP；
 * 3. server-only 隔离：打这个文件进 Client Component 会报错，
 *    避免在前端拌业务逻辑。
 *
 * 使用方式：
 *   import { getDirectory, getToolBySlug } from "@/lib/dal/directory"
 */

/** 运输层 DirectoryCategory → 业务层 Category（去掉 sortOrder，前端 UI 不需要它） */
function toCategory(c: DirectoryCategory): Category {
  return {
    slug: c.slug,
    name: c.name,
    icon: c.icon,
  }
}

/** DirectoryTool → Tool，重字段名 categoryName → category（业务层只记中文名） */
function toTool(t: DirectoryTool): Tool {
  return {
    slug: t.slug,
    name: t.name,
    description: t.description,
    color: t.color,
    letter: t.letter,
    url: t.url,
    isFeatured: t.isFeatured,
    isLatest: t.isLatest,
    category: t.categoryName,
  }
}

/** DirectoryToolDetail → ToolDetail */
function toToolDetail(t: DirectoryToolDetail): ToolDetail {
  return {
    ...toTool(t),
    categorySlug: t.categorySlug,
    categoryIcon: t.categoryIcon,
    categorySortOrder: t.categorySortOrder,
  }
}

/**
 * 拉全量：首页用。
 *
 * ISR 缓存由 fetchDirectory 里的 next.revalidate + tag 接手；
 * cache() 仅在单次请求中去重（generateMetadata + page 同时调用只会走一趟走一个 fetch）。
 */
export const getDirectory = cache(async (): Promise<{ categories: Category[]; tools: Tool[] }> => {
  const data = await fetchDirectory()
  return {
    categories: data.categories.map(toCategory),
    tools: data.tools.map(toTool),
  }
})

/**
 * 按 slug 查单个工具。详情页用。找不到返回 null，不抛错。
 */
export const getToolBySlug = cache(
  async (slug: string): Promise<ToolDetail | null> => {
    const t = await fetchToolBySlug(slug)
    if (!t) return null
    return toToolDetail(t)
  },
)
