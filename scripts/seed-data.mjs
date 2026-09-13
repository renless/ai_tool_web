// 顶部导航数据 —— 与 app/page.tsx 的 `categories` 和 `tools` 完全对齐
// 由 scripts/seed-supabase.mjs 读取，用于向 Supabase 写入。
// 修改这里之后再跑脚本即可同步。

export const allCategoryLabel = '全部工具'

// 与 lucide-react 的图标对应：仅存名称，前端按名映射组件即可。
export const categories = [
  { slug: 'ai-writing-tools',    name: 'AI 写作工具', icon: 'FileText',  sort_order: 10 },
  { slug: 'ai-image-tools',      name: 'AI 图像工具', icon: 'ImageIcon', sort_order: 20 },
  { slug: 'ai-video-tools',      name: 'AI 视频工具', icon: 'Video',     sort_order: 30 },
  { slug: 'ai-office-tools',     name: 'AI 办公工具', icon: 'Sparkles',  sort_order: 40 },
  { slug: 'ai-chat-assistants',  name: 'AI 聊天助手', icon: 'Mic2',      sort_order: 50 },
  { slug: 'ai-agents',           name: 'AI 智能体',   icon: 'Zap',       sort_order: 60 },
  { slug: 'ai-coding-tools',     name: 'AI 编程工具', icon: 'Code2',     sort_order: 70 },
  { slug: 'ai-dev-platforms',    name: 'AI 开发平台', icon: 'Code2',     sort_order: 80 },
  { slug: 'ai-design-tools',     name: 'AI 设计工具', icon: 'Palette',   sort_order: 90 },
  { slug: 'ai-audio-tools',      name: 'AI 音频工具', icon: 'Mic2',      sort_order: 100 },
  { slug: 'ai-search-engines',   name: 'AI 搜索引擎', icon: 'Search',    sort_order: 110 },
  { slug: 'ai-learning-sites',   name: 'AI 学习网站', icon: 'FileText',  sort_order: 120 },
]

