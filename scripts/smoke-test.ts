/**
 * Smoke Test — HingeIntro Photo Carousel
 *
 * Run: npx ts-node --skip-project scripts/smoke-test.ts
 * Or just review the checklist manually.
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const PUBLIC = path.join(ROOT, 'public');

// ============================================
// 1. Photo paths exist (directories ready for files)
// ============================================
const expectedPhotoPaths = [
  'photos/manoj/1.jpg',
  'photos/manoj/2.jpg',
  'photos/manoj/3.jpg',
  'photos/pooja/1.jpg',
  'photos/pooja/2.jpg',
  'photos/pooja/3.jpg',
];

console.log('\n=== Photo Path Checks ===');
let photoDirsOk = true;
for (const p of expectedPhotoPaths) {
  const full = path.join(PUBLIC, p);
  const dirExists = fs.existsSync(path.dirname(full));
  const fileExists = fs.existsSync(full);
  const status = fileExists ? '✅ FILE EXISTS' : dirExists ? '⚠️  dir exists, file pending' : '❌ DIR MISSING';
  console.log(`  ${status}  /public/${p}`);
  if (!dirExists) photoDirsOk = false;
}
console.log(photoDirsOk ? '  → All directories ready.' : '  → ERROR: Some directories missing!');

// ============================================
// 2. HingeIntro component renders (source check)
// ============================================
console.log('\n=== HingeIntro Component Check ===');
const hingeFile = path.join(ROOT, 'components', 'HingeIntro.tsx');
const hingeSource = fs.readFileSync(hingeFile, 'utf-8');

const checks: Array<[string, boolean]> = [
  ['PhotoCarousel component defined', hingeSource.includes('function PhotoCarousel')],
  ['PROFILE_PHOTOS config exists', hingeSource.includes('PROFILE_PHOTOS')],
  ['Touch swipe handlers', hingeSource.includes('onTouchStart') && hingeSource.includes('onTouchEnd')],
  ['Dot indicators rendered', hingeSource.includes('photos.map') && hingeSource.includes('rounded-full')],
  ['Desktop click zones (left/right)', hingeSource.includes('Previous photo') && hingeSource.includes('Next photo')],
  ['translateX carousel animation', hingeSource.includes('translateX')],
  ['pageTurn sound on swipe', hingeSource.includes("play('pageTurn')")],
  ['matchReveal sound preserved', hingeSource.includes("play('matchReveal')")],
  ['Photos for manoj referenced', hingeSource.includes('/photos/manoj/1.jpg')],
  ['Photos for pooja referenced', hingeSource.includes('/photos/pooja/1.jpg')],
  ['Aspect ratio 3/4 preserved', hingeSource.includes('aspect-[3/4]')],
  ['Hinge UI elements preserved', hingeSource.includes('hinge') && hingeSource.includes('Designed to be deleted')],
  ['Like button preserved', hingeSource.includes('❤️ Like')],
  ['Match phase preserved', hingeSource.includes("It&apos;s a Match!")],
];

for (const [label, passed] of checks) {
  console.log(`  ${passed ? '✅' : '❌'}  ${label}`);
}

const allPassed = checks.every(([, p]) => p);

// ============================================
// 3. Swipe state logic verification
// ============================================
console.log('\n=== Swipe State Logic ===');
const swipeChecks: Array<[string, boolean]> = [
  ['State bounded: Math.max(0, Math.min(...))', hingeSource.includes('Math.max(0, Math.min(')],
  ['Swipe threshold: ignores small drags (<40px)', hingeSource.includes('< 40')],
  ['onSwipe callback fires on change', hingeSource.includes('onSwipe?.()')],
  ['Current index prevents duplicate fires', hingeSource.includes('next !== current')],
];
for (const [label, passed] of swipeChecks) {
  console.log(`  ${passed ? '✅' : '❌'}  ${label}`);
}

// ============================================
// Summary
// ============================================
const totalChecks = checks.length + swipeChecks.length;
const totalPassed = checks.filter(([, p]) => p).length + swipeChecks.filter(([, p]) => p).length;
console.log(`\n=== Summary: ${totalPassed}/${totalChecks} checks passed ===`);
if (totalPassed === totalChecks && photoDirsOk) {
  console.log('🎉 All smoke tests passed!\n');
  process.exit(0);
} else {
  console.log('⚠️  Some checks failed — review above.\n');
  process.exit(1);
}
