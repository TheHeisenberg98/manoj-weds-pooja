import { supabase } from './supabase';
import type {
  Experience,
  Stage,
  Participant,
  ParticipantRole,
  PhoneMapping,
} from './types';

// ============================================
// Experience Fetching
// ============================================

export async function getExperienceBySlug(slug: string): Promise<Experience | null> {
  const { data, error } = await supabase
    .from('experiences')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (error || !data) return null;
  return data as Experience;
}

export async function getExperienceById(id: string): Promise<Experience | null> {
  const { data, error } = await supabase
    .from('experiences')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return data as Experience;
}

// ============================================
// Stage Fetching
// ============================================

export async function getAllStagesForExperience(experienceId: string): Promise<Stage[]> {
  const { data, error } = await supabase
    .from('stages')
    .select('*')
    .eq('experience_id', experienceId)
    .order('sort_order', { ascending: true });

  if (error || !data) return [];
  return data as Stage[];
}

export async function getStagesForExperience(experienceId: string): Promise<Stage[]> {
  const { data, error } = await supabase
    .from('stages')
    .select('*')
    .eq('experience_id', experienceId)
    .eq('is_enabled', true)
    .order('sort_order', { ascending: true });

  if (error || !data) return [];
  return data as Stage[];
}

// ============================================
// Participant Management
// ============================================

export async function getParticipants(experienceId: string): Promise<Participant[]> {
  const { data, error } = await supabase
    .from('participants')
    .select('id, experience_id, role, display_name, current_stage_id, quiz_answers, swipe_answers, quiz_completed, completed_at, created_at')
    .eq('experience_id', experienceId);

  if (error || !data) return [];
  return data as Participant[];
}

export async function getParticipantByRole(
  experienceId: string,
  role: ParticipantRole
): Promise<Participant | null> {
  const { data, error } = await supabase
    .from('participants')
    .select('id, experience_id, role, display_name, current_stage_id, quiz_answers, swipe_answers, quiz_completed, completed_at, created_at')
    .eq('experience_id', experienceId)
    .eq('role', role)
    .single();

  if (error || !data) return null;
  return data as Participant;
}

/**
 * Resolve a phone number to a participant role for a given experience.
 * Returns the role ('a' | 'b') or null if phone not recognized.
 */
export function resolvePhoneToRole(
  phone: string,
  accessPhones: PhoneMapping[]
): ParticipantRole | null {
  const cleaned = phone.replace(/\D/g, '').replace(/^91/, '');
  const mapping = accessPhones.find((m) => {
    const cleanedMapping = m.phone.replace(/\D/g, '').replace(/^91/, '');
    return cleanedMapping === cleaned;
  });
  return mapping?.maps_to ?? null;
}

/**
 * Ensure participant row exists for a given experience + role.
 * Creates if missing, returns existing if present.
 */
export async function ensureParticipant(
  experienceId: string,
  role: ParticipantRole,
  phone?: string,
  displayName?: string
): Promise<Participant | null> {
  // Try to get existing
  const existing = await getParticipantByRole(experienceId, role);
  if (existing) return existing;

  // Create new
  const { data, error } = await supabase
    .from('participants')
    .insert({
      experience_id: experienceId,
      role,
      phone: phone ?? null,
      display_name: displayName ?? null,
    })
    .select()
    .single();

  if (error || !data) return null;
  return data as Participant;
}

// ============================================
// Quiz / Play State Updates
// ============================================

export async function updateParticipantQuizAnswers(
  participantId: string,
  answers: Record<string, number>
) {
  return supabase
    .from('participants')
    .update({
      quiz_answers: answers,
      quiz_completed: true,
    })
    .eq('id', participantId);
}

export async function updateParticipantSwipeAnswers(
  participantId: string,
  answers: Record<string, string>
) {
  return supabase
    .from('participants')
    .update({ swipe_answers: answers })
    .eq('id', participantId);
}

export async function markParticipantComplete(participantId: string) {
  return supabase
    .from('participants')
    .update({ completed_at: new Date().toISOString() })
    .eq('id', participantId);
}

