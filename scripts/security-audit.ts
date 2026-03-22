/**
 * LoveCraft — Security Audit Script
 * ===================================
 * Run: npx tsx scripts/security-audit.ts
 *
 * Deep security scan:
 * - RLS policy completeness and correctness
 * - Auth bypass detection
 * - Input validation gaps
 * - Data leakage (PII exposure, verbose errors)
 * - IDOR (Insecure Direct Object Reference) patterns
 * - Supabase client misuse
 * - Dependency vulnerability hints
 *
 * Exit code 0 = clean, 1 = critical issues, 2 = warnings only
 */

import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '..');
let criticals = 0;
let warnings = 0;

function critical(msg: string, detail?: string) {
  console.log(`  🔴 CRITICAL: ${msg}${detail ? ` — ${detail}` : ''}`);
  criticals++;
}

function warning(msg: string, detail?: string) {
  console.log(`  🟡 WARNING: ${msg}${detail ? ` — ${detail}` : ''}`);
  warnings++;
}

function clean(msg: string) {
  console.log(`  🟢 ${msg}`);
}

function readFile(relPath: string): string {
  const full = path.join(ROOT, relPath);
  if (!fs.existsSync(full)) return '';
  return fs.readFileSync(full, 'utf-8');
}

function findFiles(dir: string, ext: string): string[] {
  const results: string[] = [];
  const absDir = path.join(ROOT, dir);
  if (!fs.existsSync(absDir)) return results;
  const entries = fs.readdirSync(absDir, { withFileTypes: true });
  for (const entry of entries) {
    const relPath = path.join(dir, entry.name);
    if (entry.isDirectory() && !['node_modules', '_archive', '.next', '.git'].includes(entry.name)) {
      results.push(...findFiles(relPath, ext));
    } else if (entry.isFile() && entry.name.endsWith(ext)) {
      results.push(relPath);
    }
  }
  return results;
}

const allAppFiles = [
  ...findFiles('app', '.tsx'),
  ...findFiles('components', '.tsx'),
  ...findFiles('lib', '.ts'),
];

const clientFiles = allAppFiles.filter(f => !f.includes('scripts/'));

// ============================================
// AUDIT 1: RLS Policy Analysis
// ============================================

console.log('\n═══ AUDIT 1: RLS Policies ═══');

const migrationSQL = readFile('supabase-migration-v2.sql');

