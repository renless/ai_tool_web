// scripts/seed-supabase.mjs
// --------------------------------------------------------------
// 把导航页数据 upsert 到 Supabase（通过 ai_upsert_categories / ai_upsert_tools RPC）
// 流程：
//   1. 读 .env 里的 VITE_SUPABASE_URL / VITE_SUPABASE_SERVICE_ROLE_KEY
//   2. 探测 ai_categories / ai_tools / ai_upsert_categories / ai_upsert_tools 是否齐备
//   3. 齐备则按 slug 幂等 upsert 数据；缺则提示先跑 supabase/seed/ai_tools_nav.sql
// 用法：
//   node scripts/seed-supabase.mjs            # 默认 upsert
//   node scripts/seed-supabase.mjs --dry      # 只打印，不写
//   node scripts/seed-supabase.mjs --verify   # 只读 + 校验
//   node scripts/seed-supabase.mjs --sql      # 把建表+RPC SQL 输出到 stdout
// --------------------------------------------------------------
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '..')

// ---------- 1. 加载 .env ----------
const envPath = path.join(ROOT, '.env')
if (!fs.existsSync(envPath)) {
  console.error('未找到 .env 文件:', envPath)
  process.exit(1)
}
for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
  if (!m) continue
  if (m[1].startsWith('#')) continue
  if (process.env[m[1]]) continue
  let v = m[2]
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1)
  process.env[m[1]] = v
}

