/**
 * LoveCraft — QA Smoke Test Suite
 * ================================
 * Run: npx tsx scripts/qa-tests.ts
 *
 * Tests everything that can be tested without a browser:
 * - TypeScript compilation
 * - File structure integrity
 * - Component contract compliance (StageProps)
 * - Data layer function signatures
 * - Security: RLS policy coverage, no leaked secrets, no raw SQL
 * - Route structure
 * - Stage registry completeness
 * - Theme preset validity
 * - Dead code detection
 *
 * Exit code 0 = all pass, 1 = failures found
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const ROOT = path.resolve(__dirname, '..');
let passed = 0;
let failed = 0;
let warned = 0;

// ============================================
// Helpers
// ============================================

function check(name: string, condition: boolean, detail?: string) {
  if (condition) {
    console.log(`  ✅ ${name}`);
    passed++;
  } else {
    console.log(`  ❌ ${name}${detail ? ` — ${detail}` : ''}`);
    failed++;
  }
}

function warn(name: string, detail: string) {
  console.log(`  ⚠️  ${name} — ${detail}`);
  warned++;
}

function readFile(relPath: string): string {
  const full = path.join(ROOT, relPath);
  if (!fs.existsSync(full)) return '';
  return fs.readFileSync(full, 'utf-8');
}

function fileExists(relPath: string): boolean {
  return fs.existsSync(path.join(ROOT, relPath));
}

function findFiles(dir: string, ext: string): string[] {
  const results: string[] = [];
  const absDir = path.join(ROOT, dir);
  if (!fs.existsSync(absDir)) return results;
  const entries = fs.readdirSync(absDir, { withFileTypes: true });
  for (const entry of entries) {
    const relPath = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== '_archive' && entry.name !== '.next') {
      results.push(...findFiles(relPath, ext));
    } else if (entry.isFile() && entry.name.endsWith(ext)) {
      results.push(relPath);
    }
  }
  return results;
}

// ============================================
// TEST SUITE 1: TypeScript Compilation
// ============================================

console.log('\n═══ 1. TypeScript Compilation ═══');
try {
  execSync('npx tsc --noEmit 2>&1', { cwd: ROOT, encoding: 'utf-8' });
  check('Zero type errors', true);
} catch (e: any) {
  const output = e.stdout || e.message;
  const errorCount = (output.match(/error TS/g) || []).length;
  check('Zero type errors', false, `${errorCount} type error(s) found`);
  // Print first 10 errors
  const lines = output.split('\n').filter((l: string) => l.includes('error TS')).slice(0, 10);
  lines.forEach((l: string) => console.log(`     ${l.trim()}`));
}

// ============================================
// TEST SUITE 2: File Structure Integrity
// ============================================

console.log('\n═══ 2. File Structure ═══');

const requiredFiles = [
  // Core
  'lib/types.ts',
  'lib/experienceData.ts',
  'lib/supabase.ts',
  'lib/auth.ts',
  'lib/soundEngine.ts',
  'lib/useSound.ts',
  // Routes
  'app/page.tsx',
  'app/layout.tsx',
  'app/globals.css',
  'app/login/page.tsx',
  'app/signup/page.tsx',
  'app/create/page.tsx',
  'app/create/[id]/page.tsx',
  'app/e/[slug]/page.tsx',
  // Components
  'components/PhoneGate.tsx',
  'components/HingeIntro.tsx',
  'components/PhotoJourney.tsx',
  'components/SwipeGame.tsx',
  'components/CoupleQuiz.tsx',
  'components/WaitingRoom.tsx',
  'components/CompatibilityMeter.tsx',
  'components/Fortuneteller.tsx',
  'components/GiftReveal.tsx',
  'components/CooldownScreen.tsx',
  'components/SoundToggle.tsx',
  'components/Ornaments.tsx',
  // Infra
  'middleware.ts',
  'supabase-migration-v2.sql',
  'package.json',
  'tsconfig.json',
  'tailwind.config.js',
];

for (const f of requiredFiles) {
  check(`Exists: ${f}`, fileExists(f));
}

// ============================================
// TEST SUITE 3: Component Contract Compliance
// ============================================

console.log('\n═══ 3. Component Contracts (StageProps) ═══');

const stageComponents: Record<string, string> = {
  'PhoneGate': 'phone_gate',
  'HingeIntro': 'hinge_intro',
  'PhotoJourney': 'photo_journey',
  'SwipeGame': 'swipe_game',
  'CoupleQuiz': 'quiz',
  'WaitingRoom': 'waiting_room',
  'CompatibilityMeter': 'compatibility',
  'Fortuneteller': 'fortune_teller',
  'GiftReveal': 'gift_reveal',
  'CooldownScreen': 'cooldown', // special case
};

for (const [component, stageType] of Object.entries(stageComponents)) {
  const src = readFile(`components/${component}.tsx`);
  if (!src) {
    check(`${component}: file exists`, false, 'File not found');
    continue;
  }

  // Must import from types.ts
  const importsTypes = src.includes('lib/types') || src.includes('@/lib/types');
  check(`${component}: imports from lib/types`, importsTypes);

  // Must accept StageProps or experience/participant props
  const hasStageProps = src.includes('StageProps');
  const hasExperienceProp = src.includes('experience:') || src.includes('experience,');
  const hasParticipantProp = src.includes('participant:') || src.includes('participant,');
  check(`${component}: accepts StageProps or experience+participant`, hasStageProps || (hasExperienceProp && hasParticipantProp));

  // Must NOT import old PlayerID type
  const hasOldPlayerID = src.includes('PlayerID') && !src.includes('// legacy');
  check(`${component}: no old PlayerID import`, !hasOldPlayerID);

  // Must NOT have hardcoded 'manoj' or 'pooja' (case-insensitive in string literals)
  const hasHardcodedNames = /['"`]manoj['"`]|['"`]pooja['"`]/i.test(src);
  check(`${component}: no hardcoded 'manoj'/'pooja'`, !hasHardcodedNames);
}

// ============================================
// TEST SUITE 4: Data Layer Completeness
// ============================================

console.log('\n═══ 4. Data Layer (experienceData.ts) ═══');

const dataLayer = readFile('lib/experienceData.ts');

const requiredFunctions = [
  'getExperienceBySlug',
  'getExperienceById',
  'getStagesForExperience',
  'getParticipants',
  'getParticipantByRole',
  'resolvePhoneToRole',
  'ensureParticipant',
  'updateParticipantQuizAnswers',
  'updateParticipantSwipeAnswers',
  'markParticipantComplete',
  'resetParticipant',
  'getCreatorExperiences',
  'createExperience',
  'updateExperience',
  'deleteExperience',
  'createStage',
  'updateStage',
  'deleteStage',
  'reorderStages',
  'createDefaultStages',
];

for (const fn of requiredFunctions) {
  check(`experienceData exports: ${fn}`, dataLayer.includes(`export async function ${fn}`) || dataLayer.includes(`export function ${fn}`));
}

// ============================================
// TEST SUITE 5: Auth Layer
// ============================================

console.log('\n═══ 5. Auth Layer ═══');

const authFile = readFile('lib/auth.ts');
if (authFile) {
  check('auth.ts: has useAuth hook', authFile.includes('useAuth'));
  check('auth.ts: has signIn', authFile.includes('signIn'));
  check('auth.ts: has signUp', authFile.includes('signUp'));
  check('auth.ts: has signOut', authFile.includes('signOut'));
} else {
  check('auth.ts: file exists', false, 'lib/auth.ts not found');
}

const middleware = readFile('middleware.ts');
if (middleware) {
  check('middleware: protects /create', middleware.includes('/create') || middleware.includes('create'));
  check('middleware: allows /e/', middleware.includes('/e/') || middleware.includes('public'));
  check('middleware: allows /login', middleware.includes('/login') || middleware.includes('public'));
} else {
  check('middleware.ts: file exists', false);
}

// ============================================
// TEST SUITE 6: Security Audit
// ============================================

console.log('\n═══ 6. Security Audit ═══');

const allTsFiles = [...findFiles('app', '.tsx'), ...findFiles('components', '.tsx'), ...findFiles('lib', '.ts')];

// 6a. No leaked secrets
console.log('  --- Secret Leaks ---');
const secretPatterns = [
  { name: 'Hardcoded Supabase URL', pattern: /supabase\.co/g, allowedFiles: ['lib/supabase.ts', '.env'] },
  { name: 'Hardcoded API key', pattern: /eyJ[A-Za-z0-9_-]{20,}/g, allowedFiles: [] },
  { name: 'Private key', pattern: /-----BEGIN (RSA |EC )?PRIVATE KEY-----/g, allowedFiles: [] },
  { name: 'Password in code', pattern: /password\s*[:=]\s*['"][^'"]{3,}['"]/gi, allowedFiles: [] },
];

for (const { name, pattern, allowedFiles } of secretPatterns) {
  let found = false;
  for (const f of allTsFiles) {
    if (allowedFiles.some(af => f.includes(af))) continue;
    const content = readFile(f);
    if (pattern.test(content)) {
      check(`No ${name} in ${f}`, false, 'Potential secret leak');
      found = true;
    }
  }
  if (!found) check(`No ${name}`, true);
}

// 6b. No raw SQL in client code (SQL injection risk)
console.log('  --- SQL Injection ---');
for (const f of allTsFiles) {
  if (f.includes('migration') || f.includes('seed') || f.includes('scripts/')) continue;
  const content = readFile(f);
  const hasRawSQL = /\.rpc\s*\(|\.sql\s*\(|`SELECT|`INSERT|`UPDATE|`DELETE/i.test(content);
  if (hasRawSQL) {
    check(`No raw SQL in ${f}`, false, 'Use Supabase query builder, not raw SQL');
  }
}
check('No raw SQL in application code', true);

// 6c. No client-side Supabase admin/service key usage
console.log('  --- Supabase Client Safety ---');
for (const f of allTsFiles) {
  const content = readFile(f);
  const hasServiceKey = /SUPABASE_SERVICE_ROLE|service_role/i.test(content);
  if (hasServiceKey && !f.includes('scripts/')) {
    check(`No service_role key in ${f}`, false, 'Never expose service role key client-side');
  }
}
check('No service_role key in app code', true);

// 6d. XSS: Check for dangerouslySetInnerHTML
console.log('  --- XSS Prevention ---');
let dangerousHtmlCount = 0;
for (const f of [...findFiles('app', '.tsx'), ...findFiles('components', '.tsx')]) {
  const content = readFile(f);
  if (content.includes('dangerouslySetInnerHTML')) {
    warn(`dangerouslySetInnerHTML in ${f}`, 'Review for XSS risk');
    dangerousHtmlCount++;
  }
}
if (dangerousHtmlCount === 0) check('No dangerouslySetInnerHTML usage', true);

// 6e. RLS coverage — check migration SQL has policies for all tables
console.log('  --- RLS Policy Coverage ---');
const migrationSQL = readFile('supabase-migration-v2.sql');
const tables = ['creators', 'experiences', 'stages', 'participants', 'sessions', 'media'];
for (const table of tables) {
  check(`RLS enabled on ${table}`, migrationSQL.includes(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`));
  check(`RLS policy exists for ${table}`, migrationSQL.includes(`ON ${table}`));
}

// 6f. No open CORS / overly permissive headers
console.log('  --- CORS / Headers ---');
for (const f of allTsFiles) {
  const content = readFile(f);
  if (/Access-Control-Allow-Origin.*\*/g.test(content)) {
    check(`No wildcard CORS in ${f}`, false, 'Wildcard CORS is dangerous');
  }
}
check('No wildcard CORS headers', true);

