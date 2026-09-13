import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { auth } from '@/lib/auth'
import AccountTabs from './account-tabs'

// 这个页面是 RSC：在请求时直接读 session 校验登录态，
// 防止客户端 JS 没跑起来时页面内容就已经泄出去。
// 中间件已经做了一次 cookie 层面的拦截，这里再加一层服务器守卫。
export default async function AccountPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    redirect('/login?redirect=/account')
  }

  return (
    <main className="account-page">
      <nav className="account-header">
        <a href="/" className="back-link">
          ← 返回工具导航
        </a>
        <span className="account-title">个人中心</span>
      </nav>
      <Suspense fallback={<div>加载中...</div>}>
        {/* 已登录用户对象传给客户端组件，避免内部重复请求 session */}
        <AccountTabs initialUser={session.user} />
      </Suspense>
    </main>
  )
}