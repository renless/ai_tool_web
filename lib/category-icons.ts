/**
 * 把 ai_categories.icon 字段存的图标名解析成 lucide-react 组件。
 *
 * 来源：supabase/seed/ai_tools_nav.sql 里的 icon 列；
 * 落库时统一只存 lucide 组件的名字（PascalCase 字符串），
 * 不存 SVG 路径 / 颜色 / base64，避免数据库臃肿 + 改 lucide 时一次更新。
 */
import {
  Code2,
  FileText,
  ImageIcon,
  Mic2,
  Palette,
  Search,
  Sparkles,
  Video,
  Zap,
  type LucideIcon,
} from "lucide-react"

const ICONS = {
  FileText,
  ImageIcon,
  Video,
  Sparkles,
  Mic2,
  Zap,
  Code2,
  Palette,
  Search,
} as const satisfies Record<string, LucideIcon>

export type CategoryIconName = keyof typeof ICONS

export const KNOWN_CATEGORY_ICONS = Object.keys(ICONS) as CategoryIconName[]

export function resolveCategoryIcon(
  name: string | null | undefined,
): LucideIcon {
  if (name && (name as CategoryIconName) in ICONS) {
    return ICONS[name as CategoryIconName]
  }
  // 数据库里没填或填错就 fallback 到 FileText，避免侧栏渲染崩溃。
  return FileText
}