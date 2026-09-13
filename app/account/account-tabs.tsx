'use client'

import { FormEvent, useEffect, useState } from 'react'
import { Clock, LogOut, Plus, Upload, User } from 'lucide-react'
import { authClient } from '@/lib/auth-client'

type InitialUser = {
  id: string
  name: string
  email: string
  image?: string | null
}

type AccountTabsProps = {
  // 由服务器组件在页面渲染时传入，保证首屏就有用户信息，
  // 同时作为 fallback 防止 useSession 还在加载时空跑渲染。
  initialUser: InitialUser
}

const categories = [
  'AI 写作工具',
  'AI 图像工具',
  'AI 视频工具',
  'AI 办公工具',
  'AI 聊天助手',
  'AI 智能体',
  'AI 编程工具',
  'AI 开发平台',
  'AI 设计工具',
  'AI 音频工具',
  'AI 搜索引擎',
  'AI 学习网站',
]

const sampleSubmissions = [
  { id: 1, name: 'TestTool', submittedAt: '2025-01-10', status: 'published' as const },
  { id: 2, name: 'MyAssistant', submittedAt: '2025-01-12', status: 'pending' as const },
]

export default function AccountTabs({ initialUser }: AccountTabsProps) {
  // useSession 用于在客户端切换 tab / 修改资料后保持实时性。
  // 同时使用 initialUser 作为初始值以避免首屏闪烁。
  const { data: session, isPending } = authClient.useSession()
  const user = session?.user ?? initialUser

  const [tab, setTab] = useState<'submissions' | 'submit' | 'profile'>(
    'submissions',
  )
  const [name, setName] = useState(initialUser.name)
  const [toolName, setToolName] = useState('')
  const [toolSlug, setToolSlug] = useState('')
  const [toolUrl, setToolUrl] = useState('')
  const [toolSummary, setToolSummary] = useState('')
  const [toolContent, setToolContent] = useState('')
  const [toolCategory, setToolCategory] = useState('AI 其他工具')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [previewFile, setPreviewFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // 允许通过 ?tab=submit | profile 直接跳到指定面板。
    if (typeof window === 'undefined') return
    const requested = new URLSearchParams(window.location.search).get('tab')
    if (requested === 'submit' || requested === 'profile') {
      setTab(requested)
    }
  }, [])

  useEffect(() => {
    if (session?.user?.name) setName(session.user.name)
  }, [session?.user?.name])

  async function handleLogout() {
    await authClient.signOut()
    window.location.href = '/'
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('name', toolName)
      formData.append('slug', toolSlug)
      formData.append('url', toolUrl)
      formData.append('summary', toolSummary)
      formData.append('content', toolContent)
      formData.append('category', toolCategory)
      if (logoFile) formData.append('logo', logoFile)
      if (previewFile) formData.append('preview', previewFile)

      const response = await fetch('/api/submit-tool', {
        method: 'POST',
        body: formData,
      })
      if (response.ok) {
        setToolName('')
        setToolSlug('')
        setToolUrl('')
        setToolSummary('')
        setToolContent('')
        setLogoFile(null)
        setPreviewFile(null)
        alert('工具已提交，等待审核')
      } else {
        alert('提交失败，请稍后重试')
      }
    } catch (error) {
      console.error('Submit error:', error)
      alert('提交出错，请检查网络')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <nav className="account-tabs">
        <button
          className={tab === 'submissions' ? 'active' : ''}
          onClick={() => setTab('submissions')}
        >
          <Clock />
          提交历史
        </button>
        <button
          className={tab === 'submit' ? 'active' : ''}
          onClick={() => setTab('submit')}
        >
          <Plus />
          提交表单
        </button>
        <button
          className={tab === 'profile' ? 'active' : ''}
          onClick={() => setTab('profile')}
        >
          <User />
          个人信息
        </button>
      </nav>

      {tab === 'submissions' && (
        <section className="tab-content">
          <h2>提交历史</h2>
          {sampleSubmissions.length === 0 ? (
            <div className="empty-state">
              <p>还没有提交过工具</p>
              <button onClick={() => setTab('submit')} className="primary-action">
                <Plus />
                现在提交
              </button>
            </div>
          ) : (
            <div className="submissions-list">
              {sampleSubmissions.map((submission) => (
                <div key={submission.id} className="submission-item">
                  <div className="submission-info">
                    <h3>{submission.name}</h3>
                    <p className="submission-date">
                      {submission.submittedAt.replace(/-/g, '/')}
                    </p>
                  </div>
                  <span
                    className={`submission-status status-${submission.status}`}
                  >
                    {submission.status === 'published' ? '已发布' : '审核中'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {tab === 'submit' && (
        <section className="tab-content">
          <h2>提交新工具</h2>
          <form onSubmit={handleSubmit} className="submit-form">
            <fieldset>
              <legend>基本信息</legend>
              <label>
                <span>工具名称*</span>
                <input
                  type="text"
                  value={toolName}
                  onChange={(event) => setToolName(event.target.value)}
                  placeholder="例如：ChatGPT"
                  required
                />
              </label>
              <label>
                <span>网址 Slug*</span>
                <input
                  type="text"
                  value={toolSlug}
                  onChange={(event) =>
                    setToolSlug(
                      event.target.value.toLowerCase().replace(/\s+/g, '-'),
                    )
                  }
                  placeholder="例如：chatgpt（自动转换为小写和连字符）"
                  required
                />
              </label>
              <label>
                <span>官网地址*</span>
                <input
                  type="url"
                  value={toolUrl}
                  onChange={(event) => setToolUrl(event.target.value)}
                  placeholder="https://example.com"
                  required
                />
              </label>
              <label>
                <span>工具分类*</span>
                <select
                  value={toolCategory}
                  onChange={(event) => setToolCategory(event.target.value)}
                  required
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>
            </fieldset>

            <fieldset>
              <legend>上传文件</legend>
              <label>
                <span>工具 Logo（推荐 200x200）</span>
                <div className="file-input-wrapper">
                  <Upload />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) =>
                      setLogoFile(event.target.files?.[0] || null)
                    }
                  />
                  <span>{logoFile?.name || '选择文件'}</span>
                </div>
              </label>
              <label>
                <span>工具预览图（推荐 1200x600）</span>
                <div className="file-input-wrapper">
                  <Upload />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) =>
                      setPreviewFile(event.target.files?.[0] || null)
                    }
                  />
                  <span>{previewFile?.name || '选择文件'}</span>
                </div>
              </label>
            </fieldset>

            <fieldset>
              <legend>工具描述</legend>
              <label>
                <span>摘要（一句话）*</span>
                <input
                  type="text"
                  value={toolSummary}
                  onChange={(event) => setToolSummary(event.target.value)}
                  placeholder="简短描述工具的核心功能"
                  maxLength={100}
                  required
                />
                <small>{toolSummary.length}/100</small>
              </label>
              <label>
                <span>详细介绍*</span>
                <textarea
                  value={toolContent}
                  onChange={(event) => setToolContent(event.target.value)}
                  placeholder="详细介绍工具功能、特点、使用场景等（支持 Markdown）"
                  rows={8}
                  required
                />
              </label>
            </fieldset>

            <button type="submit" className="primary-action" disabled={loading}>
              {loading ? '提交中...' : '提交工具'}
            </button>
          </form>
        </section>
      )}

      {tab === 'profile' && (
        <section className="tab-content">
          <h2>个人信息</h2>
          {isPending && !initialUser ? (
            <p className="profile-loading">正在加载账户资料...</p>
          ) : (
            <div className="profile-form">
              <label>
                <span>昵称</span>
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="你的昵称"
                />
              </label>
              <label>
                <span>邮箱</span>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  placeholder="邮箱地址（不可修改）"
                />
              </label>
              <button onClick={handleLogout} className="logout-button">
                <LogOut />
                退出登录
              </button>
            </div>
          )}
        </section>
      )}
    </>
  )
}