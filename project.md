# FishTyping Project Documentation

## Project Overview

FishTyping is a typing practice web application built with Next.js 16 and React 19. The app helps users improve their typing speed through interactive exercises with customizable difficulty levels, themes, and challenge types.

### Tech Stack

- **Framework**: Next.js 16 with React 19 (App Router)
- **Styling**: Tailwind CSS 4 with cva, clsx, tailwind-merge
- **Database/Auth**: Supabase (PostgreSQL)
- **AI**: Google Gemini (gemini-2.0-flash-exp, gemini-1.5-pro)
- **Rich Text**: TipTap editor
- **PDF**: pdfjs-dist, pdf-lib
- **UI**: Radix UI components
- **Icons**: Lucide React, React Icons
- **Animations**: AOS, Framer Motion

---

## Database Schema (Supabase)

### Tables Overview

| Table | Purpose |
|-------|---------|
| `users` | User profiles (links to Supabase Auth) |
| `passages` | Pre-generated typing passages |
| `ai_prompts` | AI prompt templates for generation |
| `passage_history` | Track passages user has already typed |
| `generation_jobs` | Queue for AI generation jobs |

### SQL Creation Script

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (public profile linked to auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT,
  display_name TEXT,
  avatar_url TEXT,
  preferred_language TEXT DEFAULT 'english',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Prompts table
CREATE TABLE ai_prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template TEXT NOT NULL,
  category VARCHAR(100),
  difficulty VARCHAR(50),
  version INT DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  success_rate DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Passages table
CREATE TABLE passages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  language TEXT DEFAULT 'english' CHECK (language IN ('english', 'lao')),
  difficulty VARCHAR(50) DEFAULT 'intermediate' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced', 'expert')),
  length VARCHAR(50) DEFAULT 'medium' CHECK (length IN ('short', 'medium', 'long')),
  theme VARCHAR(100) DEFAULT 'general' CHECK (theme IN ('technology', 'nature', 'science', 'history', 'general')),
  challenge_type VARCHAR(50) DEFAULT 'standard' CHECK (challenge_type IN ('standard', 'punctuation', 'numbers', 'speed')),
  status VARCHAR(50) DEFAULT 'ready' CHECK (status IN ('generating', 'ready', 'in_use', 'archived')),
  generated_by TEXT DEFAULT 'ai' CHECK (generated_by IN ('manual', 'ai')),
  ai_model VARCHAR(50),
  ai_prompt_id UUID REFERENCES ai_prompts(id),
  used_count INT DEFAULT 0,
  word_count INT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User passage history (tracks what user has typed)
CREATE TABLE passage_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  passage_id UUID REFERENCES passages(id) ON DELETE CASCADE,
  attempted_at TIMESTAMPTZ DEFAULT NOW(),
  wpm INT,
  accuracy DECIMAL(5,2),
  duration_ms INT
);

-- Generation job queue
CREATE TABLE generation_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  priority INT DEFAULT 0,
  language TEXT DEFAULT 'english',
  difficulty VARCHAR(50),
  length VARCHAR(50),
  theme VARCHAR(100),
  challenge_type VARCHAR(50),
  attempts INT DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX idx_passages_status_difficulty ON passages(status, difficulty);
CREATE INDEX idx_passages_difficulty_theme ON passages(difficulty, theme);
CREATE INDEX idx_passage_history_user ON passage_history(user_id);
CREATE INDEX idx_generation_jobs_status ON generation_jobs(status);
```

---

## User Flow

### Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    UNLOGGED USER                           │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  Home Page (/)                                           │
│  - Click Login → /login                                   │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  Login Page (/login)                                      │
│  - Email/Password Login                                   │
│  - OAuth: Google / GitHub                                │
└─────────────────────────────────────────────────────────────────┘
                            │
                  ┌───────────────┴───────────────┐
                  ▼                           ▼
        ┌───────────────────┐     ┌───────────────────────┐
        │ Auth Success      │     │ Auth Success (OAuth)  │
        │ Login Form       │     │ /auth/callback       │
        └───────────────────┘     └───────────────────────┘
                  │                           │
                  └───────────────┬───────────────┘
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  Authenticated User → Redirect to Home                          │
│                                                             │
│  Header shows: [Avatar Circle] [Username]                       │
└─────────────────────────────────────────────────────────────────┘
                                │
        ┌─────────────────────────┼─────────────────────────┐
        ▼                         ▼                         ▼
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│ /profile    │         │ /settings   │         │ /typing     │
│ (Protected) │         │ (Public)    │         │ (Protected) │
└──────────────┘         └──────────────┘         └──────────────┘
```

### Pre-Generation Pipeline (Background)

```
┌──────────────────────────────────────────────────────────────┐
│                  PRE-GENERATION FLOW                           │
└──────────────────────────────────────────────────────────────┘

[Scheduler/Cron] → Check pool inventory
                            │
                            ▼
[If below threshold] → Queue generation_jobs
                            │
                            ▼
[Worker] → Call Gemini API
                            │
                            ▼
[Validate output] → Save to passages (status='ready')
                            │
                            ▼
[User Request] → GET /passage?difficulty=...
                            │
                            ▼
[DB Query] → SELECT ready passage
                            │
                            ▼
[Mark in_use] → Return + trigger refill if needed
```

