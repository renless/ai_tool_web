'use client'

import { useActionState, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, Eye, EyeOff, LockKeyhole, Mail, Sparkles, User } from 'lucide-react'
import { signInAction, signUpAction, type AuthFormState } from './actions'

/**
 * 登录 / 注册表单（客户端组件）。
 *
 * - 通过 useActionState 把 React 19 的 Server Action 状态机接进来，
 *   表单天然支持「提交中 / 成功跳转 / 失败回填」三态；
 * - 切换登录/注册模式时清空密码，避免浏览器自动填充把上一份密码带到新表单；
 * - fieldErrors 渲染在每个 input 下面，error 渲染在卡片顶部，对应不同粒度的提示。
 */
const initialState: AuthFormState = {}

export default function LoginForm() {
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/account'

  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [showPassword, setShowPassword] = useState(false)

  // useActionState 需要绑定到具体 action，根据 mode 二选一。
  const action = mode === 'signin' ? signInAction : signUpAction
  const [state, formAction, isPending] = useActionState(action, initialState)

  function toggleMode() {
    setMode((prev) => (prev === 'signin' ? 'signup' : 'signin'))
  }

  return (
    <section className="auth-card">
      <div className="auth-brand">
        <span>
          <Sparkles />
        </span>
        <strong>AI 工具集</strong>
      </div>

      <h1>{mode === 'signup' ? '创建你的账号' : '欢迎回来'}</h1>
      <p>
        {mode === 'signup'
          ? '加入 AI 工具集，分享你的发现。'
          : '登录后管理你的工具投稿。'}
      </p>

      {state?.error && (
        <p className="form-error" role="alert">
          {state.error}
        </p>
      )}

      <form action={formAction} noValidate>
        {/* 隐藏字段，把 redirect 目标带回 Server Action。 */}
        <input type="hidden" name="redirect" value={redirectTo} />

        {mode === 'signup' && (
          <label>
            <span>
              <User />
              昵称
            </span>
            <input
              name="name"
              type="text"
              defaultValue={state?.values?.name ?? ''}
              placeholder="你的昵称"
              maxLength={32}
              autoComplete="nickname"
              required
              aria-invalid={Boolean(state?.fieldErrors?.name) || undefined}
            />
            {state?.fieldErrors?.name && (
              <small className="field-error">{state.fieldErrors.name}</small>
            )}
          </label>
        )}

        <label>
          <span>
            <Mail />
            邮箱地址
          </span>
          <input
            name="email"
            type="email"
            defaultValue={state?.values?.email ?? ''}
            placeholder="name@example.com"
            autoComplete="email"
            required
            aria-invalid={Boolean(state?.fieldErrors?.email) || undefined}
          />
          {state?.fieldErrors?.email && (
            <small className="field-error">{state.fieldErrors.email}</small>
          )}
        </label>

        <label>
          <span>
            <LockKeyhole />
            密码
          </span>
          <div className="password-row">
            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="至少 8 位密码"
              minLength={8}
              maxLength={128}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              required
              aria-invalid={Boolean(state?.fieldErrors?.password) || undefined}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? '隐藏密码' : '显示密码'}
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>
          {state?.fieldErrors?.password && (
            <small className="field-error">{state.fieldErrors.password}</small>
          )}
        </label>

        {mode === 'signup' && (
          <label>
            <span>
              <LockKeyhole />
              确认密码
            </span>
            <input
              name="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              placeholder="再输入一次密码"
              minLength={8}
              maxLength={128}
              autoComplete="new-password"
              required
              aria-invalid={Boolean(state?.fieldErrors?.confirmPassword) || undefined}
            />
            {state?.fieldErrors?.confirmPassword && (
              <small className="field-error">
                {state.fieldErrors.confirmPassword}
              </small>
            )}
          </label>
        )}

        <button className="primary-action" type="submit" disabled={isPending}>
          {isPending ? '处理中...' : mode === 'signup' ? '注册账号' : '登录'}
        </button>
      </form>

      <button className="switch-auth" type="button" onClick={toggleMode}>
        {mode === 'signup'
          ? '已有账号？立即登录'
          : '还没有账号？注册一个'}
      </button>

      <a className="back-link back-link--bottom" href="/">
        <ArrowLeft />
        返回工具导航
      </a>
    </section>
  )
}