// 工具数据 —— 与 app/page.tsx `tools` 数组完全一致
// is_featured 表示进入"热门工具"区；is_latest 表示进入"最新收录"区。
export const tools = [
  { slug: 'loomy',                name: 'Loomy',          description: '桌面级 AI 智能体，每天免费使用',                    category: 'AI 智能体',   color: '#d9f8ec', letter: 'L',  url: 'https://example.com', is_featured: true,  is_latest: false, sort_order: 10 },
  { slug: 'jimeng-ai',            name: '即梦AI',          description: '一站式 AI 视频、图片、数字人创作',                  category: 'AI 图像工具', color: '#101010', letter: '即', url: 'https://example.com', is_featured: true,  is_latest: false, sort_order: 20 },
  { slug: 'seko',                 name: 'Seko',           description: '首个集编一体的 AI 视频创作平台',                     category: 'AI 视频工具', color: '#e9f1db', letter: 'S',  url: 'https://example.com', is_featured: true,  is_latest: false, sort_order: 30 },
  { slug: 'aippt',                name: 'AiPPT',          description: 'AI 快速生成高质量 PPT',                              category: 'AI 办公工具', color: '#4b247f', letter: 'P',  url: 'https://example.com', is_featured: true,  is_latest: false, sort_order: 40 },
  { slug: 'meta-ai-search',       name: '秘塔AI搜索',       description: '最好用的 AI 搜索工具，没有广告',                      category: 'AI 搜索引擎', color: '#2854cc', letter: 'M',  url: 'https://example.com', is_featured: true,  is_latest: false, sort_order: 50 },
  { slug: 'meitu-design',         name: '美图设计室',        description: '一站式 AI 平面设计平台，海报、修图全搞定',              category: 'AI 设计工具', color: '#e7edff', letter: '美', url: 'https://example.com', is_featured: true,  is_latest: false, sort_order: 60 },
  { slug: 'lovart',               name: 'Lovart',         description: '全球首个 AI 设计智能体',                             category: 'AI 设计工具', color: '#171717', letter: 'LO', url: 'https://example.com', is_featured: true,  is_latest: false, sort_order: 70 },
  { slug: 'meitu-qixiang',        name: '美图奇想AI',       description: 'AI 图像生成与编辑设计平台',                           category: 'AI 图像工具', color: '#ecf6bd', letter: '奇', url: 'https://example.com', is_featured: true,  is_latest: false, sort_order: 80 },
  { slug: 'doubao-image',         name: '豆包图像',         description: 'AI 一键生成高质量插画与图像',                          category: 'AI 图像工具', color: '#ffd2c5', letter: '豆', url: 'https://example.com', is_featured: true,  is_latest: false, sort_order: 90 },
  { slug: 'updream',              name: 'updream',        description: '出海定制化 AI 视频创作平台',                           category: 'AI 视频工具', color: '#e3c7f3', letter: 'u',  url: 'https://example.com', is_featured: true,  is_latest: false, sort_order: 100 },
  { slug: 'zhipu-qingyan',        name: '智谱清言',         description: '国产 AI 智能体平台，对话即创作',                       category: 'AI 智能体',   color: '#eef1f8', letter: '智', url: 'https://example.com', is_featured: true,  is_latest: false, sort_order: 110 },
  { slug: 'zhipu-platform',       name: '智谱开放平台',      description: '一站式 AI 模型 API 与开发服务',                       category: 'AI 开发平台', color: '#d9e7ff', letter: '开', url: 'https://example.com', is_featured: true,  is_latest: false, sort_order: 120 },
  { slug: 'agent-ppt',            name: '智能体PPT',        description: '一键生成专业级 AI Agent PPT',                        category: 'AI 办公工具', color: '#ffe1cf', letter: 'P',  url: 'https://example.com', is_featured: false, is_latest: true,  sort_order: 130 },
  { slug: 'zhipu-agent',          name: '智谱对话AI',       description: '对话式 AI Agent，覆盖写作、编程与办公',                category: 'AI 智能体',   color: '#202020', letter: '对', url: 'https://example.com', is_featured: false, is_latest: true,  sort_order: 140 },
  { slug: 'sowork',               name: 'SoWork',         description: '团队协作 AI 办公平台，远程工作好帮手',                 category: 'AI 办公工具', color: '#f4f4f4', letter: 'So', url: 'https://example.com', is_featured: false, is_latest: true,  sort_order: 150 },
  { slug: 'domery',               name: 'Domery',         description: '团队协作代码管理与 AI 编程工具',                      category: 'AI 编程工具', color: '#edf1f4', letter: 'D',  url: 'https://example.com', is_featured: false, is_latest: true,  sort_order: 160 },
  { slug: 'tark',                 name: 'TArk 平台',       description: '灵活高效的多模型 API 聚合平台',                       category: 'AI 开发平台', color: '#dcecff', letter: 'T',  url: 'https://example.com', is_featured: false, is_latest: true,  sort_order: 170 },
  { slug: 'aionclaw',             name: 'AionClaw',       description: '智能体驱动的自动化 AI 工作流',                        category: 'AI 智能体',   color: '#ffe6d2', letter: 'A',  url: 'https://example.com', is_featured: false, is_latest: true,  sort_order: 180 },
  { slug: 'miyuansu',             name: '觅元素AI',         description: 'AI 抠图与设计模板素材库',                             category: 'AI 设计工具', color: '#bdf4dc', letter: '觅', url: 'https://example.com', is_featured: false, is_latest: false, sort_order: 190 },
  { slug: 'laper',                name: 'Laper',          description: 'AI 一键生成 PPT 与工作报告',                          category: 'AI 办公工具', color: '#dff1cd', letter: 'L',  url: 'https://example.com', is_featured: false, is_latest: false, sort_order: 200 },
  { slug: 'miyuansu-templates',   name: '觅元素AI模板',     description: '600+ 优质 AI 生成设计模板',                          category: 'AI 设计工具', color: '#d2f0dc', letter: '模', url: 'https://example.com', is_featured: false, is_latest: false, sort_order: 210 },
  { slug: 'design-nav',           name: '设计导航',         description: 'AI 图像素材与设计资源聚合站',                          category: 'AI 设计工具', color: '#d8ddff', letter: '设', url: 'https://example.com', is_featured: false, is_latest: false, sort_order: 220 },
  { slug: 'qiantu',               name: '千图设计网',       description: '海量 AI 设计素材与模板下载',                           category: 'AI 学习网站', color: '#e9dcf6', letter: 'Q',  url: 'https://example.com', is_featured: false, is_latest: false, sort_order: 230 },
  { slug: 'qiantu-net',           name: '千图网',           description: 'AI 设计与办公模板免费下载',                            category: 'AI 学习网站', color: '#e9ecee', letter: 'Q',  url: 'https://example.com', is_featured: false, is_latest: false, sort_order: 240 },
]
