# fishtyping — Claude Code Guide

> Full development guidelines are in [AGENTS.md](./AGENTS.md). This file is the Claude Code entry point.

## Quick Reference

```bash
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Production build (run after every feature)
npm run lint         # ESLint check
npx tsc --noEmit     # TypeScript check

# Database (Supabase)
npm run db:new       # New migration  e.g. npm run db:new -- add_xyz
npm run db:push      # Apply migrations to remote DB
npm run db:pull      # Pull remote schema
npm run db:list      # List applied migrations
npm run db:diff      # Show schema diff
```

## Workflow — Implementing a Feature

1. Read `AGENTS.md` fully before touching code
2. Explore relevant files to understand patterns
3. Implement the minimal change requested
4. Run `npm run build` — fix any errors
5. `git add <files>`, `git commit -m "type: description"`, `git push`

> The user has explicitly authorised: **build → commit → push** after every completed feature.

## Tech Stack (Quick)

| Layer | Technology |
|---|---|
| Framework | Next.js 16 + React 19 (App Router) |
| Styling | Tailwind CSS 4 |
| Database | Supabase (PostgreSQL) |
| Auth | Firebase Authentication |
| AI | Google Gemini 2.0 Flash |
| Language | TypeScript (strict) |

## Key Paths

| What | Where |
|---|---|
| Typing test UI | `src/features/typing-test/components/TypingTest.tsx` |
| Typing engine | `src/features/typing-test/hooks/useTypingEngine.ts` |
| Passage API | `src/app/api/generate-passage/route.ts` |
| Leaderboard API | `src/app/api/leaderboard/route.ts` |
| Admin panel | `src/app/admin/page.tsx` |
| DB queries (client) | `src/lib/supabase/db.ts` |
| DB queries (server) | `src/lib/supabase/server-db.ts` |
| Supabase types | `src/lib/supabase/types.ts` |
| Auth hook | `src/hooks/useAuth.ts` |

## Admin Access

Restricted to `touxhk@gmail.com` / UID `8OZdxsSF8gY5ysBogP5yqkTMaZI3`.

## Database Tables

- `users` — profiles (display_name, avatar_url, preferred_language)
- `passages` — typing content (language, difficulty, length, enabled, status)
- `passage_history` — results per user (wpm, accuracy, duration_ms)

## Passage Difficulty

| Level | Words | Notes |
|---|---|---|
| beginner | 15–25 | Progressive: letters → short words |
| advanced | 25–30 | Regular words, no complex symbols |
| expert | 30–45 | Includes symbols and punctuation |

Only Expert scores are saved to the leaderboard.

## Environment Variables Required

```
GEMINI_API_KEY
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```
