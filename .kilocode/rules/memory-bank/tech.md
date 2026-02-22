# Technical Context: WB Bot - Review Auto-Response System

## Technology Stack

| Technology   | Version | Purpose                         |
| ------------ | ------- | ------------------------------- |
| Next.js      | 16.x    | React framework with App Router |
| React        | 19.x    | UI library                      |
| TypeScript   | 5.9.x   | Type-safe JavaScript            |
| Tailwind CSS | 4.x     | Utility-first CSS               |
| Drizzle ORM  | 0.45.x  | Database ORM                    |
| SQLite       | -       | Database (via Turso/LibSQL)     |
| Bun          | Latest  | Package manager & runtime       |

## Development Environment

### Prerequisites

- Bun installed (`curl -fsSL https://bun.sh/install | bash`)
- Node.js 20+ (for compatibility)

### Commands

```bash
bun install        # Install dependencies
bun dev            # Start dev server (http://localhost:3000)
bun build          # Production build
bun start          # Start production server
bun lint           # Run ESLint
bun typecheck      # Run TypeScript type checking
bun db:generate    # Generate database migrations
bun db:migrate     # Run database migrations (auto-runs on push)
```

## Project Configuration

### Next.js Config (`next.config.ts`)

- App Router enabled
- Default settings for flexibility

### TypeScript Config (`tsconfig.json`)

- Strict mode enabled
- Path alias: `@/*` → `src/*`
- Target: ESNext

### Tailwind CSS 4 (`postcss.config.mjs`)

- Uses `@tailwindcss/postcss` plugin
- CSS-first configuration (v4 style)

### ESLint (`eslint.config.mjs`)

- Uses `eslint-config-next`
- Flat config format

### Drizzle ORM (`drizzle.config.ts`)

- SQLite dialect
- Schema: `src/db/schema.ts`
- Migrations: `src/db/migrations/`

## Key Dependencies

### Production Dependencies

```json
{
  "next": "^16.1.3",
  "react": "^19.2.3",
  "react-dom": "^19.2.3",
  "drizzle-orm": "^0.45.1",
  "@kilocode/app-builder-db": "github:Kilo-Org/app-builder-db#main"
}
```

### Dev Dependencies

```json
{
  "typescript": "^5.9.3",
  "@types/node": "^24.10.2",
  "@types/react": "^19.2.7",
  "@types/react-dom": "^19.2.3",
  "@tailwindcss/postcss": "^4.1.17",
  "tailwindcss": "^4.1.17",
  "eslint": "^9.39.1",
  "eslint-config-next": "^16.0.0",
  "drizzle-kit": "^0.31.9"
}
```

## File Structure

```
/
├── .gitignore              # Git ignore rules
├── package.json            # Dependencies and scripts
├── bun.lock                # Bun lockfile
├── next.config.ts          # Next.js configuration
├── tsconfig.json           # TypeScript configuration
├── postcss.config.mjs      # PostCSS (Tailwind) config
├── eslint.config.mjs       # ESLint configuration
├── drizzle.config.ts       # Drizzle ORM configuration
├── public/                 # Static assets
│   └── .gitkeep
└── src/                    # Source code
    ├── app/                # Next.js App Router
    │   ├── layout.tsx      # Root layout with Sidebar
    │   ├── page.tsx        # Dashboard page
    │   ├── globals.css     # Global styles
    │   ├── favicon.ico     # Site icon
    │   ├── api/            # API routes
    │   │   ├── bot/        # Bot control (start, stop, status)
    │   │   ├── reviews/    # Reviews management
    │   │   ├── scenarios/  # Scenarios management
    │   │   ├── settings/   # Settings management
    │   │   └── knowledge-base/ # Knowledge base management
    │   ├── reviews/        # Reviews page
    │   ├── scenarios/      # Scenarios page
    │   ├── knowledge-base/ # Knowledge base page
    │   └── settings/       # Settings page
    ├── components/         # React components
    │   ├── layout/         # Layout components (Sidebar)
    │   └── ui/             # UI components (Button, Card, etc.)
    ├── lib/                # Business logic
    │   ├── ai/             # AI integration (generator, config)
    │   ├── api/            # API client
    │   ├── bot/            # Bot engine
    │   ├── data/           # Data storage (JSON)
    │   ├── knowledge-base/ # Knowledge base search
    │   ├── scenarios/      # Scenario engine
    │   └── wb-api/         # Wildberries API client
    ├── db/                 # Database
    │   ├── schema.ts       # Drizzle schema definitions
    │   ├── index.ts        # Database client
    │   ├── migrate.ts      # Migration script
    │   └── migrations/     # Generated migrations
    ├── types/              # TypeScript type definitions
    └── data/               # JSON data files (to be migrated)
```

## Database Schema

### Tables

| Table | Columns | Purpose |
|-------|---------|---------|
| `settings` | 25 | Application settings (WB API, AI, Bot) |
| `scenarios` | 21 | Answer scenarios with conditions |
| `scenario_stats` | 6 | Usage statistics per scenario |
| `knowledge_categories` | 7 | Knowledge base categories |
| `knowledge_items` | 11 | Knowledge base entries |
| `reviews` | 19 | Reviews from Wildberries |
| `bot_logs` | 7 | Bot operation logs |
| `bot_state` | 8 | Bot running state and stats |

### Relationships

- `scenario_stats.scenarioId` → `scenarios.id`
- `knowledge_items.categoryId` → `knowledge_categories.id`
- `reviews.scenarioId` → `scenarios.id`
- `bot_logs.reviewId` → `reviews.id`
- `bot_logs.scenarioId` → `scenarios.id`

## Technical Constraints

### Database

- SQLite via Turso/LibSQL
- Migrations run automatically on push
- Never run `bun db:migrate` manually (won't work locally)

### Browser Support

- Modern browsers (ES2020+)
- No IE11 support

## Performance Considerations

### Image Optimization

- Use Next.js `Image` component for optimization
- Place images in `public/` directory

### Bundle Size

- Tree-shaking enabled by default
- Tailwind CSS purges unused styles

### Core Web Vitals

- Server Components reduce client JavaScript
- Streaming and Suspense for better UX

## Deployment

### Build Output

- Server-rendered pages by default
- Can be configured for static export

### Environment Variables

- `DB_URL` - Database URL (auto-provided by sandbox)
- `DB_TOKEN` - Database token (auto-provided by sandbox)
- Use `.env.local` for local development
