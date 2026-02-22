# Active Context: WB Bot - Review Auto-Response System

## Current State

**Project Status**: ✅ Database added, ready for integration

The project is a Wildberries review auto-response system with AI integration. Database support has been added using Drizzle ORM with SQLite.

## Recently Completed

- [x] Base Next.js 16 setup with App Router
- [x] TypeScript configuration with strict mode
- [x] Tailwind CSS 4 integration
- [x] ESLint configuration
- [x] Memory bank documentation
- [x] Recipe system for common features
- [x] WB Bot core features (UI pages, API routes, components)
- [x] Database support with Drizzle ORM + SQLite

## Current Structure

| File/Directory | Purpose | Status |
|----------------|---------|--------|
| `src/app/page.tsx` | Dashboard page | ✅ Ready |
| `src/app/layout.tsx` | Root layout with Sidebar | ✅ Ready |
| `src/app/globals.css` | Global styles | ✅ Ready |
| `src/app/api/` | API routes (bot, reviews, settings, etc.) | ✅ Ready |
| `src/app/reviews/` | Reviews management page | ✅ Ready |
| `src/app/scenarios/` | Scenarios management page | ✅ Ready |
| `src/app/knowledge-base/` | Knowledge base page | ✅ Ready |
| `src/app/settings/` | Settings page | ✅ Ready |
| `src/components/` | UI components | ✅ Ready |
| `src/lib/` | Business logic (bot, AI, WB API) | ✅ Ready |
| `src/db/` | Database schema and client | ✅ Ready |
| `.kilocode/` | AI context & recipes | ✅ Ready |

## Database Schema

| Table | Purpose |
|-------|---------|
| `settings` | Application settings (WB API, AI, Bot config) |
| `scenarios` | Answer scenarios with conditions and templates |
| `scenario_stats` | Usage statistics for scenarios |
| `knowledge_categories` | Knowledge base categories |
| `knowledge_items` | Knowledge base entries |
| `reviews` | Reviews from Wildberries with processing status |
| `bot_logs` | Bot operation logs |
| `bot_state` | Bot running state and statistics |

## Current Focus

The database is set up. Next steps:

1. Migrate existing JSON storage to database
2. Update API routes to use database instead of JSON files
3. Test database operations

## Quick Start Guide

### Database Commands

```bash
bun db:generate   # Generate migrations from schema changes
bun db:migrate    # Run migrations (auto-runs on push)
```

### Using Database in Code

```typescript
import { db, settings, scenarios, reviews } from "@/db";
import { eq } from "drizzle-orm";

// Get settings
const [appSettings] = await db.select().from(settings);

// Get all active scenarios
const activeScenarios = await db.select().from(scenarios).where(eq(scenarios.isActive, true));
```

## Available Recipes

| Recipe | File | Use Case |
|--------|------|----------|
| Add Database | `.kilocode/recipes/add-database.md` | Data persistence with Drizzle + SQLite |

## Session History

| Date | Changes |
|------|---------|
| 2026-02-22 | Added database support with Drizzle ORM + SQLite |
| 2026-02-22 | Created WB Bot review auto-response system |
| Initial | Template created with base setup |
