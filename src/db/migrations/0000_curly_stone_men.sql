CREATE TABLE `bot_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`timestamp` integer,
	`level` text DEFAULT 'info' NOT NULL,
	`message` text NOT NULL,
	`review_id` text,
	`scenario_id` text,
	`details` text,
	FOREIGN KEY (`review_id`) REFERENCES `reviews`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`scenario_id`) REFERENCES `scenarios`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `bot_state` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`is_running` integer DEFAULT false NOT NULL,
	`started_at` integer,
	`last_poll_at` integer,
	`last_error` text,
	`reviews_processed` integer DEFAULT 0 NOT NULL,
	`answers_sent` integer DEFAULT 0 NOT NULL,
	`errors_count` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `knowledge_categories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`color` text,
	`order` integer DEFAULT 0 NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `knowledge_items` (
	`id` text PRIMARY KEY NOT NULL,
	`category_id` text NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`keywords` text DEFAULT '[]' NOT NULL,
	`tags` text DEFAULT '[]' NOT NULL,
	`related_products` text,
	`priority` integer DEFAULT 0 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`category_id`) REFERENCES `knowledge_categories`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` text PRIMARY KEY NOT NULL,
	`wb_id` text NOT NULL,
	`product_id` text NOT NULL,
	`product_name` text NOT NULL,
	`product_article` text,
	`rating` integer NOT NULL,
	`text` text DEFAULT '' NOT NULL,
	`pros` text,
	`cons` text,
	`author` text NOT NULL,
	`author_id` text,
	`created_at` integer NOT NULL,
	`processed_at` integer,
	`status` text DEFAULT 'new' NOT NULL,
	`answer` text,
	`answered_at` integer,
	`error` text,
	`scenario_id` text,
	`is_ai_generated` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`scenario_id`) REFERENCES `scenarios`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `reviews_wb_id_unique` ON `reviews` (`wb_id`);--> statement-breakpoint
CREATE TABLE `scenario_stats` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`scenario_id` text NOT NULL,
	`total_uses` integer DEFAULT 0 NOT NULL,
	`successful_answers` integer DEFAULT 0 NOT NULL,
	`errors` integer DEFAULT 0 NOT NULL,
	`last_used_at` integer,
	FOREIGN KEY (`scenario_id`) REFERENCES `scenarios`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `scenarios` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`priority` integer DEFAULT 100 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`conditions_keywords` text DEFAULT '[]' NOT NULL,
	`conditions_keyword_mode` text DEFAULT 'any' NOT NULL,
	`conditions_rating_filter` text,
	`conditions_has_text` integer,
	`conditions_has_pros` integer,
	`conditions_has_cons` integer,
	`conditions_product_articles` text,
	`conditions_exclude_keywords` text,
	`template_text` text NOT NULL,
	`template_variables` text DEFAULT '[]' NOT NULL,
	`template_max_length` integer,
	`use_ai` integer DEFAULT false NOT NULL,
	`ai_prompt` text,
	`tags` text DEFAULT '[]' NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`wb_api_key` text DEFAULT '' NOT NULL,
	`wb_api_base_url` text DEFAULT 'https://feedbacks-api.wildberries.ru' NOT NULL,
	`wb_poll_interval_minutes` integer DEFAULT 5 NOT NULL,
	`wb_rate_limit_per_minute` integer DEFAULT 30 NOT NULL,
	`wb_is_enabled` integer DEFAULT false NOT NULL,
	`ai_provider` text DEFAULT 'none' NOT NULL,
	`ai_api_key` text DEFAULT '' NOT NULL,
	`ai_base_url` text,
	`ai_model` text DEFAULT 'gpt-4o-mini' NOT NULL,
	`ai_max_tokens` integer DEFAULT 500 NOT NULL,
	`ai_temperature` integer DEFAULT 70 NOT NULL,
	`ai_is_enabled` integer DEFAULT false NOT NULL,
	`ai_use_as_fallback` integer DEFAULT true NOT NULL,
	`bot_mode` text DEFAULT 'manual' NOT NULL,
	`bot_auto_send` integer DEFAULT false NOT NULL,
	`bot_require_confirmation` integer DEFAULT true NOT NULL,
	`bot_keep_history` integer DEFAULT true NOT NULL,
	`bot_history_retention_days` integer DEFAULT 30 NOT NULL,
	`notification_email` text,
	`notification_telegram` text,
	`notification_on_new_review` integer DEFAULT true NOT NULL,
	`notification_on_error` integer DEFAULT true NOT NULL,
	`notification_on_answer_sent` integer DEFAULT false NOT NULL,
	`updated_at` integer
);
