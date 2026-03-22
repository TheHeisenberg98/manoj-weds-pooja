
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
