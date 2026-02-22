import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// ============================================
// Settings Tables
// ============================================

/**
 * Application settings - single row storage
 */
export const settings = sqliteTable("settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  
  // Wildberries API settings
  wbApiKey: text("wb_api_key").notNull().default(""),
  wbApiBaseUrl: text("wb_api_base_url").notNull().default("https://feedbacks-api.wildberries.ru"),
  wbPollIntervalMinutes: integer("wb_poll_interval_minutes").notNull().default(5),
  wbRateLimitPerMinute: integer("wb_rate_limit_per_minute").notNull().default(30),
  wbIsEnabled: integer("wb_is_enabled", { mode: "boolean" }).notNull().default(false),
  
  // AI settings
  aiProvider: text("ai_provider").notNull().default("none"),
  aiApiKey: text("ai_api_key").notNull().default(""),
  aiBaseUrl: text("ai_base_url"),
  aiModel: text("ai_model").notNull().default("gpt-4o-mini"),
  aiMaxTokens: integer("ai_max_tokens").notNull().default(500),
  aiTemperature: integer("ai_temperature").notNull().default(70), // Stored as integer (0-100)
  aiIsEnabled: integer("ai_is_enabled", { mode: "boolean" }).notNull().default(false),
  aiUseAsFallback: integer("ai_use_as_fallback", { mode: "boolean" }).notNull().default(true),
  
  // Bot settings
  botMode: text("bot_mode").notNull().default("manual"), // auto, manual, hybrid
  botAutoSend: integer("bot_auto_send", { mode: "boolean" }).notNull().default(false),
  botRequireConfirmation: integer("bot_require_confirmation", { mode: "boolean" }).notNull().default(true),
  botKeepHistory: integer("bot_keep_history", { mode: "boolean" }).notNull().default(true),
  botHistoryRetentionDays: integer("bot_history_retention_days").notNull().default(30),
  
  // Notification settings
  notificationEmail: text("notification_email"),
  notificationTelegram: text("notification_telegram"),
  notificationOnNewReview: integer("notification_on_new_review", { mode: "boolean" }).notNull().default(true),
  notificationOnError: integer("notification_on_error", { mode: "boolean" }).notNull().default(true),
  notificationOnAnswerSent: integer("notification_on_answer_sent", { mode: "boolean" }).notNull().default(false),
  
  // Timestamps
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ============================================
// Scenarios Tables
// ============================================

/**
 * Answer scenarios
 */
export const scenarios = sqliteTable("scenarios", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  priority: integer("priority").notNull().default(100),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  
  // Conditions (stored as JSON)
  conditionsKeywords: text("conditions_keywords").notNull().default("[]"), // JSON array
  conditionsKeywordMode: text("conditions_keyword_mode").notNull().default("any"), // any, all, exact
  conditionsRatingFilter: text("conditions_rating_filter"), // JSON array of numbers
  conditionsHasText: integer("conditions_has_text", { mode: "boolean" }),
  conditionsHasPros: integer("conditions_has_pros", { mode: "boolean" }),
  conditionsHasCons: integer("conditions_has_cons", { mode: "boolean" }),
  conditionsProductArticles: text("conditions_product_articles"), // JSON array
  conditionsExcludeKeywords: text("conditions_exclude_keywords"), // JSON array
  
  // Template
  templateText: text("template_text").notNull(),
  templateVariables: text("template_variables").notNull().default("[]"), // JSON array
  templateMaxLength: integer("template_max_length"),
  
  // AI settings for scenario
  useAi: integer("use_ai", { mode: "boolean" }).notNull().default(false),
  aiPrompt: text("ai_prompt"),
  
  // Tags (stored as JSON array)
  tags: text("tags").notNull().default("[]"),
  
  // Timestamps
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

/**
 * Scenario usage statistics
 */
export const scenarioStats = sqliteTable("scenario_stats", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  scenarioId: text("scenario_id").notNull().references(() => scenarios.id, { onDelete: "cascade" }),
  totalUses: integer("total_uses").notNull().default(0),
  successfulAnswers: integer("successful_answers").notNull().default(0),
  errors: integer("errors").notNull().default(0),
  lastUsedAt: integer("last_used_at", { mode: "timestamp" }),
});

// ============================================
// Knowledge Base Tables
// ============================================

/**
 * Knowledge base categories
 */
export const knowledgeCategories = sqliteTable("knowledge_categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  color: text("color"),
  order: integer("order").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

/**
 * Knowledge base items
 */
export const knowledgeItems = sqliteTable("knowledge_items", {
  id: text("id").primaryKey(),
  categoryId: text("category_id").notNull().references(() => knowledgeCategories.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  keywords: text("keywords").notNull().default("[]"), // JSON array
  tags: text("tags").notNull().default("[]"), // JSON array
  relatedProducts: text("related_products"), // JSON array of article strings
  priority: integer("priority").notNull().default(0),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ============================================
// Reviews Tables
// ============================================

/**
 * Reviews from Wildberries
 */
export const reviews = sqliteTable("reviews", {
  id: text("id").primaryKey(),
  wbId: text("wb_id").notNull().unique(),
  
  // Product info
  productId: text("product_id").notNull(),
  productName: text("product_name").notNull(),
  productArticle: text("product_article"),
  
  // Review content
  rating: integer("rating").notNull(),
  text: text("text").notNull().default(""),
  pros: text("pros"),
  cons: text("cons"),
  
  // Author info
  author: text("author").notNull(),
  authorId: text("author_id"),
  
  // Dates
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  processedAt: integer("processed_at", { mode: "timestamp" }),
  
  // Status
  status: text("status").notNull().default("new"), // new, processing, answered, error, pending
  
  // Answer
  answer: text("answer"),
  answeredAt: integer("answered_at", { mode: "timestamp" }),
  
  // Processing info
  error: text("error"),
  scenarioId: text("scenario_id").references(() => scenarios.id, { onDelete: "set null" }),
  isAiGenerated: integer("is_ai_generated", { mode: "boolean" }).notNull().default(false),
});

// ============================================
// Bot Logs Table
// ============================================

/**
 * Bot operation logs
 */
export const botLogs = sqliteTable("bot_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  timestamp: integer("timestamp", { mode: "timestamp" }).$defaultFn(() => new Date()),
  level: text("level").notNull().default("info"), // info, warning, error
  message: text("message").notNull(),
  reviewId: text("review_id").references(() => reviews.id, { onDelete: "set null" }),
  scenarioId: text("scenario_id").references(() => scenarios.id, { onDelete: "set null" }),
  details: text("details"), // JSON object
});

// ============================================
// Bot State Table
// ============================================

/**
 * Bot state (running status, stats)
 */
export const botState = sqliteTable("bot_state", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  isRunning: integer("is_running", { mode: "boolean" }).notNull().default(false),
  startedAt: integer("started_at", { mode: "timestamp" }),
  lastPollAt: integer("last_poll_at", { mode: "timestamp" }),
  lastError: text("last_error"),
  reviewsProcessed: integer("reviews_processed").notNull().default(0),
  answersSent: integer("answers_sent").notNull().default(0),
  errorsCount: integer("errors_count").notNull().default(0),
});