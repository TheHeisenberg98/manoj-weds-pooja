/**
 * Seed Migration Script — Move Manoj & Pooja to New Multi-Tenant Schema
 *
 * Reads existing hardcoded data from lib/questions.ts, lib/chapters.ts,
 * and embeds the old component data (scenarios, predictions, intro cards,
 * gift voucher) that was removed during the Task 3 refactor.
 *
 * Usage: npx tsx scripts/seed-migration.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';
import { QUIZ_QUESTIONS } from '../lib/questions';
import { CHAPTERS } from '../lib/chapters';

// Load .env.local manually (tsx doesn't do this automatically)
const envPath = path.resolve(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

// ---------------------------------------------------------------------------
// Supabase client (reads from env, same as lib/supabase.ts)
// ---------------------------------------------------------------------------
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Missing env vars. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local'
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ---------------------------------------------------------------------------
// Experience metadata
// ---------------------------------------------------------------------------
const EXPERIENCE_SLUG = 'manoj-weds-pooja';

const EXPERIENCE_DATA = {
  slug: EXPERIENCE_SLUG,
  title: 'Manoj Weds Pooja',
  subtitle: 'Shubh Vivah',
  occasion: 'wedding',
  person_a_name: 'Manoj',
  person_b_name: 'Pooja',
  person_a_label: 'Groom',
  person_b_label: 'Bride',
  access_mode: 'phone',
  access_phones: [
    { phone: '8825607563', maps_to: 'a' },
    { phone: '9176316441', maps_to: 'a' },
    { phone: '8448522614', maps_to: 'b' },
  ],
  is_published: true,
  theme: {
    primaryBg: '#1A0A0A',
    accentColor: '#8B1C1C',
    goldColor: '#D4A853',
    goldColorLight: '#E8D5A3',
    goldColorDark: '#B8924A',
    creamColor: '#F5E6D0',
    mutedColor: '#A89A8C',
    fontFamily: 'Cormorant Garamond',
  },
};

// ---------------------------------------------------------------------------
// Hinge Intro cards (original hardcoded data removed during Task 3 refactor)
// ---------------------------------------------------------------------------
const HINGE_INTRO_CARDS = [
  {
    text: 'Making every moment count',
    emoji: '💕',
    subtext: 'A life goal of mine',
  },
  {
    text: 'From a swipe to forever',
    emoji: '💒',
    subtext: 'Our love story',
  },
  {
    text: "Found my person and I'm never letting go",
    emoji: '💝',
    subtext: 'The simplest truth',
  },
];

// ---------------------------------------------------------------------------
// Swipe Game scenarios (15 "Who's more likely to" items, wml-1..wml-15)
// These were hardcoded in the old SwipeGame.tsx before Task 3 refactor.
// ---------------------------------------------------------------------------
const SWIPE_SCENARIOS = [
  { text: 'Forget their anniversary', emoji: '📅' },
  { text: 'Hog the blanket at night', emoji: '🛏️' },
  { text: 'Cry during a movie', emoji: '🎬' },
  { text: 'Burn the kitchen down trying to cook', emoji: '🔥' },
  { text: 'Spend 2 hours getting ready', emoji: '💄' },
  { text: 'Fall asleep during a serious conversation', emoji: '😴' },
  { text: 'Win an argument (always)', emoji: '🏆' },
  { text: 'Be the first to apologize', emoji: '🙏' },
  { text: 'Get lost even with Google Maps', emoji: '🗺️' },
  { text: 'Eat the last slice of pizza without asking', emoji: '🍕' },
  { text: 'Plan a surprise trip', emoji: '✈️' },
  { text: 'Talk to strangers like old friends', emoji: '🗣️' },
  { text: 'Take 100 selfies before picking one', emoji: '🤳' },
  { text: 'Be the strict parent', emoji: '👨‍👩‍👧' },
  { text: 'Still be the fun one at 60', emoji: '🎉' },
];

// ---------------------------------------------------------------------------
// Fortuneteller predictions (original 5 DEFAULT_PREDICTIONS from old code)
// Stored as simple strings in the fortunes array.
// ---------------------------------------------------------------------------
const FORTUNE_PREDICTIONS = [
  "The first 6 months will be an adjustment period... the AC temperature will be the biggest issue. One wants 18\u00B0C, the other says 24\u00B0C. Compromise at 21\u00B0C, but both secretly change it at night. \uD83D\uDE24\u2744\uFE0F",
  "A joint account will be opened, but both will maintain a secret 'emergency fund' for personal splurges. One's emergency = shoes. The other's = gadgets. The stars say \u2014 stop budgeting. \uD83D\uDECD\uFE0F",
  "An international trip is definitely happening. One will suggest Bali, the other Switzerland. Final destination? Somewhere local. Because last-minute plans always win. The stars confirm \u2014 adventures await. \uD83C\uDFD6\uFE0F",
  "Cooking duties will rotate, but food delivery apps will be the real winners. One day someone will make Maggi and act like a master chef. The other will politely eat it and secretly order pizza. \uD83C\uDF5D",
  "A small monthly disagreement is inevitable. Reason: 'You never listen.' Duration: exactly 4.5 hours. Resolution: 'Let\u2019s eat something.' This pattern will repeat for 50 years. \uD83D\uDC95",
];

// ---------------------------------------------------------------------------
// Gift Reveal config
// ---------------------------------------------------------------------------
const GIFT_REVEAL_CONFIG = {
  gift_type: 'voucher' as const,
  gift_data: {
    voucher_brand: 'MakeMyTrip',
    voucher_amount: '\u20B9 10,001',
    voucher_code: '1001-1301-1205-8190',
    voucher_subtitle: 'Gift Voucher',
    reveal_text: 'A Gift For The Couple',
    message_from: 'With love, from the boys \u2764\uFE0F',
  },
};

// ---------------------------------------------------------------------------
// Quiz questions — map from the existing QUIZ_QUESTIONS to the config shape
// ---------------------------------------------------------------------------
const QUIZ_CONFIG_QUESTIONS = QUIZ_QUESTIONS.map((q) => ({
  id: q.id,
  question: q.question,
  options: q.options as string[],
  category: q.category,
  emoji: undefined,
}));

// ---------------------------------------------------------------------------
// Photo Journey chapters — map from the existing CHAPTERS to the config shape
// ---------------------------------------------------------------------------
const PHOTO_JOURNEY_CHAPTERS = CHAPTERS.map((ch) => ({
  title: ch.title,
  subtitle: ch.subtitle,
  emoji: ch.emoji,
  photos: ch.photos.map((p) => ({
    url: p.src ?? '',
    caption: p.caption,
  })),
}));

// ---------------------------------------------------------------------------
// All 9 stages in order
// ---------------------------------------------------------------------------
const STAGES = [
  {
    stage_type: 'phone_gate',
    sort_order: 0,
    config: {},
  },
  {
    stage_type: 'hinge_intro',
    sort_order: 1,
    config: {
      cards: HINGE_INTRO_CARDS,
    },
  },
  {
    stage_type: 'photo_journey',
    sort_order: 2,
    config: {
      chapters: PHOTO_JOURNEY_CHAPTERS,
    },
  },
  {
    stage_type: 'swipe_game',
    sort_order: 3,
    config: {
      scenarios: SWIPE_SCENARIOS,
    },
  },
  {
    stage_type: 'quiz',
    sort_order: 4,
    config: {
      questions: QUIZ_CONFIG_QUESTIONS,
    },
  },
  {
    stage_type: 'waiting_room',
    sort_order: 5,
    config: {},
  },
  {
    stage_type: 'compatibility',
    sort_order: 6,
    config: {},
  },
  {
    stage_type: 'fortune_teller',
    sort_order: 7,
    config: {
      fortunes: FORTUNE_PREDICTIONS,
    },
  },
  {
    stage_type: 'gift_reveal',
    sort_order: 8,
    config: GIFT_REVEAL_CONFIG,
  },
];

// ---------------------------------------------------------------------------
// Main migration function
// ---------------------------------------------------------------------------
async function main() {
  console.log('=== Seed Migration: Manoj & Pooja ===\n');

  // 1. Check if experience already exists
  console.log(`[1/5] Checking if experience "${EXPERIENCE_SLUG}" already exists...`);
  const { data: existing, error: checkError } = await supabase
    .from('experiences')
    .select('id')
    .eq('slug', EXPERIENCE_SLUG)
    .maybeSingle();

  if (checkError) {
    console.error('  Error checking for existing experience:', checkError.message);
    process.exit(1);
  }

  if (existing) {
    console.log(`  Experience "${EXPERIENCE_SLUG}" already exists (id: ${existing.id}). Skipping.`);
    process.exit(0);
  }

  console.log('  Not found — proceeding with creation.\n');

  // 2. Resolve creator_id — use the first creator in the table, or a placeholder
  console.log('[2/5] Resolving creator_id...');
  let creatorId: string;

  const { data: creators, error: creatorsError } = await supabase
    .from('creators')
    .select('id')
    .limit(1);

  if (creatorsError) {
    console.warn('  Warning: Could not query creators table:', creatorsError.message);
    console.warn('  Using placeholder UUID for creator_id.');
    creatorId = '00000000-0000-0000-0000-000000000001';
  } else if (creators && creators.length > 0) {
    creatorId = creators[0].id;
    console.log(`  Using existing creator: ${creatorId}`);
  } else {
    // No creators exist — insert a placeholder
    console.log('  No creators found. Inserting placeholder creator...');
    const { data: newCreator, error: insertCreatorError } = await supabase
      .from('creators')
      .insert({
        id: '00000000-0000-0000-0000-000000000001',
        email: 'admin@lovecraft.app',
        name: 'LoveCraft Admin',
      })
      .select('id')
      .single();

    if (insertCreatorError) {
      console.warn('  Warning: Could not create placeholder creator:', insertCreatorError.message);
      creatorId = '00000000-0000-0000-0000-000000000001';
    } else {
      creatorId = newCreator.id;
      console.log(`  Created placeholder creator: ${creatorId}`);
    }
  }

  console.log();

  // 3. Create the experience
  console.log('[3/5] Creating experience...');
  const { data: experience, error: expError } = await supabase
    .from('experiences')
    .insert({
      ...EXPERIENCE_DATA,
      creator_id: creatorId,
    })
    .select('id, slug')
    .single();

  if (expError) {
    console.error('  Error creating experience:', expError.message);
    process.exit(1);
  }

  const experienceId = experience.id;
  console.log(`  Created experience: ${experience.slug} (id: ${experienceId})\n`);

  // 4. Create all 9 stages
  console.log('[4/5] Creating stages...');
  const stageRows = STAGES.map((s) => ({
    experience_id: experienceId,
    stage_type: s.stage_type,
    sort_order: s.sort_order,
    config: s.config,
    is_enabled: true,
  }));

  const { data: insertedStages, error: stagesError } = await supabase
    .from('stages')
    .insert(stageRows)
    .select('id, stage_type, sort_order');

  if (stagesError) {
    console.error('  Error creating stages:', stagesError.message);
    process.exit(1);
  }

  for (const s of insertedStages ?? []) {
    console.log(`  [${s.sort_order}] ${s.stage_type} (id: ${s.id})`);
  }
  console.log(`  Created ${insertedStages?.length ?? 0} stages.\n`);

  // 5. Create participants
  console.log('[5/5] Creating participants...');
  const participants = [
    {
      experience_id: experienceId,
      role: 'a',
      display_name: 'Manoj',
      phone: '8825607563',
      quiz_answers: {},
      swipe_answers: {},
      quiz_completed: false,
    },
    {
      experience_id: experienceId,
      role: 'b',
      display_name: 'Pooja',
      phone: '8448522614',
      quiz_answers: {},
      swipe_answers: {},
      quiz_completed: false,
    },
  ];

  const { data: insertedParticipants, error: partError } = await supabase
    .from('participants')
    .insert(participants)
    .select('id, role, display_name');

  if (partError) {
    console.error('  Error creating participants:', partError.message);
    process.exit(1);
  }

  for (const p of insertedParticipants ?? []) {
    console.log(`  ${p.display_name} (role: ${p.role}, id: ${p.id})`);
  }

  console.log('\n=== Migration complete! ===');
  console.log(`Experience URL: /e/${EXPERIENCE_SLUG}`);
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------
main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