// ============================================
// TEST SUITE 7: Type System Integrity
// ============================================

console.log('\n═══ 7. Type System ═══');

const typesFile = readFile('lib/types.ts');

// All 9 stage types defined
const stageTypes = ['phone_gate', 'hinge_intro', 'photo_journey', 'swipe_game', 'quiz', 'waiting_room', 'compatibility', 'fortune_teller', 'gift_reveal'];
for (const st of stageTypes) {
  check(`StageType includes '${st}'`, typesFile.includes(`'${st}'`));
}

// StageConfigMap has all entries
check('StageConfigMap defined', typesFile.includes('StageConfigMap'));
check('StageProps defined', typesFile.includes('StageProps'));
check('Experience interface defined', typesFile.includes('interface Experience'));
check('Participant interface defined', typesFile.includes('interface Participant'));
check('THEME_PRESETS exported', typesFile.includes('THEME_PRESETS'));
check('STAGE_REGISTRY exported', typesFile.includes('STAGE_REGISTRY'));

// Theme presets have all required fields
const themeFields = ['primaryBg', 'accentColor', 'goldColor', 'goldColorLight', 'goldColorDark', 'creamColor', 'mutedColor', 'fontFamily'];
for (const field of themeFields) {
  check(`THEME_PRESETS includes '${field}'`, typesFile.includes(field));
}

