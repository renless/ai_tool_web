# AI 工具集导航 —— 数据入库 (Supabase)

把 `app/page.tsx`（截图 + 源码）里的 24 个 AI 工具 + 12 个分类，写入 Supabase 数据库。

## 表结构

- `public.ai_categories` — 左侧侧栏的 12 个分类
  - `id`, `slug`(unique), `name`, `icon`(lucide-react 图标名), `sort_order`, `created_at`
- `public.ai_tools` — 卡片数据
  - `id`, `slug`(unique), `name`, `description`, `category_id`(FK), `color`(logo 背景色), `letter`(logo 字符), `url`, `logo_url`, `preview_url`, `is_featured`, `is_latest`, `sort_order`, `created_at`, `updated_at`
- 索引：`category_id` / `is_featured` / `is_latest` / `slug`
- RLS：开启 + 公开只读策略（仅 Supabase 环境，本地 PostgreSQL 自动跳过）

> 表名前加 `ai_` 前缀，避免与项目里已有的 `categories` / `records` 等表冲突。

## 写入用的 RPC（重要）

`Supabase` 当前的 PostgREST 对 `Prefer: resolution=merge-duplicates` 不生效（实测返回 409 unique_violation），所以 SQL 里额外建了 3 个 RPC 做幂等 upsert：

- `public.ai_upsert_categories(p_rows jsonb) returns int` — 批量 upsert 分类
- `public.ai_upsert_tools(p_rows jsonb) returns int` — 批量 upsert 工具（内部 join ai_categories）
- `public.ai_list_tools_with_category() returns setof ...` — 联表查询，给 `pnpm db:verify` 用

## 执行步骤

### 1. 在 Supabase SQL Editor 跑建表脚本（一次，幂等）

打开 https://supabase.com/dashboard/project/dlvpdrhxbavouhgxatnj/sql/new ，把 `supabase/seed/ai_tools_nav.sql` 全文粘进去执行。

它会自动完成：
1. 建表 `ai_categories` / `ai_tools` + 索引
2. 启用 RLS + 公开只读策略
3. 创建 3 个 RPC
4. 写入 12 个分类 + 24 个工具的种子数据（`ON CONFLICT DO UPDATE`，反复跑也安全）

### 2. Node 脚本通过 RPC 幂等 upsert

```bash
pnpm db:seed           # 12 + 24 行
pnpm db:verify         # 回读校验
```

之后只要改 `scripts/seed-data.mjs` 然后 `pnpm db:seed` 即可同步到 Supabase（不用再去 SQL Editor）。

## 常用命令

```bash
pnpm db:build-sql   # 改 seed-data 后重新生成 SQL
pnpm db:test-sql    # 本地 PG 跑 SQL 验证语法 + 幂等
pnpm db:seed-dry    # 只打印，不发请求
pnpm db:seed        # 真正写入 Supabase (调 ai_upsert_* RPC)
pnpm db:verify      # 调 ai_list_tools_with_category 回读校验
```

## 文件清单

| 文件 | 作用 |
|---|---|
| `supabase/seed/ai_tools_nav.sql` | 建表 + 种子数据 + 3 个 RPC，幂等 |
| `supabase/migrations/20250913_ai_tools_nav.sql` | 同上（CLI migrations 规范） |
| `scripts/seed-data.mjs` | 与 `app/page.tsx` 一一对应的源数据（24 + 12） |
| `scripts/build-sql.mjs` | 从 seed-data 生成上面的 SQL |
| `scripts/test-sql.mjs` | 本地 Postgres 验证 SQL |
| `scripts/seed-supabase.mjs` | service_role key 通过 REST API 调 RPC 幂等 upsert |
| `lib/db/schema.ts` | Drizzle ORM 新增 `aiCategories` / `aiTools` 定义 |

## 数据对应关系（与截图核对）

- **侧栏分类 (12)**：AI 写作 / 图像 / 视频 / 办公 / 聊天 / 智能体 / 编程 / 开发平台 / 设计 / 音频 / 搜索引擎 / 学习
- **热门工具 ★ (12)**：Loomy / 即梦AI / Seko / AiPPT / 秘塔AI搜索 / 美图设计室 / Lovart / 美图奇想AI / 豆包图像 / updream / 智谱清言 / 智谱开放平台
- **最新收录 ✦ (6)**：智能体PPT / 智谱对话AI / SoWork / Domery / TArk 平台 / AionClaw
- **其他 (6)**：觅元素AI / Laper / 觅元素AI模板 / 设计导航 / 千图设计网 / 千图网
- **logo 图片**：截图里是彩色方块 + 单字符占位图，已用 `color` + `letter` 字段保存；要换成真实 `logo_url`，更新 `seed-data.mjs` 重跑 `pnpm db:seed` 即可。
