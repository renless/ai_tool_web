import { getSessionCookie } from 'better-auth/cookies'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Next.js 16 起的代理中间件（旧的 middleware.ts 已被废弃）。
 *
 * 这里只做轻量的 cookie 存在性判断，不查数据库；
 * 真正的 session 校验留给受保护页面的 RSC 兜底（见 app/account/page.tsx）。
 *
 * 这样分层有两个好处：
 * 1. 每个请求都能在边缘快速拦截未登录用户，体感更顺；
 * 2. 即使 cookie 校验被绕过（比如有人手动伪造 cookie 名），
 *    受保护页面还会再调一次 auth.api.getSession 把空 session 拦下来。
 */
const protectedPaths = ['/account', '/api/submit-tool']

function isSafeRedirect(value: string | null): value is string {
  if (!value) return false
  // 只允许站内相对路径，避免被构造成 `//evil.com` 实现 open redirect。
  return value.startsWith('/') && !value.startsWith('//')
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  const needsAuth = protectedPaths.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  )
  if (!needsAuth) return NextResponse.next()

  // getSessionCookie 只读 cookie 名称是否存在，做轻量判断，不会查数据库。
  const sessionCookie = getSessionCookie(request)
  if (sessionCookie) return NextResponse.next()

  const loginUrl = new URL('/login', request.url)
  const requested = `${pathname}${search}`
  if (isSafeRedirect(requested)) {
    loginUrl.searchParams.set('redirect', requested)
  }
  return NextResponse.redirect(loginUrl)
}

// 排除掉静态资源、Next.js 内部路由以及 better-auth 的 API 路由，
// 减少中间件调用次数。
export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}