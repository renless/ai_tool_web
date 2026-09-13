-- ============================================================================
-- AI 工具集导航 —— 表结构 + 种子数据 + 写入 RPC
-- 来源：app/page.tsx 的 categories / tools 数组 (24 个工具 + 12 个分类)
-- 使用方式：
--   1. Supabase Dashboard -> SQL Editor -> 粘贴执行 (一次性)
--   2. 项目自带 scripts/seed-supabase.mjs (后续修改 seed-data 后幂等 upsert)
-- 注意：表名加 ai_ 前缀，避免与现有 categories / records 等表冲突。
-- RLS 仅在 Supabase 环境生效（依赖 anon/authenticated 角色）。
-- 本脚本全部幂等：可以反复执行。
-- ============================================================================

-- 1. 分类表 ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_categories (
  id          BIGSERIAL PRIMARY KEY,
  slug        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  icon        TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. 工具表 ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_tools (
  id           BIGSERIAL PRIMARY KEY,
  slug         TEXT NOT NULL UNIQUE,
  name         TEXT NOT NULL,
  description  TEXT,
  category_id  BIGINT NOT NULL REFERENCES public.ai_categories(id) ON DELETE RESTRICT,
  color        TEXT,
  letter       TEXT,
  url          TEXT,
  logo_url     TEXT,
  preview_url  TEXT,
  is_featured  BOOLEAN NOT NULL DEFAULT FALSE,
  is_latest    BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_tools_category  ON public.ai_tools(category_id);
CREATE INDEX IF NOT EXISTS idx_ai_tools_featured  ON public.ai_tools(is_featured);
CREATE INDEX IF NOT EXISTS idx_ai_tools_latest    ON public.ai_tools(is_latest);
CREATE INDEX IF NOT EXISTS idx_ai_tools_slug      ON public.ai_tools(slug);

-- 3. RLS —— 仅在 Supabase 环境生效 (依赖 anon / authenticated 角色) ----
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname='anon') THEN
    ALTER TABLE public.ai_categories ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.ai_tools     ENABLE ROW LEVEL SECURITY;
    EXECUTE 'DROP POLICY IF EXISTS "anon read ai_categories" ON public.ai_categories';
    EXECUTE 'CREATE POLICY "anon read ai_categories" ON public.ai_categories FOR SELECT TO anon, authenticated USING (true)';
    EXECUTE 'DROP POLICY IF EXISTS "anon read ai_tools" ON public.ai_tools';
    EXECUTE 'CREATE POLICY "anon read ai_tools" ON public.ai_tools FOR SELECT TO anon, authenticated USING (true)';
  END IF;
END
$$;

-- 4. 写入 RPC (供 Node 脚本调用，做真正幂等的 upsert) ----------------
-- 用 ON CONFLICT (slug) DO UPDATE 解决 PostgREST merge-duplicates 不可用的问题
CREATE OR REPLACE FUNCTION public.ai_upsert_categories(p_rows jsonb)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  affected integer;
BEGIN
  INSERT INTO public.ai_categories (slug, name, icon, sort_order)
  SELECT r.slug, r.name, r.icon, r.sort_order
  FROM jsonb_to_recordset(p_rows) AS r(slug text, name text, icon text, sort_order int)
  ON CONFLICT (slug) DO UPDATE SET
    name       = EXCLUDED.name,
    icon       = EXCLUDED.icon,
    sort_order = EXCLUDED.sort_order;
  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected;
END;
$$;

CREATE OR REPLACE FUNCTION public.ai_upsert_tools(p_rows jsonb)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  affected integer;
BEGIN
  -- 先把分类 upsert 一遍（如果前端先调 categories 不会出问题，但保险起见内部也处理）
  INSERT INTO public.ai_categories (slug, name, icon, sort_order)
  SELECT DISTINCT r.category_slug, r.category_name, r.category_icon, 0
  FROM jsonb_to_recordset(p_rows) AS r(category_slug text, category_name text, category_icon text)
  ON CONFLICT (slug) DO NOTHING;

  INSERT INTO public.ai_tools (slug, name, description, category_id, color, letter, url, is_featured, is_latest, sort_order, updated_at)
  SELECT
    r.slug, r.name, r.description, c.id, r.color, r.letter, r.url,
    COALESCE(r.is_featured, false), COALESCE(r.is_latest, false), COALESCE(r.sort_order, 0), NOW()
  FROM jsonb_to_recordset(p_rows) AS r(
    slug text, name text, description text,
    category_slug text, category_name text, category_icon text,
    color text, letter text, url text,
    is_featured boolean, is_latest boolean, sort_order int
  )
  JOIN public.ai_categories c ON c.slug = r.category_slug
  ON CONFLICT (slug) DO UPDATE SET
    name        = EXCLUDED.name,
    description = EXCLUDED.description,
    category_id = EXCLUDED.category_id,
    color       = EXCLUDED.color,
    letter      = EXCLUDED.letter,
    url         = EXCLUDED.url,
    is_featured = EXCLUDED.is_featured,
    is_latest   = EXCLUDED.is_latest,
    sort_order  = EXCLUDED.sort_order,
    updated_at  = NOW();
  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected;
END;
$$;

-- 5. SELECT RPC (verify 用) -------------------------------------------
CREATE OR REPLACE FUNCTION public.ai_list_tools_with_category()
RETURNS TABLE (
  slug text, name text, category_slug text, is_featured boolean, is_latest boolean, sort_order int
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT t.slug, t.name, c.slug AS category_slug, t.is_featured, t.is_latest, t.sort_order
  FROM public.ai_tools t
  JOIN public.ai_categories c ON c.id = t.category_id
  ORDER BY t.sort_order;
$$;

-- 6. 种子数据：分类 (幂等) --------------------------------------------
INSERT INTO public.ai_categories (slug, name, icon, sort_order) VALUES
  ('ai-writing-tools', 'AI 写作工具', 'FileText', 10),
  ('ai-image-tools', 'AI 图像工具', 'ImageIcon', 20),
  ('ai-video-tools', 'AI 视频工具', 'Video', 30),
  ('ai-office-tools', 'AI 办公工具', 'Sparkles', 40),
  ('ai-chat-assistants', 'AI 聊天助手', 'Mic2', 50),
  ('ai-agents', 'AI 智能体', 'Zap', 60),
  ('ai-coding-tools', 'AI 编程工具', 'Code2', 70),
  ('ai-dev-platforms', 'AI 开发平台', 'Code2', 80),
  ('ai-design-tools', 'AI 设计工具', 'Palette', 90),
  ('ai-audio-tools', 'AI 音频工具', 'Mic2', 100),
  ('ai-search-engines', 'AI 搜索引擎', 'Search', 110),
  ('ai-learning-sites', 'AI 学习网站', 'FileText', 120)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order;

-- 7. 种子数据：工具 (幂等) --------------------------------------------
INSERT INTO public.ai_tools (slug, name, description, category_id, color, letter, url, is_featured, is_latest, sort_order)
SELECT v.slug, v.name, v.description, c.id, v.color, v.letter, v.url, v.is_featured, v.is_latest, v.sort_order
FROM (VALUES
    ('loomy'::TEXT, 'Loomy'::TEXT, '桌面级 AI 智能体，每天免费使用'::TEXT, 'ai-agents'::TEXT, '#d9f8ec'::TEXT, 'L'::TEXT, 'https://example.com'::TEXT, TRUE::BOOLEAN, FALSE::BOOLEAN, 10::INTEGER),
    ('jimeng-ai'::TEXT, '即梦AI'::TEXT, '一站式 AI 视频、图片、数字人创作'::TEXT, 'ai-image-tools'::TEXT, '#101010'::TEXT, '即'::TEXT, 'https://example.com'::TEXT, TRUE::BOOLEAN, FALSE::BOOLEAN, 20::INTEGER),
    ('seko'::TEXT, 'Seko'::TEXT, '首个集编一体的 AI 视频创作平台'::TEXT, 'ai-video-tools'::TEXT, '#e9f1db'::TEXT, 'S'::TEXT, 'https://example.com'::TEXT, TRUE::BOOLEAN, FALSE::BOOLEAN, 30::INTEGER),
    ('aippt'::TEXT, 'AiPPT'::TEXT, 'AI 快速生成高质量 PPT'::TEXT, 'ai-office-tools'::TEXT, '#4b247f'::TEXT, 'P'::TEXT, 'https://example.com'::TEXT, TRUE::BOOLEAN, FALSE::BOOLEAN, 40::INTEGER),
    ('meta-ai-search'::TEXT, '秘塔AI搜索'::TEXT, '最好用的 AI 搜索工具，没有广告'::TEXT, 'ai-search-engines'::TEXT, '#2854cc'::TEXT, 'M'::TEXT, 'https://example.com'::TEXT, TRUE::BOOLEAN, FALSE::BOOLEAN, 50::INTEGER),
    ('meitu-design'::TEXT, '美图设计室'::TEXT, '一站式 AI 平面设计平台，海报、修图全搞定'::TEXT, 'ai-design-tools'::TEXT, '#e7edff'::TEXT, '美'::TEXT, 'https://example.com'::TEXT, TRUE::BOOLEAN, FALSE::BOOLEAN, 60::INTEGER),
    ('lovart'::TEXT, 'Lovart'::TEXT, '全球首个 AI 设计智能体'::TEXT, 'ai-design-tools'::TEXT, '#171717'::TEXT, 'LO'::TEXT, 'https://example.com'::TEXT, TRUE::BOOLEAN, FALSE::BOOLEAN, 70::INTEGER),
    ('meitu-qixiang'::TEXT, '美图奇想AI'::TEXT, 'AI 图像生成与编辑设计平台'::TEXT, 'ai-image-tools'::TEXT, '#ecf6bd'::TEXT, '奇'::TEXT, 'https://example.com'::TEXT, TRUE::BOOLEAN, FALSE::BOOLEAN, 80::INTEGER),
    ('doubao-image'::TEXT, '豆包图像'::TEXT, 'AI 一键生成高质量插画与图像'::TEXT, 'ai-image-tools'::TEXT, '#ffd2c5'::TEXT, '豆'::TEXT, 'https://example.com'::TEXT, TRUE::BOOLEAN, FALSE::BOOLEAN, 90::INTEGER),
    ('updream'::TEXT, 'updream'::TEXT, '出海定制化 AI 视频创作平台'::TEXT, 'ai-video-tools'::TEXT, '#e3c7f3'::TEXT, 'u'::TEXT, 'https://example.com'::TEXT, TRUE::BOOLEAN, FALSE::BOOLEAN, 100::INTEGER),
    ('zhipu-qingyan'::TEXT, '智谱清言'::TEXT, '国产 AI 智能体平台，对话即创作'::TEXT, 'ai-agents'::TEXT, '#eef1f8'::TEXT, '智'::TEXT, 'https://example.com'::TEXT, TRUE::BOOLEAN, FALSE::BOOLEAN, 110::INTEGER),
    ('zhipu-platform'::TEXT, '智谱开放平台'::TEXT, '一站式 AI 模型 API 与开发服务'::TEXT, 'ai-dev-platforms'::TEXT, '#d9e7ff'::TEXT, '开'::TEXT, 'https://example.com'::TEXT, TRUE::BOOLEAN, FALSE::BOOLEAN, 120::INTEGER),
    ('agent-ppt'::TEXT, '智能体PPT'::TEXT, '一键生成专业级 AI Agent PPT'::TEXT, 'ai-office-tools'::TEXT, '#ffe1cf'::TEXT, 'P'::TEXT, 'https://example.com'::TEXT, FALSE::BOOLEAN, TRUE::BOOLEAN, 130::INTEGER),
    ('zhipu-agent'::TEXT, '智谱对话AI'::TEXT, '对话式 AI Agent，覆盖写作、编程与办公'::TEXT, 'ai-agents'::TEXT, '#202020'::TEXT, '对'::TEXT, 'https://example.com'::TEXT, FALSE::BOOLEAN, TRUE::BOOLEAN, 140::INTEGER),
    ('sowork'::TEXT, 'SoWork'::TEXT, '团队协作 AI 办公平台，远程工作好帮手'::TEXT, 'ai-office-tools'::TEXT, '#f4f4f4'::TEXT, 'So'::TEXT, 'https://example.com'::TEXT, FALSE::BOOLEAN, TRUE::BOOLEAN, 150::INTEGER),
    ('domery'::TEXT, 'Domery'::TEXT, '团队协作代码管理与 AI 编程工具'::TEXT, 'ai-coding-tools'::TEXT, '#edf1f4'::TEXT, 'D'::TEXT, 'https://example.com'::TEXT, FALSE::BOOLEAN, TRUE::BOOLEAN, 160::INTEGER),
    ('tark'::TEXT, 'TArk 平台'::TEXT, '灵活高效的多模型 API 聚合平台'::TEXT, 'ai-dev-platforms'::TEXT, '#dcecff'::TEXT, 'T'::TEXT, 'https://example.com'::TEXT, FALSE::BOOLEAN, TRUE::BOOLEAN, 170::INTEGER),
    ('aionclaw'::TEXT, 'AionClaw'::TEXT, '智能体驱动的自动化 AI 工作流'::TEXT, 'ai-agents'::TEXT, '#ffe6d2'::TEXT, 'A'::TEXT, 'https://example.com'::TEXT, FALSE::BOOLEAN, TRUE::BOOLEAN, 180::INTEGER),
    ('miyuansu'::TEXT, '觅元素AI'::TEXT, 'AI 抠图与设计模板素材库'::TEXT, 'ai-design-tools'::TEXT, '#bdf4dc'::TEXT, '觅'::TEXT, 'https://example.com'::TEXT, FALSE::BOOLEAN, FALSE::BOOLEAN, 190::INTEGER),
    ('laper'::TEXT, 'Laper'::TEXT, 'AI 一键生成 PPT 与工作报告'::TEXT, 'ai-office-tools'::TEXT, '#dff1cd'::TEXT, 'L'::TEXT, 'https://example.com'::TEXT, FALSE::BOOLEAN, FALSE::BOOLEAN, 200::INTEGER),
    ('miyuansu-templates'::TEXT, '觅元素AI模板'::TEXT, '600+ 优质 AI 生成设计模板'::TEXT, 'ai-design-tools'::TEXT, '#d2f0dc'::TEXT, '模'::TEXT, 'https://example.com'::TEXT, FALSE::BOOLEAN, FALSE::BOOLEAN, 210::INTEGER),
    ('design-nav'::TEXT, '设计导航'::TEXT, 'AI 图像素材与设计资源聚合站'::TEXT, 'ai-design-tools'::TEXT, '#d8ddff'::TEXT, '设'::TEXT, 'https://example.com'::TEXT, FALSE::BOOLEAN, FALSE::BOOLEAN, 220::INTEGER),
    ('qiantu'::TEXT, '千图设计网'::TEXT, '海量 AI 设计素材与模板下载'::TEXT, 'ai-learning-sites'::TEXT, '#e9dcf6'::TEXT, 'Q'::TEXT, 'https://example.com'::TEXT, FALSE::BOOLEAN, FALSE::BOOLEAN, 230::INTEGER),
    ('qiantu-net'::TEXT, '千图网'::TEXT, 'AI 设计与办公模板免费下载'::TEXT, 'ai-learning-sites'::TEXT, '#e9ecee'::TEXT, 'Q'::TEXT, 'https://example.com'::TEXT, FALSE::BOOLEAN, FALSE::BOOLEAN, 240::INTEGER)
) AS v(slug, name, description, category_slug, color, letter, url, is_featured, is_latest, sort_order)
JOIN public.ai_categories c ON c.slug = v.category_slug
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category_id = EXCLUDED.category_id,
  color = EXCLUDED.color,
  letter = EXCLUDED.letter,
  url = EXCLUDED.url,
  is_featured = EXCLUDED.is_featured,
  is_latest = EXCLUDED.is_latest,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();
