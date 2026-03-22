# CLAUDE.md — LoveCraft

## What This Is

A multi-tenant SaaS platform — "Canva for interactive love gifts" — where anyone can create personalized, cinematic gift experiences and share them via link. Originally built as a wedding gift for Manoj & Pooja, now fully generalized.

Creators sign up, build experiences (choosing from 9 stage types, customizing questions/photos/themes/gifts), publish, and share a link. Participants open the link, play through the stages together in real-time, and unlock a gift reveal at the end.

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 14 (App Router, `use client` heavy) |
| Language | TypeScript (strict, target es5) |
| Styling | Tailwind CSS 3.4 + inline styles (Cormorant Garamond font) |
| Database | Supabase (Postgres + Realtime + Auth + Storage) |
| Auth | Supabase Auth (email/password + Google OAuth) |
| State | React useState/useCallback (no state library) |
| Deployment | Vercel |

## Build & Run

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # Production build
```

Requires `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## URL Structure

```
/                    → Landing page (LoveCraft branding + CTA)
/login               → Creator login (email + Google)
/signup              → Creator signup
/create              → Creator dashboard (auth required) — list/create experiences
/create/[id]         → Experience editor (auth required) — 6-tab editor
/e/[slug]            → Public experience player (participant-facing)
/admin               → Legacy admin page
```

## Database Schema (6 new tables + 2 legacy)

```
creators        → authenticated users who build experiences (auto-created on signup via trigger)
experiences     → each gift/experience (slug, names, theme, access config, gift config)
stages          → ordered stages within an experience (config is JSONB per stage type)
participants    → people playing an experience (role a/b, quiz/swipe answers, completion state)
sessions        → visit/replay tracking
media           → uploaded photos/sounds per experience

-- Legacy (still exist, unused by new code):
players         → old single-couple player table
visits          → old visit tracking
```

RLS policies: creators manage own data; public reads/writes published experiences' participants. Realtime enabled on `participants` table.

SQL files:
- `supabase-setup.sql` — original single-couple schema (legacy)
- `supabase-migration-v2.sql` — multi-tenant schema (6 tables, RLS, indexes, auth trigger)
- `scripts/seed-manoj-pooja.sql` — seeds the original Manoj & Pooja experience into new schema

## Project Structure

```
app/
  page.tsx                   → Landing page
  layout.tsx                 → Root layout + metadata
  globals.css                → Tailwind + global styles
  login/page.tsx             → Auth: login
  signup/page.tsx            → Auth: signup
  create/page.tsx            → Creator dashboard (list experiences, create new)
  create/[id]/page.tsx       → Experience editor (6 tabs: Basics, Stages, Content, Gift, Theme, Publish)
  e/[slug]/page.tsx          → Experience player (phone gate → stages → gift reveal)
  admin/page.tsx             → Legacy admin
  _archive/old-page.tsx      → Archived original single-couple orchestrator

components/
  PhoneGate.tsx              → Phone verification stage
  HingeIntro.tsx             → Hinge-style animated intro with photo carousel
  PhotoJourney.tsx           → Scroll-animated photo chapters
  SwipeGame.tsx              → "Who's more likely to" swipe cards
  CoupleQuiz.tsx             → Matching quiz (both answer, compare later)
  WaitingRoom.tsx            → Realtime waiting for partner (Supabase Realtime + polling)
  CompatibilityMeter.tsx     → Animated compatibility score with category breakdown
  Fortuneteller.tsx          → AI Pandit fortune predictions
  GiftReveal.tsx             → Confetti + gift reveal (voucher/message/image/link) + match comparison
  CooldownScreen.tsx         → 2h replay cooldown timer
  SoundToggle.tsx            → Global sound mute/unmute
  AdminPanel.tsx             → Hidden admin panel (legacy)
  Ornaments.tsx              → Gold SVG decorations, confetti, mandala rings
  DancingCouple.tsx          → Decorative animated couple (unused)

lib/
  types.ts                   → All TypeScript types, StageProps<T>, StageConfigMap, THEME_PRESETS, STAGE_REGISTRY
  experienceData.ts          → All Supabase queries (experience/stage/participant CRUD)
  auth.ts                    → useAuth() hook, signIn/signUp/signOut, getCreator()
  supabase.ts                → Supabase client singleton
  soundEngine.ts             → Sound effect management
  useSound.ts                → React hook for sound effects
  questions.ts               → Legacy quiz questions data (now in stage configs)
  chapters.ts                → Legacy photo chapters data (now in stage configs)

middleware.ts                → Route protection (/create/* requires auth)
scripts/
  seed-migration.ts          → Node script to seed data (blocked by RLS, use SQL instead)
  seed-manoj-pooja.sql       → SQL seed for original experience (run in Supabase SQL Editor)
```

