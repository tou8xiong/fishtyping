# AI Agent Instructions for fishtyping Project

## Project Overview

fishtyping is a multilingual typing test application that generates typing passages using AI (Google Gemini). Users can practice typing in English and Lao with various difficulty levels, themes, and challenge types.

## Core Rules

### 1. Read Instructions First

- BEFORE implementing ANY code or making changes, read this AGENTS.md file completely

- If you don't understand the task, ask clarifying questions BEFORE starting

- Check README.md for basic setup information

### 2. Ask Before Editing

- NEVER edit, modify, or delete existing files without explicit permission from the user

- If you want to make changes, ASK the user first and explain what you want to do

- Wait for user confirmation before making any modifications

- Exception: Bug fixes in obvious issues (typos, syntax errors) can be fixed silently

### 3. Only Write What's Requested

- Implement ONLY what the user explicitly asks for

- Don't add extra features, comments, or code the user didn't request

- Don't make assumptions about what the user wants - ask if unclear

- If the user asks for something that seems incomplete, ask for clarification first

- Keep code changes minimal and focused

### 4. Follow Existing Code Patterns

Before writing new code, examine existing files in the project to understand:

- File structure and organization

- Coding conventions and style

- Libraries and frameworks being used

- Component patterns

- Match the existing code style - don't introduce new patterns unless explicitly asked

### 5. Verify and Test

- After implementing code, run any available lint/typecheck commands

- If tests exist, run them to verify your changes work correctly

- Report any errors or issues to the user

- Always test your changes locally before reporting completion

---

## Workflow

### Phase 1: Understand (Immediate)

1. Read the user's request completely

2. Identify the exact scope of work

3. Check if there are related files or dependencies

4. Ask clarifying questions if anything is unclear

### Phase 2: Research (2-5 minutes)

1. Explore relevant files in the codebase

2. Find similar implementations to use as reference

3. Understand the data flow and architecture

4. Check for existing utilities or helpers

### Phase 3: Plan (1-2 minutes)

1. Present your plan to the user for approval

2. Break down the work into steps

3. Estimate complexity and time

4. Identify potential issues or risks

### Phase 4: Wait (Patience)

1. Don't implement until user confirms

2. Wait for explicit approval

3. If no response in 2+ minutes, ask if should proceed

### Phase 5: Implement (After Approval)

1. Make changes one step at a time

2. Test after each significant change

3. Keep commits small and focused

4. Don't refactor unrelated code

### Phase 6: Verify (Before Reporting)

1. Run lint: npm run lint or npx tsc --noEmit

2. Run tests if available

3. Check for console errors

4. Verify the feature works as expected

---

## Response Guidelines

### Be Concise

- Keep responses short and direct

- Answer the specific question asked - don't ramble

- Use bullet points when listing items

- Maximum 3-4 sentences unless user asks for detail

### When to Ask Questions

- If you need more information to proceed

- If the request is ambiguous or incomplete

- If you need access to resources (API keys, env vars)

- If you find a better approach than what was requested

### Don't Provide Unsolicited

- Don't add extra features

- Don't suggest improvements outside the scope

- Don't provide tutorials or explanations unless asked

- Don't make structural changes without approval

### Communication Style

- Use clear, simple language

- Be friendly but professional

- Use code snippets when helpful

- Include file paths when referencing code

---

## Project Context

### Technology Stack

- Framework: Next.js 16 with React 19 (App Router)
- Styling: Tailwind CSS 4
- Database/Auth: Supabase (PostgreSQL)
- AI: Google Gemini (gemini-2.0-flash)
- Icons: React Icons
- Languages: TypeScript

