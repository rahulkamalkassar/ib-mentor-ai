# IB Mentor AI — Claude Code Context

## What This App Is
A full-stack IB (International Baccalaureate) study platform built with Next.js 16, Supabase, Tailwind CSS, and Claude AI. Helps students with revision, grade tracking, practice tests, and AI tutoring.

## Stack
- **Framework**: Next.js 16 (App Router) + TypeScript
- **Styling**: Tailwind CSS v4 (using `@import "tailwindcss"` not config file)
- **Database**: Supabase (PostgreSQL with RLS)
- **AI**: Anthropic Claude via `@anthropic-ai/sdk`
- **Animations**: Framer Motion
- **Icons**: lucide-react
- **Date handling**: date-fns

## Directory Structure
```
src/
  app/
    (pages)                    # All page routes
    api/ai/chat/               # AI chat endpoint
    api/ai/analyze-test/       # Test analysis (vision)
    api/ai/generate-notes/     # Content generation
  components/
    layout/                    # Sidebar, Header, MainLayout
    ai/                        # AIHelper floating chat
  data/ib-data.ts              # IB subjects, topics, tests data
  lib/
    supabase/client.ts         # Browser Supabase client
    supabase/server.ts         # Server Supabase client
    utils.ts                   # cn(), color helpers
  types/index.ts               # All TypeScript interfaces
```

## Design System (Dark Premium SaaS)
- Background: `#0d0f1a`
- Cards: `#161827`
- Accent purple: `#7c3aed`
- Sidebar: `#0f1120` with `#1e2a3a` borders
- Text: `#f1f5f9` primary, `#94a3b8` secondary, `#64748b` muted
- Subject accents: purple, cyan, green, yellow, pink (cycle with `getSubjectAccent()`)
- Rounded: 12px cards, 8px buttons

## Key Patterns

### Adding a new page
1. Create `src/app/[pagename]/page.tsx`
2. Wrap with `<MainLayout>` and `<Header>`
3. Use `card` class for containers, `btn-primary` for main CTAs
4. All CSS classes defined in `globals.css`

### Using Supabase
- Client-side: `import { createClient } from '@/lib/supabase/client'`
- Server-side: `import { createClient } from '@/lib/supabase/server'`
- Schema is in `supabase-schema.sql`

### Using Claude API
- Chat: POST `/api/ai/chat` with `{ messages: [{role, content}] }`
- Test analysis: POST `/api/ai/analyze-test` with image URLs
- Note generation: POST `/api/ai/generate-notes` with source content

### Onboarding Data (localStorage)
- Key: `ib_onboarding_data` → JSON of `OnboardingData` type
- Key: `ib_onboarding_complete` → `'true'`
- Root page redirects based on these values

## Env Variables Required
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
```

## AI Models
- Chat: `claude-sonnet-4-6` (balance of speed and quality)
- Test analysis: `claude-sonnet-4-6` (vision-capable)
- Note generation: `claude-sonnet-4-6`

## Common gotchas
- Tailwind v4 uses `@import "tailwindcss"` not `@tailwind base/components/utilities`
- Custom CSS classes in `globals.css` use plain CSS (not `@layer components`)
- `react-pdf` needs `canvas = false` in webpack config (already set)
- `use client` required for any component using hooks or browser APIs
- Dynamic imports needed for `react-confetti` (SSR issues)