const SUPABASE_URL = (process.env.VITE_SUPABASE_URL || '').trim().replace(/\/$/, '')
const SERVICE_KEY = (process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '').trim()

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('错误：.env 缺少 VITE_SUPABASE_URL 或 VITE_SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const ARGS = new Set(process.argv.slice(2))
const DRY = ARGS.has('--dry')
const VERIFY = ARGS.has('--verify')
const PRINT_SQL = ARGS.has('--sql')

// 只输出 SQL：方便 `node scripts/seed-supabase.mjs --sql | Set-Clipboard` 复制
if (PRINT_SQL) {
  const sqlPath = path.join(ROOT, 'supabase', 'seed', 'ai_tools_nav.sql')
  process.stdout.write(fs.readFileSync(sqlPath, 'utf8'))
  process.exit(0)
}

// ---------- 2. REST 客户端 ----------
async function rest(pathname, init = {}) {
  const headers = {
    apikey: SERVICE_KEY,
    Authorization: 'Bearer ' + SERVICE_KEY,
    ...(init.headers || {}),
  }
  if (init.body && !headers['Content-Type']) headers['Content-Type'] = 'application/json'
  const r = await fetch(SUPABASE_URL + pathname, { ...init, headers })
  const text = await r.text()
  if (!r.ok) {
    throw new Error(`${init.method || 'GET'} ${pathname} -> ${r.status} ${text.slice(0, 200)}`)
  }
  return text ? JSON.parse(text) : null
}

async function rpc(name, args) {
  const init = { method: 'POST' }
  if (args && Object.keys(args).length > 0) init.body = JSON.stringify(args)
  return rest('/rest/v1/rpc/' + name, init)
}

async function fetchAll(table, query = '') {
  const out = []
  const limit = 1000
  let offset = 0
  while (true) {
    const sep = query ? '&' : '?'
    const data = await rest(`/rest/v1/${table}?${query}${sep}limit=${limit}&offset=${offset}`)
    if (!Array.isArray(data) || data.length === 0) break
    out.push(...data)
    if (data.length < limit) break
    offset += limit
  }
  return out
}

async function probeSchema() {
  const openapi = await rest('/rest/v1/')
  const paths = openapi.paths || {}
  return {
    tables: {
      ai_categories: '/ai_categories' in paths,
      ai_tools: '/ai_tools' in paths,
    },
    rpc: {
      ai_upsert_categories: '/rpc/ai_upsert_categories' in paths,
      ai_upsert_tools: '/rpc/ai_upsert_tools' in paths,
      ai_list_tools_with_category: '/rpc/ai_list_tools_with_category' in paths,
    },
  }
}

const { categories, tools } = await import('./seed-data.mjs')

console.log(`> Supabase: ${SUPABASE_URL}`)
console.log(`> 模式: ${VERIFY ? 'VERIFY (只读)' : DRY ? 'DRY-RUN' : 'UPSERT via RPC'}`)

const schema = await probeSchema()
console.log(`> 表存在: ai_categories=${schema.tables.ai_categories} ai_tools=${schema.tables.ai_tools}`)
console.log(`> RPC 存在: ai_upsert_categories=${schema.rpc.ai_upsert_categories} ai_upsert_tools=${schema.rpc.ai_upsert_tools}`)

if (!schema.tables.ai_categories || !schema.tables.ai_tools) {
  console.error('\n!! 表 public.ai_categories / ai_tools 不存在。')
  console.error('   请先执行 supabase/seed/ai_tools_nav.sql (含建表 + RPC)。')
  console.error('   一键获取 SQL:   node scripts/seed-supabase.mjs --sql | Set-Clipboard')
  console.error('   然后把 SQL 粘贴到 SQL Editor 执行。')
  process.exit(2)
}

if (!VERIFY && (!schema.rpc.ai_upsert_categories || !schema.rpc.ai_upsert_tools)) {
  console.error('\n!! RPC public.ai_upsert_categories / ai_upsert_tools 不存在。')
  console.error('   请先在 Supabase SQL Editor 跑一遍 supabase/seed/ai_tools_nav.sql')
  console.error('   （脚本是幂等的——建表/索引/RLS/RPC/种子数据全部 CREATE OR REPLACE / ON CONFLICT DO UPDATE）')
  console.error('   一键获取 SQL:   node scripts/seed-supabase.mjs --sql | Set-Clipboard')
  console.error('   然后到 https://supabase.com/dashboard/project/dlvpdrhxbavouhgxatnj/sql/new 粘贴执行。')
  process.exit(3)
}

if (VERIFY) {
  let rows
  if (schema.rpc.ai_list_tools_with_category) {
    rows = await rpc('ai_list_tools_with_category')
  } else {
    rows = await fetchAll('ai_tools', 'select=slug,name,is_featured,is_latest,sort_order,category_id&order=sort_order')
    const cats = await fetchAll('ai_categories', 'select=id,slug')
    const m = new Map(cats.map((c) => [c.id, c.slug]))
    rows = rows.map((t) => ({ ...t, category_slug: m.get(t.category_id) }))
  }
  console.log(`\n  tools: ${rows.length}`)
  for (const t of rows) {
    const flag = (t.is_featured ? '★ ' : '   ') + (t.is_latest ? '✦ ' : '   ')
    console.log(`    ${flag}${String(t.name).padEnd(14)} -> ${t.category_slug}`)
  }
  process.exit(0)
}

const catRows = categories.map((c) => ({
  slug: c.slug,
  name: c.name,
  icon: c.icon,
  sort_order: c.sort_order,
}))

console.log(`\n[1/2] ai_upsert_categories (${catRows.length} 行)`)
if (DRY) {
  console.log('  (dry) sample:', catRows[0])
} else {
  const affected = await rpc('ai_upsert_categories', { p_rows: catRows })
  console.log(`  ok  affected=${affected}`)
}

const toolRows = tools.map((t) => {
  const cat = categories.find((c) => c.name === t.category)
  if (!cat) throw new Error(`工具 ${t.slug} 找不到分类 ${t.category}`)
  return {
    slug: t.slug,
    name: t.name,
    description: t.description,
    category_slug: cat.slug,
    category_name: cat.name,
    category_icon: cat.icon,
    color: t.color,
    letter: t.letter,
    url: t.url,
    is_featured: t.is_featured,
    is_latest: t.is_latest,
    sort_order: t.sort_order,
  }
})

console.log(`\n[2/2] ai_upsert_tools (${toolRows.length} 行)`)
if (DRY) {
  console.log('  (dry) sample:', toolRows[0])
} else {
  const affected = await rpc('ai_upsert_tools', { p_rows: toolRows })
  console.log(`  ok  affected=${affected}`)
}

console.log(`\n✓ 完成。可以执行下列命令快速核对：`)
console.log(`  node scripts/seed-supabase.mjs --verify`)