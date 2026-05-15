# Zeal 2 Up

AI-powered student counselling, psychological assessment, and behavioural evaluation platform for colleges and universities.

**Contact:** zealcatalyst.zeca@gmail.com | +91 97902 05149

---

## Overview

Zeal 2 Up helps colleges proactively support student mental wellness through:
- AI-powered stress assessments with instant reports
- 24/7 AI wellness companion chat (gpt-4o-mini)
- Real-time counselling with video session scaffolding
- Expert and admin dashboards with analytics
- PDF report generation with intervention strategies

## Tech Stack

- **Framework:** Next.js 15 (App Router) + TypeScript strict
- **Styling:** Tailwind CSS v4 + shadcn/ui (New York) + Lucide icons
- **Backend:** Supabase (Auth, PostgreSQL, RLS, Realtime, Storage)
- **AI:** OpenAI SDK (gpt-4o-mini) with streaming
- **Charts:** Recharts
- **Animations:** Framer Motion
- **Forms:** React Hook Form + Zod
- **State:** TanStack Query
- **PDF:** jsPDF + jspdf-autotable

## Quick Start

### 1. Clone and install

```bash
git clone <repo-url>
cd zeal-2-up
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=sk-your-openai-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run migrations in order:
   - `supabase/migrations/001_schema.sql`
   - `supabase/migrations/002_rls.sql`
   - `supabase/migrations/003_seed.sql`
3. Copy your project URL and anon key from **Project Settings → API**

Or use Supabase CLI:

```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Architecture

```
app/
  (marketing)/       # Public pages: landing, about, contact
  (auth)/            # Login, register
  (student)/         # Student dashboard, assessment, counselling, AI chat
  (expert)/          # Expert dashboard, session management
  (admin)/           # Admin analytics, student/expert management
  api/               # API routes: AI chat, reports, webhooks

components/
  ui/                # shadcn/ui primitives (button, card, input, etc.)
  layout/            # Navbar, footer, dashboard layout, sidebar
  marketing/         # Hero, features, testimonials, CTA
  student/           # Student dashboard, wellness widgets
  assessment/        # Assessment form, result report
  counselling/       # Session booking, realtime chat, WebRTC scaffold
  chat/              # AI chat interface
  expert/            # Expert dashboard, notes editor, trend charts
  admin/             # Analytics charts, KPI cards

lib/
  supabase/          # Client and server Supabase helpers
  assessment.ts      # 20-question engine, scoring, categories
  report-pdf.ts      # jsPDF report generator
  actions/auth.ts    # Server actions for auth
  utils.ts           # cn() helper

services/
  student.ts         # Student data access
  expert.ts          # Expert data access
  admin.ts           # Admin analytics queries

types/
  database.ts        # Full Supabase type definitions
  app.ts             # Derived app types
```

## Role System

| Role    | Access |
|---------|--------|
| student | Own data: assessments, sessions, chat |
| expert  | Assigned students' data, session management |
| admin   | College-wide data, all student/expert management |

Roles are stored in `user_roles` table (never on `profiles`). Protected via `has_role()` SECURITY DEFINER function and RLS policies.

## Deployment to Vercel

```bash
npm install -g vercel
vercel
```

Set environment variables in Vercel dashboard → Project Settings → Environment Variables.

Required:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`

## Database

PostgreSQL via Supabase with Row Level Security on every table.

Key tables: `profiles`, `colleges`, `user_roles`, `experts`, `assessments`, `assessment_answers`, `sessions`, `messages`, `notes`

See `supabase/migrations/` for complete schema.

## Support

- Email: [zealcatalyst.zeca@gmail.com](mailto:zealcatalyst.zeca@gmail.com)
- Phone: +91 97902 05149