## Component Props Contract

All stage components accept the universal `StageProps<T>` interface:

```typescript
interface StageProps<T extends StageType> {
  experience: Experience;      // Full experience row
  participant: Participant;    // Current player
  partner: Participant | null; // Other player (may not exist yet)
  stageConfig: StageConfigMap[T]; // Type-safe config for this stage
  onComplete: () => void;     // Advance to next stage
}
```

Stage types: `phone_gate`, `hinge_intro`, `photo_journey`, `swipe_game`, `quiz`, `waiting_room`, `compatibility`, `fortune_teller`, `gift_reveal`

## Creator Dashboard Editor Tabs

| Tab | What it does |
|-----|-------------|
| Basics | Title, subtitle, names, occasion, slug, access mode, phone mappings |
| Stages | Reorder (up/down), enable/disable, add/remove stages |
| Content | Per-stage editors: quiz questions, swipe scenarios, photo chapters, intro cards, fortunes, waiting message |
| Gift | Gift type (voucher/message/image/link) with type-specific fields |
| Theme | 4 presets + custom color pickers + font family |
| Publish | Publish toggle, shareable link, copy button, preview |

Auto-saves with 800ms debounce.

## Design Language

- **Theme:** Royal Indian / dark luxe — `#1A0A0A` bg, `#D4A853` gold, `#F5E6D0` cream, `#A89A8C` muted
- **Typography:** Cormorant Garamond (serif, elegant)
- **Mobile-first:** 480px max-width for experience player; responsive sidebar/bottom-tabs for editor
- **Animations:** CSS keyframes, smooth transitions, confetti, scale-in/slide-up/fade-in
- **Sound:** Toggle-able effects throughout (whoosh, pop, chime, drumroll, confetti, etc.)

## Code Conventions

- All components use `'use client'`
- Callbacks wrapped in `useCallback` to prevent re-subscriptions
- Tailwind for styling, inline styles for dynamic values and theme colors
- TypeScript strict mode, target es5
- tsconfig excludes: `node_modules`, `lovecraft-repo`, `scripts`, `app/_archive`
- No testing, linting, or CI/CD yet

## Auth Flow

1. Middleware protects `/create/*` — redirects to `/login` if no session
2. Login/signup via Supabase Auth (email + Google OAuth)
3. DB trigger `handle_new_user()` auto-creates `creators` row on signup
4. `useAuth()` hook provides `user`, `creator`, `loading`, `signOut`
5. Creator dashboard uses `creator.id` for all CRUD operations
6. Experience editor verifies `experience.creator_id === creator.id`

## Key Gotchas

- Supabase Realtime is critical for WaitingRoom — test with two browser tabs
- RLS blocks anon key from inserting into creator-owned tables — seed data via SQL Editor
- The `lib/questions.ts` and `lib/chapters.ts` are legacy dead code (data lives in stage configs now)
- `lovecraft-repo/` directory is a stale leftover — excluded from tsconfig, can be deleted
- Sound effects are loaded dynamically via `lib/soundEngine.ts`
- The experience player at `/e/[slug]` has inline sub-components (PhoneGateShim, NameSelectGate, CooldownDisplay, StageRenderer)


