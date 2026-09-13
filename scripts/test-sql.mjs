import pg from 'pg'
import fs from 'node:fs'

const sql = fs.readFileSync('supabase/seed/ai_tools_nav.sql', 'utf8')
const admin = new pg.Client({ host:'localhost', user:'postgres', database:'postgres', port:5432 })
await admin.connect()
await admin.query("DROP DATABASE IF EXISTS ai_tools_test")
await admin.query("CREATE DATABASE ai_tools_test")
await admin.end()

const c = new pg.Client({ host:'localhost', user:'postgres', database:'ai_tools_test', port:5432 })
await c.connect()
await c.query(sql)

const r1 = await c.query('select count(*) from ai_categories')
const r2 = await c.query('select count(*) from ai_tools')
const r3 = await c.query("select name, color, letter, is_featured, is_latest, sort_order from ai_tools where slug='loomy'")
const r4 = await c.query(`select c.name as cat, count(t.*) as n from ai_categories c left join ai_tools t on t.category_id=c.id group by c.name, c.sort_order order by c.sort_order`)

console.log('categories:', r1.rows[0].count)
console.log('tools:', r2.rows[0].count)
console.log('loomy row:', r3.rows[0])
console.log('per-cat:')
for (const row of r4.rows) console.log(' ', row.cat, '->', row.n)

// 再跑一遍确保幂等
await c.query(sql)
const r5 = await c.query('select count(*) from ai_tools')
console.log('re-run, tools count:', r5.rows[0].count)

await c.end()
