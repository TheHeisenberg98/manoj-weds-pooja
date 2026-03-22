// ============================================
// LoveCraft — Multi-Tenant Types
// ============================================

// --- Database Row Types ---

export interface Creator {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  auth_provider: string;
  created_at: string;
  updated_at: string;
}

export type Occasion =
  | 'wedding'
  | 'anniversary'
  | 'birthday'
  | 'friendship'
  | 'family'
  | 'custom';

export type AccessMode = 'phone' | 'name_select' | 'open';

export interface PhoneMapping {
  phone: string;
  maps_to: 'a' | 'b';
}

export interface ExperienceTheme {
  primaryBg: string;
  accentColor: string;
  goldColor: string;
  goldColorLight: string;
  goldColorDark: string;
  creamColor: string;
  mutedColor: string;
  fontFamily: string;
}

export interface Experience {
  id: string;
  creator_id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  occasion: Occasion;
  person_a_name: string;
  person_b_name: string;
  person_a_label: string;
  person_b_label: string;
  theme: ExperienceTheme;
  gift_config: GiftConfig;
  access_phones: PhoneMapping[];
  access_mode: AccessMode;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

// --- Stage Types ---

export type StageType =
  | 'phone_gate'
  | 'hinge_intro'
  | 'photo_journey'
  | 'swipe_game'
  | 'quiz'
  | 'waiting_room'
  | 'compatibility'
  | 'fortune_teller'
  | 'gift_reveal';

export interface Stage {
  id: string;
  experience_id: string;
  stage_type: StageType;
  sort_order: number;
  config: StageConfig;
  is_enabled: boolean;
  created_at: string;
}

// --- Stage Config Shapes ---

export interface PhoneGateConfig {
  welcome_text?: string;
}

export interface HingeIntroCard {
  text: string;
  emoji?: string;
  subtext?: string;
}

export interface HingeIntroConfig {
  cards: HingeIntroCard[];
}

export interface PhotoChapter {
  title: string;
  subtitle: string;
  emoji: string;
  photos: { url: string; caption: string }[];
}

export interface PhotoJourneyConfig {
  chapters: PhotoChapter[];
}

export interface SwipeScenario {
  text: string;
  emoji: string;
}

export interface SwipeGameConfig {
  scenarios: SwipeScenario[];
  left_label?: string;   // defaults to person_a_name
  right_label?: string;  // defaults to person_b_name
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  category: string;
  emoji?: string;
}

export interface QuizConfig {
  questions: QuizQuestion[];
}

export interface WaitingRoomConfig {
  message?: string;
}

export interface CompatibilityConfig {
  // Derived from quiz — no config needed
}

export interface FortuneTellerConfig {
  fortunes?: string[];
}

export type GiftType = 'voucher' | 'message' | 'image' | 'link';

export interface GiftConfig {
  gift_type?: GiftType;
  // Voucher
  voucher_brand?: string;
  voucher_amount?: string;
  voucher_code?: string;
  voucher_subtitle?: string;
  // Message
  message_text?: string;
  message_from?: string;
  // Image
  image_url?: string;
  // Link
  link_url?: string;
  link_label?: string;
  // Common
  reveal_text?: string;
}

export interface GiftRevealConfig {
  gift_type: GiftType;
  gift_data: GiftConfig;
}

// Union type for stage configs
export type StageConfig =
  | PhoneGateConfig
  | HingeIntroConfig
  | PhotoJourneyConfig
  | SwipeGameConfig
  | QuizConfig
  | WaitingRoomConfig
  | CompatibilityConfig
  | FortuneTellerConfig
  | GiftRevealConfig;

// Map stage types to their config types (for type-safe access)
export interface StageConfigMap {
  phone_gate: PhoneGateConfig;
  hinge_intro: HingeIntroConfig;
  photo_journey: PhotoJourneyConfig;
  swipe_game: SwipeGameConfig;
  quiz: QuizConfig;
  waiting_room: WaitingRoomConfig;
  compatibility: CompatibilityConfig;
  fortune_teller: FortuneTellerConfig;
  gift_reveal: GiftRevealConfig;
}

// --- Participant Types ---

export type ParticipantRole = 'a' | 'b';

export interface Participant {
  id: string;
  experience_id: string;
  role: ParticipantRole;
  phone: string | null;
  display_name: string | null;
  current_stage_id: string | null;
  quiz_answers: Record<string, number>;
  swipe_answers: Record<string, string>;
  quiz_completed: boolean;
  completed_at: string | null;
  created_at: string;
}

// --- Session ---

export interface Session {
  id: string;
  participant_id: string;
  experience_id: string;
  started_at: string;
  completed_at: string | null;
  user_agent: string | null;
}

// --- Media ---

export type MediaType = 'photo' | 'sound';

export interface Media {
  id: string;
  experience_id: string;
  media_type: MediaType;
  storage_path: string;
  public_url: string | null;
  label: string | null;
  sort_order: number;
  created_at: string;
}

// ============================================
// Component Props — New Universal Contract
// ============================================

/**
 * Every stage component receives these props.
 * This replaces the old `{ player; onComplete }` pattern used in the single-couple version.
 */
export interface StageProps<T extends StageType = StageType> {
  experience: Experience;
  participant: Participant;
  partner: Participant | null;
  stageConfig: StageConfigMap[T];
  onComplete: () => void;
}

// ============================================
// Creator Dashboard Types
// ============================================

export interface ExperienceListItem {
  id: string;
  slug: string;
  title: string;
  occasion: Occasion;
  person_a_name: string;
  person_b_name: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateExperienceInput {
  title: string;
  subtitle?: string;
  occasion: Occasion;
  person_a_name: string;
  person_b_name: string;
  access_mode: AccessMode;
  slug?: string;  // auto-generated if not provided
}

export interface UpdateExperienceInput {
  title?: string;
  subtitle?: string;
  occasion?: Occasion;
  person_a_name?: string;
  person_b_name?: string;
  person_a_label?: string;
  person_b_label?: string;
  theme?: Partial<ExperienceTheme>;
  gift_config?: Partial<GiftConfig>;
  access_phones?: PhoneMapping[];
  access_mode?: AccessMode;
  is_published?: boolean;
}

// ============================================
// Stage Registry (for creator dashboard stage picker)
// ============================================

export interface StageRegistryEntry {
  type: StageType;
  label: string;
  description: string;
  icon: string;
  required: boolean;  // Some stages are always present
  defaultConfig: StageConfig;
}

export const STAGE_REGISTRY: StageRegistryEntry[] = [
  {
    type: 'phone_gate',
    label: 'Phone Gate',
    description: 'Verify participants via phone number',
    icon: '📱',
    required: false,
    defaultConfig: {},
  },
  {
    type: 'hinge_intro',
    label: 'Animated Intro',
    description: 'Hinge-style animated intro cards',
    icon: '💫',
    required: false,
    defaultConfig: { cards: [] },
  },
  {
    type: 'photo_journey',
    label: 'Photo Journey',
    description: 'Scroll through photo chapters with captions',
    icon: '📸',
    required: false,
    defaultConfig: { chapters: [] },
  },
  {
    type: 'swipe_game',
    label: 'Swipe Game',
    description: '"Who\'s more likely to..." Tinder-style swipe',
    icon: '👆',
    required: false,
    defaultConfig: { scenarios: [] },
  },
  {
    type: 'quiz',
    label: 'Matching Quiz',
    description: 'Both players answer same questions, compare at end',
    icon: '❓',
    required: false,
    defaultConfig: { questions: [] },
  },
  {
    type: 'waiting_room',
    label: 'Waiting Room',
    description: 'Realtime sync — wait for partner to finish',
    icon: '⏳',
    required: false,
    defaultConfig: {},
  },
  {
    type: 'compatibility',
    label: 'Compatibility Score',
    description: 'Animated reveal of quiz match percentage',
    icon: '💕',
    required: false,
    defaultConfig: {},
  },
  {
    type: 'fortune_teller',
    label: 'Fortune Teller',
    description: 'Fun fortune/prediction reveal',
    icon: '🔮',
    required: false,
    defaultConfig: {},
  },
  {
    type: 'gift_reveal',
    label: 'Gift Reveal',
    description: 'Confetti + gift card/message reveal',
    icon: '🎁',
    required: false,
    defaultConfig: { gift_type: 'message', gift_data: {} },
  },
];

// ============================================
// Default Theme Presets
// ============================================

export const THEME_PRESETS: Record<string, ExperienceTheme & { name: string }> = {
  royal_indian: {
    name: 'Royal Indian',
    primaryBg: '#1A0A0A',
    accentColor: '#8B1C1C',
    goldColor: '#D4A853',
    goldColorLight: '#E8D5A3',
    goldColorDark: '#B8924A',
    creamColor: '#F5E6D0',
    mutedColor: '#A89A8C',
    fontFamily: 'Cormorant Garamond',
  },
  midnight_blue: {
    name: 'Midnight Elegance',
    primaryBg: '#0A0A1A',
    accentColor: '#1C2D8B',
    goldColor: '#C9B037',
    goldColorLight: '#E8D880',
    goldColorDark: '#9A8422',
    creamColor: '#E8E6F0',
    mutedColor: '#8C8CA0',
    fontFamily: 'Playfair Display',
  },
  garden_blush: {
    name: 'Garden Blush',
    primaryBg: '#1A0F0F',
    accentColor: '#8B4557',
    goldColor: '#D4A87A',
    goldColorLight: '#E8CDB0',
    goldColorDark: '#B88A5A',
    creamColor: '#F5EDE6',
    mutedColor: '#A8948C',
    fontFamily: 'Lora',
  },
  modern_minimal: {
    name: 'Modern Minimal',
    primaryBg: '#111111',
    accentColor: '#333333',
    goldColor: '#FFFFFF',
    goldColorLight: '#F0F0F0',
    goldColorDark: '#CCCCCC',
    creamColor: '#E0E0E0',
    mutedColor: '#888888',
    fontFamily: 'DM Serif Display',
  },
};