### Code Organization

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── generate-passage/  # Passage generation endpoint
│   │   ├── leaderboard/   # Leaderboard data endpoint
│   │   ├── update-profile/ # User profile update endpoint
│   │   ├── user-stats/    # User statistics endpoint
│   │   └── worker/        # Background worker endpoints
│   ├── admin/             # Admin panel (restricted access)
│   │   ├── page.tsx       # Admin dashboard with passage list
│   │   └── passages/      # Passage management
│   │       ├── [id]/      # Edit passage page (dynamic route)
│   │       └── page.tsx   # Passage pool management
│   ├── login/             # Login page
│   ├── register/          # Registration page
│   ├── profile/           # User profile
│   ├── settings/          # User settings
│   ├── leaderboard/       # Leaderboard page
│   └── typing/            # Typing test page
├── components/            # React components
│   ├── Header.tsx         # Navigation header (includes admin icon)
│   ├── PracticeSection.tsx
│   └── ToastProvider.tsx
├── contexts/              # React contexts
│   └── SettingsContext.tsx
├── features/              # Feature modules
│   └── typing-test/       # Typing test feature
│       ├── components/    # TypingTest, TypingSettings
│       ├── hooks/         # useTypingEngine
│       └── utils/         # passageGenerator
├── hooks/                 # Custom React hooks
│   └── useAuth.ts
├── lib/                   # Utility functions
│   ├── firebase/          # Firebase configuration
│   │   └── config.ts      # Firebase Auth setup
│   └── supabase/          # Supabase client and DB functions
│       ├── client.ts      # Client-side Supabase
│       ├── server.ts      # Server-side Supabase
│       ├── db.ts          # Database queries
│       ├── server-db.ts   # Server DB queries
│       └── types.ts       # TypeScript types
└── middleware.ts          # Auth middleware (if exists)
```

### API Routes Pattern

- RESTful design in src/app/api/*/route.ts
- Use GET, POST, PUT, DELETE methods appropriately
- Return JSON responses with proper status codes
- Handle errors with try/catch and return 500 on failure

**Key API Routes:**
- `/api/generate-passage` - Generates or retrieves typing passages
  - Checks DB for existing passages first
  - Falls back to Gemini AI generation if not found
  - Saves generated passages to DB for reuse
- `/api/worker/generate-pool` - Background worker for pre-generating passages
- `/api/leaderboard` - Fetches leaderboard data with filtering
- `/api/update-profile` - Updates user profile information
- `/api/user-stats` - Retrieves user typing statistics

### Component Patterns

- Use functional components with hooks

- Follow naming: ComponentName.tsx

- Colocate types and components when possible

- Use composition over inheritance

---

## Code Style Guide

### TypeScript

```typescript

// Prefer interfaces for objects

interface User {

id: string;

name: string;

email: string;

}

// Use type for unions

type Priority = "high" | "medium" | "low";

// Always type function parameters and returns

function createTask(title: string, priority: Priority = "medium"): Task {

// ...

}

```

### React Components

```typescript

// Use 'use client' for interactive components

"use client";

import { useState, useCallback } from "react";

import { cn } from "@/lib/utils";

interface Props {

className?: string;

onSubmit: (data: Data) => void;

}

export function ComponentName({ className, onSubmit }: Props) {

const [state, setState] = useState<string>("");

const handleClick = useCallback(() => {

// ...

}, []);

return (

<div className={cn("base-classes", className)}>

{/* content */}

</div>

);

}

```

### CSS/Tailwind

- Use utility classes first

- Extract repeated patterns to components

- Use cn() from @/lib/utils for conditional classes

- Keep responsive design in mind

### Error Handling

```typescript

try {

// risky operation

} catch (error: any) {

console.error("FeatureName: error", error?.message ?? error);

// return user-friendly error

return NextResponse.json(

{ error: "Human readable error message" },

{ status: 500 }

);

}

