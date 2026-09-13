'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { APIError } from 'better-auth/api'
import { auth } from '@/lib/auth'
import { translateAuthError } from '@/lib/auth-errors'

/**
 * 表单提交后回传给客户端的状态。
 * 同时承载「字段级错误」与「全局错误」两种粒度，
 * 让前端可以分别渲染在 input 旁边和卡片顶部。
 */
export interface AuthFormState {
  error?: string
  fieldErrors?: {
    name?: string
    email?: string
    password?: string
    confirmPassword?: string
  }
  values?: {
    name?: string
    email?: string
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function pickRedirect(formData: FormData): string {
  const raw = String(formData.get('redirect') ?? '').trim()
  // 只允许站内相对路径，避免被构造成 `//evil.com` 实现 open redirect。
  if (raw.startsWith('/') && !raw.startsWith('//')) return raw
  return '/account'
}

function pickString(formData: FormData, key: string): string {
  return String(formData.get(key) ?? '').trim()
}

function pickPassword(formData: FormData, key: string): string {
  // 密码不做 trim，避免用户误把前/后空格当成密码的一部分。
  return String(formData.get(key) ?? '')
}

function validateEmail(email: string): string | undefined {
  if (!email) return '请输入邮箱'
  if (!EMAIL_RE.test(email)) return '邮箱格式不正确'
  return undefined
}

function validatePassword(password: string): string | undefined {
  if (!password) return '请输入密码'
  if (password.length < 8) return '密码至少 8 位'
  if (password.length > 128) return '密码最多 128 位'
  return undefined
}

/**
 * 通用兜底：把 better-auth 抛出的 APIError 翻成中文；未知错误走 fallback。
 */
function describeError(err: unknown): string {
  if (err instanceof APIError) {
    return translateAuthError(err, err.message)
  }
  return translateAuthError(err)
}

export async function signInAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = pickString(formData, 'email')
  const password = pickPassword(formData, 'password')

  const fieldErrors: AuthFormState['fieldErrors'] = {}
  const emailErr = validateEmail(email)
  const passwordErr = validatePassword(password)
  if (emailErr) fieldErrors.email = emailErr
  if (passwordErr) fieldErrors.password = passwordErr
  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors, values: { email } }
  }

  try {
    await auth.api.signInEmail({
      body: { email, password },
      headers: await headers(),
    })
  } catch (err) {
    return {
      error: describeError(err),
      values: { email },
    }
  }

  // 只有成功才跳转；抛 redirect 即视为正常控制流。
  redirect(pickRedirect(formData))
}

export async function signUpAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const name = pickString(formData, 'name')
  const email = pickString(formData, 'email')
  const password = pickPassword(formData, 'password')
  const confirmPassword = pickPassword(formData, 'confirmPassword')

  const fieldErrors: AuthFormState['fieldErrors'] = {}
  if (!name) fieldErrors.name = '请输入昵称'
  else if (name.length > 32) fieldErrors.name = '昵称最多 32 个字符'
  const emailErr = validateEmail(email)
  if (emailErr) fieldErrors.email = emailErr
  const passwordErr = validatePassword(password)
  if (passwordErr) fieldErrors.password = passwordErr
  if (!confirmPassword) fieldErrors.confirmPassword = '请再次输入密码'
  else if (confirmPassword !== password) fieldErrors.confirmPassword = '两次密码不一致'

  if (Object.keys(fieldErrors).length > 0) {
    return {
      fieldErrors,
      values: { name, email },
    }
  }

  try {
    await auth.api.signUpEmail({
      body: { email, password, name },
      headers: await headers(),
    })
  } catch (err) {
    return {
      error: describeError(err),
      values: { name, email },
    }
  }

  redirect(pickRedirect(formData))
}