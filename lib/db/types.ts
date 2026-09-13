/**
 * 统一类型出口 —— 业务/前端 UI 一律 import 这里。
 *
 * 三个源头：
 * 1. AiCategoryRow / AiToolRow — 从 Drizzle schema 推导出的表行类型（snake_case），
 *    与 Supabase 返回的 JSON 完全对齐；
 * 2. Category / Tool / ToolDetail — 业务层类型（camelCase），与 UI 组件的 props 一致；
 * 3. supabase/server.ts 里的 DirectoryCategory / DirectoryTool / DirectoryToolDetail 是
 *    中间型号（运输层的原子型号），只在 DAL 里被使用。
 *
 * 使用方式：
 *   import type { Tool, ToolDetail } from "@/lib/db/types"
 */
import type { InferSelectModel } from "drizzle-orm"
import { aiCategories, aiTools } from "./schema"

/** Drizzle 推导的原表行类型（snake_case列名、DB 字段名） */
export type AiCategoryRow = InferSelectModel<typeof aiCategories>
export type AiToolRow = InferSelectModel<typeof aiTools>

/**
 * 业务层 —— 分类。用于首页 sidebar / 分类列表、亦用于详情页“查看更多 Xxx”的跳转。
 */
export type Category = {
  slug: string
  name: string
  /** DB 里存的 lucide 图标名（如 "FileText"）。由 resolveCategoryIcon 解析为组件。 */
  icon: string | null
}

/**
 * 业务层 —— 工具。用于首页工具卡片、热门/最新列表。
 *
 * 注意 `category` 字段：以中文分类名作 key，用于和 categories[].name 匹配
 * 做分块渲染；不是 slug。
 */
export type Tool = {
  slug: string
  name: string
  description: string | null
  color: string | null
  letter: string | null
  url: string | null
  isFeatured: boolean
  isLatest: boolean
  /** 中文分类名。不是 slug。 */
  category: string
}

/**
 * 业务层 —— 工具详情。多带 categorySlug + categoryIcon + categorySortOrder，
 * 供详情页侧栏“查看更多”跳转需要。
 */
export type ToolDetail = Tool & {
  categorySlug: string
  categoryIcon: string | null
  categorySortOrder: number
}
