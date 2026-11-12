# CalcHub — Deployment Guide
## Stack: Next.js 15 → Cloudflare Pages + Supabase

---

## 1. SUPABASE SETUP

### Create Project
1. Go to https://supabase.com → New Project
2. Choose region closest to your users (e.g. South Asia)
3. Save the **Project URL** and **anon key** from Settings → API

### Run Database Schema
1. Go to Supabase Dashboard → SQL Editor
2. Paste the content of `supabase/migrations/001_initial_schema.sql`
3. Click Run

### Configure Auth
1. Supabase Dashboard → Authentication → Providers
2. Enable **Email** (confirm Email is on)
3. Enable **Google** OAuth:
   - Go to Google Cloud Console → Create OAuth 2.0 credentials
   - Authorized redirect URI: `https://your-project.supabase.co/auth/v1/callback`
   - Paste Client ID + Secret into Supabase
4. Enable **GitHub** OAuth:
   - GitHub → Settings → Developer settings → OAuth Apps → New
   - Homepage URL: `https://calchub.pages.dev`
   - Callback: `https://your-project.supabase.co/auth/v1/callback`

### Admin Email Setup
In Supabase SQL Editor, run:
```sql
-- Set which emails become admins automatically
ALTER DATABASE postgres SET app.admin_emails = 'your@email.com,other@email.com';
```

---

## 2. CLOUDFLARE PAGES SETUP

### Option A — Git Deploy (Recommended)
1. Push project to GitHub/GitLab
2. Go to Cloudflare Dashboard → Pages → Create a project
3. Connect your repo
4. Build settings:
   - **Framework preset:** Next.js
   - **Build command:** `npm run build`
   - **Build output directory:** `.next`
   - **Node.js version:** 20

### Option B — Direct Upload
```bash
npm install -g wrangler
wrangler pages deploy .next --project-name calchub
```

### Environment Variables in Cloudflare
Go to Pages → calchub → Settings → Environment Variables → Add:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` (keep secret!) |
| `NEXT_PUBLIC_APP_URL` | `https://calchub.pages.dev` |
| `ANTHROPIC_API_KEY` | `sk-ant-...` |
| `ADMIN_EMAILS` | `you@email.com` |

> ⚠️ Set variables for BOTH Production and Preview environments

### Custom Domain (optional)
Pages → Custom domains → Add `calchub.com`
Then update `NEXT_PUBLIC_APP_URL` to `https://calchub.com`

---

## 3. LOCAL DEVELOPMENT

```bash
# Clone & install
git clone https://github.com/you/calchub
cd calchub
npm install

# Copy env file and fill values
cp .env.local.example .env.local
# Edit .env.local with your Supabase URL, keys etc.

# Run dev server
npm run dev
# → http://localhost:3000
```

---

## 4. SUPABASE EMAIL TEMPLATES (optional)

Go to Supabase → Authentication → Email Templates and customise:

**Confirm Signup:**
```html
<h2>Welcome to CalcHub! 🧮</h2>
<p>Click below to verify your email:</p>
<a href="{{ .ConfirmationURL }}">Verify Email</a>
```

**Password Reset:**
```html
<h2>Reset your CalcHub password</h2>
<a href="{{ .ConfirmationURL }}">Reset Password</a>
```

---

## 5. CLOUDFLARE EXTRAS (optional)

### Speed Rules
Cloudflare Dashboard → Rules → Cache Rules:
- `/api/*` → Cache Level: Bypass
- `/_next/static/*` → Cache Level: Cache Everything, Edge TTL: 1 year

### Web Analytics
Cloudflare Dashboard → Web Analytics → Add site → paste snippet in `src/app/layout.tsx`

### Rate Limiting
Rules → Rate Limiting Rules:
- Path: `/api/ai` → 20 requests per minute per IP
- Path: `/auth/*` → 10 requests per minute per IP

---

## 6. POST-DEPLOY CHECKLIST

- [ ] Visit `/auth/register` and create your admin account
- [ ] Run SQL to grant admin role: `UPDATE profiles SET role='admin' WHERE email='you@email.com';`
- [ ] Visit `/admin/dashboard` — confirm it works
- [ ] Test calculator save to history
- [ ] Test AI Solver
- [ ] Add at least one banner via `/admin/banners`
- [ ] Set featured calculators via `/admin/settings`

---

## ARCHITECTURE OVERVIEW

```
calchub/
├── src/
│   ├── app/
│   │   ├── auth/          → Login, Register, Forgot Password
│   │   ├── user/          → Dashboard, History, Favourites, Settings
│   │   ├── admin/         → Dashboard, Users, Analytics, Banners, Settings
│   │   └── api/           → AI, Calculations, Admin API routes
│   ├── components/
│   │   ├── layout/        → UserLayout, AdminLayout
│   │   ├── ui/            → Button, Card, Badge, Input (shared)
│   │   └── calculators/   → Calculator components
│   ├── lib/supabase/      → client.ts, server.ts, middleware.ts
│   ├── hooks/             → useAuth, useCalculator
│   ├── store/             → Zustand auth store
│   ├── types/             → All TypeScript interfaces
│   └── styles/            → globals.css (design tokens)
├── supabase/
│   └── migrations/        → SQL schema
├── middleware.ts           → Route protection
└── DEPLOYMENT.md          → This file
```