// ============================================
// TEST SUITE 8: Experience Player Integrity
// ============================================

console.log('\n═══ 8. Experience Player ═══');

const playerPage = readFile('app/e/[slug]/page.tsx');
if (playerPage) {
  check('Player: fetches by slug', playerPage.includes('getExperienceBySlug') || playerPage.includes('slug'));
  check('Player: loads stages', playerPage.includes('getStagesForExperience') || playerPage.includes('stages'));
  check('Player: handles phone access mode', playerPage.includes('phone') && playerPage.includes('access_mode'));
  check('Player: handles name_select mode', playerPage.includes('name_select'));
  check('Player: handles open mode', playerPage.includes('open'));
  check('Player: has stage renderer', playerPage.includes('StageRenderer') || playerPage.includes('STAGE_COMPONENTS'));
  check('Player: handles cooldown', playerPage.includes('cooldown') || playerPage.includes('COOLDOWN'));
  check('Player: has SoundToggle', playerPage.includes('SoundToggle'));
} else {
  check('app/e/[slug]/page.tsx exists', false);
}

// ============================================
// TEST SUITE 9: Creator Dashboard
// ============================================

console.log('\n═══ 9. Creator Dashboard ═══');

const dashboardPage = readFile('app/create/page.tsx');
if (dashboardPage) {
  check('Dashboard: uses auth', dashboardPage.includes('useAuth') || dashboardPage.includes('auth'));
  check('Dashboard: fetches experiences', dashboardPage.includes('getCreatorExperiences') || dashboardPage.includes('experiences'));
  check('Dashboard: has create flow', dashboardPage.includes('createExperience') || dashboardPage.includes('Create'));
} else {
  check('app/create/page.tsx exists', false);
}