---

## Page Routes

| Route | Auth Required | Description |
|-------|------------|-------------|
| `/` | No | Home page |
| `/login` | No (redirects if logged in) | Login page |
| `/register` | No (redirects if logged in) | Register page |
| `/leaderboard` | Yes | Leaderboard (protected) |
| `/typing` | Yes | Typing practice (protected) |
| `/settings` | No | Settings (public) |
| `/profile` | Yes | User profile (protected) |
| `/auth/callback` | No | OAuth callback handler |

---

## Directory Structure

```
src/
├── app/
│   ├── login/
│   │   ├── page.tsx          - Login UI
│   │   └── actions.ts       - Server actions (login, signup, OAuth)
│   ├── register/
│   │   └── page.tsx         - Register UI
│   ├── profile/
│   │   └── page.tsx         - User profile (protected)
│   ├── settings/
│   │   └── page.tsx         - Settings (public)
│   ├── typing/               - Typing practice pages
│   ├── leaderboard/         - Leaderboard page
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts      - OAuth callback handler
│   └── api/
│       └── generate-passage/ - Passage generation API
├── components/
│   └── Header.tsx          - Navigation header
├── hooks/
│   └── useAuth.ts         - Auth state hook
├── lib/
│   └── supabase/
│       ├── client.ts       - Browser client
│       ├── server.ts      - Server client  
│       ├── db.ts         - Database queries
│       ├── server-db.ts  - Server DB utilities
│       └── types.ts     - TypeScript types
├── features/
│   └── typing-test/       - Typing test feature
│       ├── components/
│       ├── hooks/
│       └── utils/
│           └── passageGenerator.ts
└── middleware.ts          - Route protection
```

---

## Environment Variables

### Supabase Setup

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# App (for development)
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Getting Supabase Credentials

1. Go to **Supabase Dashboard** → **Project Settings** → **API**
2. Copy **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
3. Copy **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## OAuth Configuration

### Supabase Dashboard Settings

1. **Authentication** → **Providers** → Enable:
   - Email (for email/password auth)
   - Google (for OAuth)
   - GitHub (for OAuth)

2. **Authentication** → **URL Configuration**:
   - Site URL: `http://localhost:3000`
   - Redirect URLs:
     - `http://localhost:3000/auth/callback`
     - `http://localhost:3000/auth/v1/callback`

### Google Cloud Console Settings

1. **APIs & Services** → **Credentials** → **OAuth 2.0 Client**
2. **Authorized JavaScript origins**:
   ```
   http://localhost:3000
   https://your-project.supabase.co
   ```
3. **Authorized redirect URIs**:
   ```
   http://localhost:3000/auth/callback
   https://your-project.supabase.co/auth/callback
   https://your-project.supabase.co/auth/v1/callback
   ```

---

## Core Types (TypeScript)

```typescript
export type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type Length = 'short' | 'medium' | 'long';
export type Theme = 'technology' | 'nature' | 'science' | 'history' | 'general';
export type ChallengeType = 'standard' | 'punctuation' | 'numbers' | 'speed';
export type Language = 'english' | 'lao';
export type PassageStatus = 'generating' | 'ready' | 'in_use' | 'archived';
export type GeneratedBy = 'manual' | 'ai';

export interface User {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  preferred_language: string;
  created_at: string;
  updated_at: string;
}

export interface Passage {
  id: string;
  content: string;
  language: Language;
  difficulty: Difficulty;
  length: Length;
  theme: Theme;
  challenge_type: ChallengeType;
  status: PassageStatus;
  generated_by: GeneratedBy;
  ai_model: string | null;
  ai_prompt_id: string | null;
  used_count: number;
  word_count: number;
  created_at: string;
  updated_at: string;
}
```

---

## Current Issues & Status

| Issue | Status | Notes |
|------|--------|-------|
| OAuth Google login fails (code exchange) | 🔴 Needs fix | Error: "Unable to exchange external code: 4/0A" |
| Header user data not loading | 🟡 Debugging | Profile not loading from Supabase |
| Profile page stats | 🔜 Future | Connect to passage_history |
| Email/password login | ✅ Working | Requires "Confirm email" OFF in Supabase |

---

## Known Issues

### Google OAuth Issue

The OAuth flow fails with error: `Unable to exchange external code: 4/0A`

**Troubleshooting steps:**
1. Ensure redirect URIs match exactly in Google Cloud Console
2. Check Site URL is set correctly in Supabase Dashboard
3. Try disabling and re-enabling the Google provider
4. Consider using email/password auth as alternative

### Header Not Showing User Data

If logged-in user data doesn't appear in header:
1. Check browser console for errors
2. Verify user record exists in `users` table
3. Check Supabase client initialization

---

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint

# Run TypeScript check
npx tsc --noEmit
```

---

Last updated: 2026-04-23