## Testing & Quality Gates

### Scripts

```bash
npx tsx scripts/qa-tests.ts          # Full QA suite (types, contracts, structure, dead code, build)
npx tsx scripts/security-audit.ts     # Security scan (RLS, auth bypass, leaks, XSS, IDOR)
```

### When to Run

**MANDATORY — run BOTH scripts after:**
- Every new feature or component
- Every refactor that touches more than 2 files
- Every database schema change
- Every auth-related change
- Before any commit that will be deployed

**Run qa-tests.ts after:**
- Any component prop changes
- Adding/removing files
- Changing lib/types.ts or lib/experienceData.ts

**Run security-audit.ts after:**
- Any Supabase query changes
- Any RLS policy changes
- Adding new routes
- Any auth flow changes

### Exit Codes

| Script | Code | Meaning |
|--------|------|---------|
| qa-tests.ts | 0 | All pass — safe to commit |
| qa-tests.ts | 1 | Failures — DO NOT commit until fixed |
| security-audit.ts | 0 | Clean — no issues |
| security-audit.ts | 1 | Critical — BLOCK deployment |
| security-audit.ts | 2 | Warnings only — review before deploy |

### What the QA Suite Checks (11 suites)

1. **TypeScript compilation** — zero errors required
2. **File structure** — all required files exist
3. **Component contracts** — every stage component accepts StageProps, no old PlayerID imports, no hardcoded names
4. **Data layer** — all 20 CRUD functions exist in experienceData.ts
5. **Auth layer** — useAuth hook, signIn/signUp/signOut, middleware protection
6. **Security** — no leaked secrets, no raw SQL, no service_role key, no dangerouslySetInnerHTML, RLS on all tables, no wildcard CORS
7. **Type system** — all 9 stage types, StageConfigMap, theme presets, STAGE_REGISTRY
8. **Experience player** — slug routing, all 3 access modes, stage renderer, cooldown
9. **Creator dashboard** — auth, CRUD, 6 editor tabs, ownership check
10. **Dead code** — no old PlayerID, no PLAYER_CONFIG, no hardcoded phone numbers
11. **Production build** — `npm run build` must succeed

### What the Security Audit Checks (7 audits)

1. **RLS policies** — every table has RLS enabled + policies, no overly permissive USING(true)
2. **Auth bypass** — middleware protects /create, editor checks ownership, API routes have auth
3. **Data leakage** — no PII in console.log, no verbose errors exposed, no SELECT * leaking phones
4. **Input validation** — slug sanitization, phone digit validation, no XSS via dangerouslySetInnerHTML
5. **IDOR** — experience editor scoped to creator, player route only loads published experiences
6. **Supabase safety** — single client instance, no service_role key, env vars for URL
7. **Dependencies** — Supabase v2+, no known vulnerable patterns

### Rules for Claude Code

1. **Never commit if qa-tests.ts exits with code 1.** Fix all failures first.
2. **Never deploy if security-audit.ts exits with code 1.** Fix all criticals first.
3. **Treat warnings as TODOs** — address them in the same PR if possible.
4. **If adding a new stage type:** update lib/types.ts StageType + StageConfigMap + STAGE_REGISTRY, create component accepting StageProps, add to STAGE_COMPONENTS in app/e/[slug]/page.tsx, add config editor in app/create/[id]/page.tsx Content tab.
5. **If adding a new Supabase table:** add RLS policies, add to security-audit.ts table list, add types to lib/types.ts.
6. **If changing auth:** verify middleware.ts, verify RLS policies, run security-audit.ts.
7. **Every commit message must include test status:** e.g., `feat: add photo upload — QA ✅ Security ✅`

### Adding New Tests

To add a test to qa-tests.ts:
```typescript
check('Description of what you are testing', booleanCondition, 'Failure detail');
```

To add a security check:
```typescript
critical('Issue description', 'How to fix');  // blocks deployment
warning('Issue description', 'Recommendation');  // review needed
clean('What passed');  // informational
```