export async function resetParticipant(participantId: string) {
  return supabase
    .from('participants')
    .update({
      quiz_answers: {},
      swipe_answers: {},
      quiz_completed: false,
      completed_at: null,
      current_stage_id: null,
    })
    .eq('id', participantId);
}

// ============================================
// Creator: Experience CRUD
// ============================================

export async function getCreatorExperiences(creatorId: string) {
  const { data, error } = await supabase
    .from('experiences')
    .select('id, slug, title, occasion, person_a_name, person_b_name, is_published, created_at, updated_at')
    .eq('creator_id', creatorId)
    .order('updated_at', { ascending: false });

  if (error || !data) return [];
  return data;
}

export async function createExperience(
  creatorId: string,
  input: {
    title: string;
    subtitle?: string;
    occasion: string;
    person_a_name: string;
    person_b_name: string;
    access_mode?: string;
    slug?: string;
  }
) {
  const slug =
    input.slug ??
    input.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

  const { data, error } = await supabase
    .from('experiences')
    .insert({
      creator_id: creatorId,
      slug,
      title: input.title,
      subtitle: input.subtitle ?? null,
      occasion: input.occasion,
      person_a_name: input.person_a_name,
      person_b_name: input.person_b_name,
      access_mode: input.access_mode ?? 'phone',
    })
    .select()
    .single();

  if (error) throw error;
  return data as Experience;
}

export async function updateExperience(
  experienceId: string,
  updates: Record<string, any>
) {
  const { data, error } = await supabase
    .from('experiences')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', experienceId)
    .select()
    .single();

  if (error) throw error;
  return data as Experience;
}

export async function deleteExperience(experienceId: string) {
  return supabase.from('experiences').delete().eq('id', experienceId);
}

// ============================================
// Creator: Stage CRUD
// ============================================

export async function createStage(
  experienceId: string,
  stageType: string,
  sortOrder: number,
  config: Record<string, any> = {}
) {
  const { data, error } = await supabase
    .from('stages')
    .insert({
      experience_id: experienceId,
      stage_type: stageType,
      sort_order: sortOrder,
      config,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Stage;
}

export async function updateStage(
  stageId: string,
  updates: { config?: Record<string, any>; sort_order?: number; is_enabled?: boolean }
) {
  const { data, error } = await supabase
    .from('stages')
    .update(updates)
    .eq('id', stageId)
    .select()
    .single();

  if (error) throw error;
  return data as Stage;
}

export async function deleteStage(stageId: string) {
  return supabase.from('stages').delete().eq('id', stageId);
}

export async function reorderStages(
  stages: { id: string; sort_order: number }[]
) {
  // Supabase doesn't support batch updates, so we do them sequentially
  const promises = stages.map((s) =>
    supabase.from('stages').update({ sort_order: s.sort_order }).eq('id', s.id)
  );
  await Promise.all(promises);
}

// ============================================
// Helpers
// ============================================

/**
 * Create a default set of stages for a new experience.
 * Gives creators a starting template they can customize.
 */
export async function createDefaultStages(experienceId: string) {
  const defaultStages = [
    { type: 'phone_gate', order: 1, config: {} },
    { type: 'hinge_intro', order: 2, config: { cards: [] } },
    { type: 'photo_journey', order: 3, config: { chapters: [] } },
    { type: 'swipe_game', order: 4, config: { scenarios: [] } },
    { type: 'quiz', order: 5, config: { questions: [] } },
    { type: 'waiting_room', order: 6, config: {} },
    { type: 'compatibility', order: 7, config: {} },
    { type: 'fortune_teller', order: 8, config: {} },
    { type: 'gift_reveal', order: 9, config: { gift_type: 'message', gift_data: {} } },
  ];

  const { data, error } = await supabase
    .from('stages')
    .insert(
      defaultStages.map((s) => ({
        experience_id: experienceId,
        stage_type: s.type,
        sort_order: s.order,
        config: s.config,
      }))
    )
    .select();

  if (error) throw error;
  return data as Stage[];
}