```

---

## Important Notes

### Database Schema

- This project uses Firebase Auth for authentication and Supabase for database
- Key tables:
  - `users` - User profiles with preferred language, avatar, display name
  - `passages` - Generated typing passages with metadata
  - `passage_history` - User typing test results
  - `generation_jobs` - Queue for AI passage generation
- Always use parameterized queries
- Never expose raw SQL to the client

### Authentication System

- Uses Firebase Authentication for user management
- Supports email/password, Google, and GitHub sign-in
- User profiles stored in Supabase `users` table
- Auth state managed via `useAuth` hook
- Admin access restricted to specific email (touxhk@gmail.com) or user ID (8OZdxsSF8gY5ysBogP5yqkTMaZI3)

### Admin Panel

- Located at `/admin` - restricted to admin users only
- Features:
  - View all passages with filters (language, difficulty)
  - Click any row to edit passage at `/admin/passages/[id]`
  - Create new passages via modal
  - Stats dashboard showing passage counts
  - Full CRUD operations on passages
- Admin icon appears in header only for authorized users
- Edit page provides full-size form with large textarea for better content management

### Passage Generation System

- Passages are generated on-demand or pre-generated by background workers
- Flow: Check DB → Generate with Gemini AI → Save to DB → Return to user
- Supports multiple languages (English, Lao)
- Difficulty levels: beginner, advanced, expert (3 levels only)
  - Beginner: 15-30 words
  - Advanced: 100-150 words
  - Expert: 200-300 words
- Challenge types: standard, punctuation, numbers, speed
- Themes: technology, nature, science, history, general
- Score tracking: Only Expert level scores are saved to database and displayed on leaderboard
- Pre-fetching: Next passage is pre-fetched when user is halfway through typing for faster loading

### Typing Test Features

- Real-time WPM (words per minute) calculation
- Accuracy tracking
- Visual feedback for correct/incorrect characters
- Passage history tracking per user
- Leaderboard system

### Security

- Never commit secrets, API keys, or .env files
- Validate all user inputs
- Use proper authentication checks via Firebase Auth and Supabase
- Sanitize data before displaying
- Admin routes protected with email/ID verification
- Environment variables:
  - `GEMINI_API_KEY` - Required for AI passage generation
  - Firebase credentials (NEXT_PUBLIC_FIREBASE_API_KEY, etc.)
  - Supabase credentials (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)

### Performance

- Use proper loading states
- Implement pagination for lists
- Lazy load heavy components
- Cache passages in database to avoid repeated AI calls
- Background workers pre-generate passages to reduce wait time
- Admin panel uses filters to reduce data load

---

## Never Do Without Permission

### Don't Do These Automatically

- ❌ Auto-edit files

- ❌ Add extra features

- ❌ Commit changes

- ❌ Push to remote

- ❌ Create new files (unless explicitly asked)

- ❌ Delete anything

- ❌ Make assumptions about what user wants

- ❌ Skip asking questions when unclear

- ❌ Refactor existing code

- ❌ Add comments (unless requested)

- ❌ Write tests (unless requested)

### When It's Okay to Break Rules

- Fix obvious typos in strings

- Add missing error handling

- Fix linting errors in changed code

- Update imports if files are moved

---

## Commit Protocol

Only commit when explicitly requested by the user:

### Before Committing

1. Run git status to see changes

2. Run git diff to see what was modified

3. Run git log to see commit message style

4. Review what will be committed

### Commit Message Format

```

type: short description

- Detail 1

- Detail 2

```

Types: feat, fix, refactor, docs, chore, test

### Examples

```

feat: add task filtering by priority

- Add filter dropdown to task list

- Persist filter in URL params

- Update tests

```

```

fix: resolve task creation error

- Add validation for empty title

- Return proper error message

```

---

## Debugging Tips

### When Something Doesn't Work

1. Check browser console for errors

2. Check server terminal for errors

3. Verify API responses with network tab

4. Check database queries

5. Verify environment variables

### Common Issues

- Build errors: Check TypeScript types
- Runtime errors: Check console logs
- API errors: Check route handlers and Gemini API key
- Auth errors: Check Firebase Auth configuration and Supabase client
- Styling issues: Check Tailwind classes
- Passage generation: Check Gemini API quota and language support
- "No passage found in DB, using fallback": Normal on first request, passages are generated and cached
- Admin access denied: Verify user email matches touxhk@gmail.com or ID matches 8OZdxsSF8gY5ysBogP5yqkTMaZI3

---

Last updated: 2026-04-27