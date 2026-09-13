import { relations } from 'drizzle-orm'
import { boolean, integer, pgTable, text, timestamp, bigserial, bigint, index } from 'drizzle-orm/pg-core'

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(), expiresAt: timestamp('expiresAt').notNull(), token: text('token').notNull().unique(), createdAt: timestamp('createdAt').notNull().defaultNow(), updatedAt: timestamp('updatedAt').notNull().defaultNow(), ipAddress: text('ipAddress'), userAgent: text('userAgent'), userId: text('userId').notNull(),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(), accountId: text('accountId').notNull(), providerId: text('providerId').notNull(), userId: text('userId').notNull(), accessToken: text('accessToken'), refreshToken: text('refreshToken'), idToken: text('idToken'), accessTokenExpiresAt: timestamp('accessTokenExpiresAt'), refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'), scope: text('scope'), password: text('password'), createdAt: timestamp('createdAt').notNull().defaultNow(), updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(), identifier: text('identifier').notNull(), value: text('value').notNull(), expiresAt: timestamp('expiresAt').notNull(), createdAt: timestamp('createdAt').defaultNow(), updatedAt: timestamp('updatedAt').defaultNow(),
})

export const toolSubmissions = pgTable('tool_submissions', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(), userId: text('userId').notNull(), name: text('name').notNull(), slug: text('slug').notNull().unique(), url: text('url').notNull(), logoUrl: text('logo_url'), previewUrl: text('preview_url'), summary: text('summary').notNull(), content: text('content').notNull(), category: text('category').notNull().default('AI 其他工具'), status: text('status').notNull().default('pending'), createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

// ============================================================================
// AI 工具集导航 —— 由 supabase/migrations/20250913_ai_tools_nav.sql 建表
// ============================================================================

export const aiCategories = pgTable(
  'ai_categories',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    slug: text('slug').notNull().unique(),
    name: text('name').notNull(),
    icon: text('icon'),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    slugIdx: index('idx_ai_categories_slug').on(t.slug),
  }),
)

export const aiTools = pgTable(
  'ai_tools',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    slug: text('slug').notNull().unique(),
    name: text('name').notNull(),
    description: text('description'),
    categoryId: bigint('category_id', { mode: 'number' })
      .notNull()
      .references(() => aiCategories.id, { onDelete: 'restrict' }),
    color: text('color'),
    letter: text('letter'),
    url: text('url'),
    logoUrl: text('logo_url'),
    previewUrl: text('preview_url'),
    isFeatured: boolean('is_featured').notNull().default(false),
    isLatest: boolean('is_latest').notNull().default(false),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    slugIdx: index('idx_ai_tools_slug').on(t.slug),
    categoryIdx: index('idx_ai_tools_category').on(t.categoryId),
    featuredIdx: index('idx_ai_tools_featured').on(t.isFeatured),
    latestIdx: index('idx_ai_tools_latest').on(t.isLatest),
  }),
)

export const aiToolsRelations = relations(aiTools, ({ one }) => ({
  category: one(aiCategories, {
    fields: [aiTools.categoryId],
    references: [aiCategories.id],
  }),
}))
