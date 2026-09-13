/**
 * better-auth 抛出的错误码到中文提示的映射。
 *
 * 之所以单独抽到一个模块：
 * 1. Server Actions 和客户端表单都需要翻译同一份错误码，避免重复实现；
 * 2. 文案集中维护，未来要改语气只改这里一处。
 */
export function translateAuthError(err: unknown, fallback = '操作失败，请稍后再试'): string {
  if (!err) return fallback
  const anyErr = err as {
    code?: string
    message?: string
    body?: { code?: string; message?: string }
  }
  const code = anyErr.code ?? anyErr.body?.code
  const message = anyErr.message ?? anyErr.body?.message ?? fallback

  switch (code) {
    case 'USER_ALREADY_EXISTS':
    case 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL':
      return '该邮箱已注册，请直接登录或换一个邮箱'
    case 'INVALID_EMAIL':
      return '邮箱格式不正确'
    case 'INVALID_PASSWORD':
    case 'INVALID_EMAIL_OR_PASSWORD':
      return '邮箱或密码错误，请重试'
    case 'USER_NOT_FOUND':
      return '找不到该邮箱对应的账户'
    case 'PASSWORD_TOO_SHORT':
    case 'PASSWORD_TOO_LONG':
      return '密码长度需在 8 到 128 位之间'
    case 'EMAIL_NOT_VERIFIED':
      return '请先完成邮箱验证再登录'
    case 'SIGN_UP_DISABLED':
      return '当前已关闭注册功能，请联系管理员'
    case 'FAILED_TO_CREATE_SESSION':
    case 'FAILED_TO_CREATE_USER':
      return '账号创建失败，请稍后再试'
    default:
      // 兜底用原始 message，方便排查未知错误码。
      return message || fallback
  }
}