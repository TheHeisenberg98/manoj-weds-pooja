import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- Player Config ---
export type PlayerID = 'manoj' | 'pooja';

export const PLAYER_CONFIG: Record<string, PlayerID> = {
  '8825607563': 'manoj',
  '9176316441': 'manoj',
  '8448522614': 'pooja',
};

export function getPlayerByPhone(phone: string): PlayerID | null {
  const cleaned = phone.replace(/\D/g, '').replace(/^91/, '');
  return PLAYER_CONFIG[cleaned] || null;
}

export function getPartnerName(player: PlayerID): string {
  return player === 'manoj' ? 'Pooja' : 'Manoj';
}

export function getPlayerDisplayName(player: PlayerID): string {
  return player === 'manoj' ? 'Manoj' : 'Pooja';
}