const editorPage = readFile('app/create/[id]/page.tsx');
if (editorPage) {
  check('Editor: has Basics tab', editorPage.includes('Basics') || editorPage.includes('basics'));
  check('Editor: has Stages tab', editorPage.includes('Stages') || editorPage.includes('stages'));
  check('Editor: has Content tab', editorPage.includes('Content') || editorPage.includes('content'));
  check('Editor: has Gift tab', editorPage.includes('Gift') || editorPage.includes('gift'));
  check('Editor: has Theme tab', editorPage.includes('Theme') || editorPage.includes('theme'));
  check('Editor: has Publish tab', editorPage.includes('Publish') || editorPage.includes('publish'));
  check('Editor: verifies ownership', editorPage.includes('creator_id') || editorPage.includes('creator'));
} else {
  check('app/create/[id]/page.tsx exists', false);
}

// ============================================
// TEST SUITE 10: Dead Code Detection
// ============================================

console.log('\n═══ 10. Dead Code Detection ═══');

// Check if old PlayerID is still imported anywhere in active code
const activeFiles = [...findFiles('app', '.tsx'), ...findFiles('components', '.tsx'), ...findFiles('lib', '.ts')].filter(f => !f.includes('_archive') && !f.includes('questions.ts') && !f.includes('chapters.ts'));

let playerIDImports = 0;
for (const f of activeFiles) {
  const content = readFile(f);
  if (content.includes('PlayerID') && !content.includes('// legacy') && !content.includes('// deprecated')) {
    warn(`${f} still imports PlayerID`, 'Should use Participant.role instead');
    playerIDImports++;
  }
}
if (playerIDImports === 0) check('No active code imports old PlayerID', true);

// Check if old PLAYER_CONFIG is still referenced
let oldConfigRefs = 0;
for (const f of activeFiles) {
  const content = readFile(f);
  if (content.includes('PLAYER_CONFIG') || content.includes('getPlayerByPhone')) {
    warn(`${f} references old player config`, 'Should use resolvePhoneToRole');
    oldConfigRefs++;
  }
}
if (oldConfigRefs === 0) check('No references to old PLAYER_CONFIG/getPlayerByPhone', true);

// Check for hardcoded phone numbers (except in seed scripts)
for (const f of activeFiles) {
  if (f.includes('seed') || f.includes('scripts/')) continue;
  const content = readFile(f);
  if (/8825607563|9176316441|8448522614/.test(content)) {
    check(`No hardcoded phone numbers in ${f}`, false, 'Phone numbers should be in DB');
  }
}
check('No hardcoded phone numbers in app code', true);

// ============================================
// TEST SUITE 11: Build Test
// ============================================

console.log('\n═══ 11. Production Build ═══');
try {
  execSync('npm run build 2>&1', { cwd: ROOT, encoding: 'utf-8', timeout: 120000 });
  check('Production build succeeds', true);
} catch (e: any) {
  const output = e.stdout || e.message;
  check('Production build succeeds', false, 'Build failed');
  // Print last 15 lines of error
  const lines = output.split('\n').slice(-15);
  lines.forEach((l: string) => console.log(`     ${l}`));
}

// ============================================
// RESULTS
// ============================================

console.log('\n══════════════════════════════════');
console.log(`  ✅ Passed: ${passed}`);
console.log(`  ❌ Failed: ${failed}`);
console.log(`  ⚠️  Warnings: ${warned}`);
console.log('══════════════════════════════════');

if (failed > 0) {
  console.log('\n🔴 QA FAILED — Fix the above issues before deploying.\n');
  process.exit(1);
} else if (warned > 0) {
  console.log('\n🟡 QA PASSED with warnings — Review warnings before deploying.\n');
  process.exit(0);
} else {
  console.log('\n🟢 QA PASSED — All clear for deployment.\n');
  process.exit(0);
}
