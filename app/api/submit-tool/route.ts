import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { toolSubmissions } from '@/lib/db/schema'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await request.formData()
  const name = String(formData.get('name') || '').trim()
  const slug = String(formData.get('slug') || '').trim()
  const url = String(formData.get('url') || '').trim()
  const summary = String(formData.get('summary') || '').trim()
  const content = String(formData.get('content') || '').trim()
  const category = String(formData.get('category') || 'AI 其他工具').trim()

  if (!name || !slug || !url || !summary || !content) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const logo = formData.get('logo')
  const preview = formData.get('preview')
  await db.insert(toolSubmissions).values({
    userId: session.user.id,
    name,
    slug,
    url,
    summary,
    content,
    category,
    logoUrl: logo instanceof File ? logo.name : null,
    previewUrl: preview instanceof File ? preview.name : null,
    status: 'pending',
  })
  return NextResponse.json({ ok: true })
}