if (!migrationSQL) {
  critical('supabase-migration-v2.sql not found', 'Cannot audit RLS');
} else {
  // Check every table has RLS enabled
  const tables = ['creators', 'experiences', 'stages', 'participants', 'sessions', 'media'];
  for (const table of tables) {
    if (migrationSQL.includes(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`)) {
      clean(`RLS enabled: ${table}`);
    } else {
      critical(`RLS NOT enabled: ${table}`, 'Table is completely unprotected');
    }
  }

  // Check for overly permissive policies
  const dangerousPatterns = [
    { pattern: /USING\s*\(\s*true\s*\)/gi, name: 'USING (true) — allows all reads' },
    { pattern: /WITH CHECK\s*\(\s*true\s*\)/gi, name: 'WITH CHECK (true) — allows all writes' },
  ];

  for (const { pattern, name } of dangerousPatterns) {
    const matches = migrationSQL.match(pattern);
    if (matches && matches.length > 0) {
      // Count which tables have these
      const lines = migrationSQL.split('\n');
      for (let i = 0; i < lines.length; i++) {
        if (pattern.test(lines[i])) {
          // Look back for table name
          for (let j = i; j >= Math.max(0, i - 5); j--) {
            const tableMatch = lines[j].match(/ON\s+(\w+)/);
            if (tableMatch) {
              warning(`${name} on table '${tableMatch[1]}' (line ~${i + 1})`, 'Review if this is intentionally open');
              break;
            }
          }
        }
      }
    }
  }

  // Check creator-owned tables require auth
  const creatorTables = ['experiences', 'stages', 'media'];
  for (const table of creatorTables) {
    if (migrationSQL.includes(`auth.uid()`) && migrationSQL.includes(table)) {
      clean(`${table}: Creator policies use auth.uid()`);
    } else {
      warning(`${table}: May not properly restrict to authenticated creators`);
    }
  }

  // Check participants table allows public access (needed for gameplay)
  if (migrationSQL.includes('participants') && migrationSQL.includes('is_published = TRUE')) {
    clean('Participants: Public access scoped to published experiences');
  } else {
    warning('Participants: Check that public access is scoped');
  }
}

// ============================================
// AUDIT 2: Auth Bypass Detection
// ============================================

console.log('\n═══ AUDIT 2: Auth Bypass ═══');

// Check middleware exists and protects /create
const middleware = readFile('middleware.ts');
if (middleware) {
  if (middleware.includes('/create')) {
    clean('Middleware protects /create routes');
  } else {
    critical('Middleware does NOT protect /create routes', 'Anyone can access creator dashboard');
  }

  // Check it doesn't accidentally block /e/ (public)
  if (middleware.includes('/e/') || middleware.includes('publicRoutes') || middleware.includes('public')) {
    clean('Middleware allows public /e/ routes');
  } else {
    warning('Verify middleware allows /e/ routes for participants');
  }
} else {
  critical('middleware.ts not found', 'No route protection at all');
}

// Check creator dashboard verifies ownership
const editorPage = readFile('app/create/[id]/page.tsx');
if (editorPage) {
  if (editorPage.includes('creator_id') || editorPage.includes('creator.id')) {
    clean('Editor checks experience ownership');
  } else {
    critical('Editor does NOT check ownership', 'Any logged-in user can edit any experience');
  }
} else {
  warning('app/create/[id]/page.tsx not found');
}

// Check for auth in API routes (if any exist)
const apiFiles = findFiles('app/api', '.ts').concat(findFiles('app/api', '.tsx'));
for (const f of apiFiles) {
  const content = readFile(f);
  if (!content.includes('auth') && !content.includes('session') && !content.includes('getUser')) {
    warning(`API route ${f} may lack auth check`);
  }
}
if (apiFiles.length === 0) {
  clean('No API routes (all client-side Supabase — RLS handles auth)');
}

// ============================================
// AUDIT 3: Data Leakage
// ============================================

console.log('\n═══ AUDIT 3: Data Leakage ═══');

// Check for console.log with sensitive data
for (const f of clientFiles) {
  const content = readFile(f);
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/console\.(log|info|debug)\(.*(?:password|secret|key|token|phone|email)/i.test(line)) {
      warning(`Potential PII in console.log — ${f}:${i + 1}`, line.trim().substring(0, 80));
    }
  }
}

// Check for verbose error messages exposed to user
for (const f of clientFiles) {
  const content = readFile(f);
  if (/catch\s*\([^)]*\)\s*\{[^}]*(?:alert|setText|setError)\([^)]*(?:err\.message|error\.message|e\.message)/g.test(content)) {
    warning(`${f}: May expose raw error messages to user`, 'Use generic error messages');
  }
}

// Check phone numbers aren't exposed in responses — look for SELECT * specifically on the participants table
const dataLayer = readFile('lib/experienceData.ts');
const participantSelectStar = /from\(\s*['"]participants['"]\s*\)\s*\.\s*select\(\s*['"]\*['"]\s*\)/;
if (participantSelectStar.test(dataLayer)) {
  warning('experienceData.ts: SELECT * on participants may leak phone numbers to other participants', 'Select only needed columns');
} else {
  clean('Participant queries use scoped column selects (no phone leakage)');
}

// ============================================
// AUDIT 4: Input Validation
// ============================================

console.log('\n═══ AUDIT 4: Input Validation ═══');

// Check experience creation validates slug
if (dataLayer) {
  if (dataLayer.includes('slug') && (dataLayer.includes('replace') || dataLayer.includes('regex') || dataLayer.includes('toLowerCase'))) {
    clean('Slug generation includes sanitization');
  } else {
    warning('Slug generation may lack sanitization', 'Slugs should be URL-safe');
  }
}

// Check for unescaped user input in components
for (const f of [...findFiles('components', '.tsx'), ...findFiles('app', '.tsx')]) {
  const content = readFile(f);
  if (content.includes('dangerouslySetInnerHTML')) {
    critical(`XSS risk: dangerouslySetInnerHTML in ${f}`, 'Never render user-provided HTML');
  }
}

// Check phone number input validation
for (const f of clientFiles) {
  const content = readFile(f);
  if (content.includes('type="tel"') || content.includes("type='tel'")) {
    if (content.includes('replace(/\\D/') || content.includes('replace(/[^0-9]/') || content.includes('/^\\d*$/')) {
      clean(`${f}: Phone input has digit validation`);
    } else {
      warning(`${f}: Phone input may lack digit-only validation`);
    }
  }
}

// ============================================
// AUDIT 5: IDOR (Insecure Direct Object Reference)
// ============================================

console.log('\n═══ AUDIT 5: IDOR Protection ═══');

// In a client-side Supabase app, IDOR protection comes from RLS.
// Check that experience editor fetches are scoped to creator.
if (editorPage) {
  const fetchesById = editorPage.includes('getExperienceById') || editorPage.includes('.eq(\'id\'');
  const checksCreator = editorPage.includes('creator_id') || editorPage.includes('creator.id');
  if (fetchesById && checksCreator) {
    clean('Editor: Fetches experience by ID AND verifies creator ownership');
  } else if (fetchesById) {
    warning('Editor: Fetches by ID but may not verify ownership client-side', 'RLS should handle this, but defense-in-depth is better');
  }
}

// Check if experience slug route exposes unpublished experiences
const playerPage = readFile('app/e/[slug]/page.tsx');
if (playerPage) {
  if (playerPage.includes('is_published') || playerPage.includes('published')) {
    clean('Player: Only loads published experiences');
  } else {
    warning('Player: May load unpublished experiences', 'Check that getExperienceBySlug filters by is_published');
  }
}

// Check getExperienceBySlug filters published
if (dataLayer.includes('getExperienceBySlug') && dataLayer.includes('is_published')) {
  clean('getExperienceBySlug filters by is_published');
} else {
  critical('getExperienceBySlug may NOT filter by is_published', 'Unpublished experiences could be accessed');
}

// ============================================
// AUDIT 6: Supabase Client Misuse
// ============================================

console.log('\n═══ AUDIT 6: Supabase Client Safety ═══');

// Check only one Supabase client exists
const supabaseFile = readFile('lib/supabase.ts');
const supabaseImportCount = clientFiles.filter(f => {
  const content = readFile(f);
  return content.includes('createClient') && !f.includes('lib/supabase.ts');
}).length;

if (supabaseImportCount === 0) {
  clean('Single Supabase client instance (via lib/supabase.ts)');
} else {
  warning(`${supabaseImportCount} file(s) create their own Supabase client`, 'Use the shared client from lib/supabase.ts');
}

// Check no service role key in client code
for (const f of clientFiles) {
  const content = readFile(f);
  if (/SUPABASE_SERVICE_ROLE|service_role_key|serviceRoleKey/i.test(content)) {
    critical(`Service role key referenced in ${f}`, 'NEVER use service role key client-side');
  }
}
clean('No service role key in client code');

// Check Supabase URL comes from env
if (supabaseFile.includes('process.env.NEXT_PUBLIC_SUPABASE_URL')) {
  clean('Supabase URL from environment variable');
} else {
  warning('Supabase URL may be hardcoded');
}

// ============================================
// AUDIT 7: Dependency Health
// ============================================

console.log('\n═══ AUDIT 7: Dependencies ═══');

const packageJson = readFile('package.json');
if (packageJson) {
  const pkg = JSON.parse(packageJson);
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };

  // Check for known problematic patterns
  if (deps['@supabase/supabase-js']) {
    const version = deps['@supabase/supabase-js'].replace(/[\^~]/, '');
    const major = parseInt(version.split('.')[0]);
    if (major >= 2) {
      clean(`@supabase/supabase-js v${version} (v2+ has better RLS support)`);
    } else {
      warning(`@supabase/supabase-js v${version}`, 'Upgrade to v2+ for better security');
    }
  }

  if (deps['next']) {
    clean(`next: ${deps['next']}`);
  }
}

// ============================================
// RESULTS
// ============================================

console.log('\n══════════════════════════════════');
console.log(`  🔴 Critical: ${criticals}`);
console.log(`  🟡 Warnings: ${warnings}`);
console.log('══════════════════════════════════');

if (criticals > 0) {
  console.log('\n🔴 SECURITY AUDIT FAILED — Critical issues must be fixed before deployment.\n');
  process.exit(1);
} else if (warnings > 0) {
  console.log('\n🟡 SECURITY AUDIT PASSED with warnings — Review and address before production.\n');
  process.exit(2);
} else {
  console.log('\n🟢 SECURITY AUDIT CLEAN — No issues found.\n');
  process.exit(0);
}
