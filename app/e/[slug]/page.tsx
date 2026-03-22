'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import {
  getExperienceBySlug,
  getStagesForExperience,
  getParticipants,
  ensureParticipant,
  resolvePhoneToRole,
  resetParticipant,
} from '@/lib/experienceData';
import type {
  Experience,
  Stage,
  Participant,
  ParticipantRole,
  StageType,
} from '@/lib/types';
import SoundToggle from '@/components/SoundToggle';

// === Stage Component Imports ===
// These will be refactored to accept StageProps, but we import them here
// so the orchestrator can render them dynamically.
import PhoneGate from '@/components/PhoneGate';
import HingeIntro from '@/components/HingeIntro';
import PhotoJourney from '@/components/PhotoJourney';
import SwipeGame from '@/components/SwipeGame';
import CoupleQuiz from '@/components/CoupleQuiz';
import WaitingRoom from '@/components/WaitingRoom';
import CompatibilityMeter from '@/components/CompatibilityMeter';
import Fortuneteller from '@/components/Fortuneteller';
import GiftReveal from '@/components/GiftReveal';

const COOLDOWN_MS = 2 * 60 * 60 * 1000; // 2 hours

/**
 * Map stage types to their React components.
 * Each component will eventually accept the universal StageProps interface.
 * During migration, we use adapter wrappers.
 */
const STAGE_COMPONENTS: Record<StageType, React.ComponentType<any>> = {
  phone_gate: PhoneGate,
  hinge_intro: HingeIntro,
  photo_journey: PhotoJourney,
  swipe_game: SwipeGame,
  quiz: CoupleQuiz,
  waiting_room: WaitingRoom,
  compatibility: CompatibilityMeter,
  fortune_teller: Fortuneteller,
  gift_reveal: GiftReveal,
};

export default function ExperiencePlayer() {
  const params = useParams();
  const slug = params.slug as string;

  // === Loading State ===
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // === Experience Data ===
  const [experience, setExperience] = useState<Experience | null>(null);
  const [stages, setStages] = useState<Stage[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);

  // === Play State ===
  const [currentStageIndex, setCurrentStageIndex] = useState(-1); // -1 = not started (need phone gate or role selection)
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [partner, setPartner] = useState<Participant | null>(null);
  const [inCooldown, setInCooldown] = useState(false);

  // === Admin ===
  const [adminTapCount, setAdminTapCount] = useState(0);

  // --- Load experience data ---
  useEffect(() => {
    async function load() {
      try {
        const exp = await getExperienceBySlug(slug);
        if (!exp) {
          setError('Experience not found');
          setLoading(false);
          return;
        }
        setExperience(exp);

        const [stageData, participantData] = await Promise.all([
          getStagesForExperience(exp.id),
          getParticipants(exp.id),
        ]);
        setStages(stageData);
        setParticipants(participantData);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load experience:', err);
        setError('Something went wrong');
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  // --- Determine starting stage based on access mode ---
  useEffect(() => {
    if (!experience || stages.length === 0) return;

    if (experience.access_mode === 'open') {
      // Open access — skip phone gate, start at first non-gate stage
      const firstNonGate = stages.findIndex((s) => s.stage_type !== 'phone_gate');
      setCurrentStageIndex(firstNonGate >= 0 ? firstNonGate : 0);
    }
    // For 'phone' and 'name_select' modes, we wait for identification
  }, [experience, stages]);

  // --- Handle participant identification ---
  const handleIdentified = useCallback(
    async (role: ParticipantRole, phone?: string) => {
      if (!experience) return;

      const displayName =
        role === 'a' ? experience.person_a_name : experience.person_b_name;

      const p = await ensureParticipant(
        experience.id,
        role,
        phone,
        displayName
      );
      if (!p) return;

      // Check cooldown
      if (p.completed_at) {
        const elapsed = Date.now() - new Date(p.completed_at).getTime();
        if (elapsed < COOLDOWN_MS) {
          setParticipant(p);
          setInCooldown(true);
          return;
        }
        // Cooldown expired — reset
        await resetParticipant(p.id);
        p.quiz_answers = {};
        p.swipe_answers = {};
        p.quiz_completed = false;
        p.completed_at = null;
      }

      setParticipant(p);

      // Find partner
      const partnerRole: ParticipantRole = role === 'a' ? 'b' : 'a';
      const partnerData = participants.find((pt) => pt.role === partnerRole) ?? null;
      setPartner(partnerData);

      // Start at first stage after phone_gate
      const firstPlayStage = stages.findIndex(
        (s) => s.stage_type !== 'phone_gate'
      );
      setCurrentStageIndex(firstPlayStage >= 0 ? firstPlayStage : 0);
    },
    [experience, stages, participants]
  );

  // --- Phone gate handler (resolves phone → role, then calls handleIdentified) ---
  const handlePhoneVerified = useCallback(
    async (phone: string) => {
      if (!experience) return;
      const role = resolvePhoneToRole(phone, experience.access_phones);
      if (!role) return; // Phone not recognized
      await handleIdentified(role, phone);
    },
    [experience, handleIdentified]
  );

  // --- Advance to next stage ---
  const advanceStage = useCallback(() => {
    setCurrentStageIndex((prev) => {
      if (prev < stages.length - 1) return prev + 1;
      return prev; // Already at last stage
    });
  }, [stages]);

  // --- Replay ---
  const handleReplay = useCallback(() => {
    setCurrentStageIndex(-1);
    setParticipant(null);
    setPartner(null);
    setInCooldown(false);
  }, []);

  // --- Admin tap ---
  const handleAdminTap = () => {
    const newCount = adminTapCount + 1;
    setAdminTapCount(newCount);
    if (newCount >= 5) {
      // TODO: Show admin panel
      setAdminTapCount(0);
    }
    setTimeout(() => setAdminTapCount(0), 3000);
  };

  // === Render ===

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">✨</div>
          <p className="text-royal-muted text-sm tracking-widest uppercase">
            Loading your experience...
          </p>
        </div>
      </div>
    );
  }

  if (error || !experience) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🔒</div>
          <p className="text-royal-muted">
            {error || 'Experience not found'}
          </p>
        </div>
      </div>
    );
  }

  // --- Current stage resolution ---
  const currentStage = currentStageIndex >= 0 ? stages[currentStageIndex] : null;

  // --- Phone gate / identification step ---
  if (!participant && experience.access_mode === 'phone') {
    const gateStage = stages.find((s) => s.stage_type === 'phone_gate');
    return (
      <div className="min-h-screen relative">
        <ExperienceBg />
        <div className="max-w-[480px] mx-auto px-5 relative z-10">
          {/* 
            During migration: PhoneGate still uses the old interface.
            TODO: Refactor PhoneGate to accept StageProps.
            For now, we pass a shim. 
          */}
          <PhoneGateShim
            experience={experience}
            config={gateStage?.config ?? {}}
            onPhoneVerified={handlePhoneVerified}
          />
        </div>
        <SoundToggle />
      </div>
    );
  }

  if (!participant && experience.access_mode === 'name_select') {
    return (
      <div className="min-h-screen relative">
        <ExperienceBg />
        <div className="max-w-[480px] mx-auto px-5 relative z-10">
          <NameSelectGate
            experience={experience}
            onSelected={handleIdentified}
          />
        </div>
        <SoundToggle />
      </div>
    );
  }

  // --- Cooldown screen ---
  if (inCooldown && participant?.completed_at) {
    return (
      <div className="min-h-screen relative">
        <ExperienceBg />
        <div className="max-w-[480px] mx-auto px-5 relative z-10">
          <CooldownDisplay
            completedAt={participant.completed_at}
            onReplay={handleReplay}
          />
        </div>
      </div>
    );
  }

  // --- Stage rendering ---
  if (!currentStage || !participant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-royal-muted">Preparing your experience...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <ExperienceBg />
      <div className="max-w-[480px] mx-auto px-5 relative z-10">
        <StageRenderer
          stage={currentStage}
          experience={experience}
          participant={participant}
          partner={partner}
          onComplete={advanceStage}
          onReplay={handleReplay}
        />
      </div>
      <SoundToggle />
      <div
        onClick={handleAdminTap}
        className="fixed bottom-0 right-0 w-16 h-16 z-50"
      />
    </div>
  );
}

// ============================================
// Sub-components
// ============================================

function ExperienceBg() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-0"
      style={{
        backgroundImage: `
          radial-gradient(ellipse at 20% 50%, rgba(139, 28, 28, 0.15) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 20%, rgba(212, 168, 83, 0.08) 0%, transparent 40%),
          radial-gradient(ellipse at 50% 80%, rgba(139, 28, 28, 0.1) 0%, transparent 50%)
        `,
      }}
    />
  );
}

/**
 * Shim for PhoneGate during migration.
 * Wraps the new data model to work with the existing component.
 * TODO: Remove this once PhoneGate accepts StageProps.
 */
function PhoneGateShim({
  experience,
  config,
  onPhoneVerified,
}: {
  experience: Experience;
  config: any;
  onPhoneVerified: (phone: string) => void;
}) {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [step, setStep] = useState<'phone' | 'otp' | 'verified'>('phone');
  const [error, setError] = useState('');

  const handlePhoneSend = () => {
    const role = resolvePhoneToRole(phone, experience.access_phones);
    if (role) {
      setError('');
      setStep('otp');
    } else {
      setError('This experience is exclusively crafted for the special ones ✨');
    }
  };

  const handleOtpComplete = () => {
    setStep('verified');
    setTimeout(() => onPhoneVerified(phone), 1500);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative animate-fade-in">
      <div className="relative z-10 text-center w-full max-w-[360px]">
        <div className="text-sm tracking-[6px] text-royal-gold mb-2 uppercase">
          {config.welcome_text ?? experience.subtitle ?? '✨'}
        </div>
        <h1 className="text-5xl font-light leading-tight my-2 bg-gradient-to-b from-royal-gold-light via-royal-gold to-royal-gold-dark bg-clip-text text-transparent">
          {experience.person_a_name}
        </h1>
        <div className="text-lg text-royal-gold italic">&</div>
        <h1 className="text-5xl font-light leading-tight mt-2 mb-4 bg-gradient-to-b from-royal-gold-light via-royal-gold to-royal-gold-dark bg-clip-text text-transparent">
          {experience.person_b_name}
        </h1>

        {step === 'phone' && (
          <div className="mt-8 animate-slide-up">
            <p className="text-sm text-royal-muted mb-4">
              Enter your phone number to begin
            </p>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Your phone number"
              className="w-full text-center text-xl bg-transparent border-b-2 border-royal-gold/30 text-royal-cream py-3 outline-none focus:border-royal-gold transition-colors"
            />
            {error && (
              <p className="text-sm text-red-400 mt-2">{error}</p>
            )}
            <button
              onClick={handlePhoneSend}
              disabled={phone.length < 10}
              className="mt-6 px-10 py-3 bg-gradient-to-br from-royal-red to-royal-red-light border border-royal-gold/40 rounded-xl text-royal-gold-light text-base font-display font-semibold tracking-widest uppercase cursor-pointer disabled:opacity-30"
            >
              Continue
            </button>
          </div>
        )}

        {step === 'otp' && (
          <div className="mt-8 animate-slide-up">
            <p className="text-sm text-royal-muted mb-4">
              Enter any 4 digits to verify
            </p>
            <div className="flex justify-center gap-3">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  type="tel"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/, '');
                    const next = [...otp];
                    next[i] = val;
                    setOtp(next);
                    if (val && i < 3) {
                      const nextInput = document.querySelector<HTMLInputElement>(
                        `[data-otp="${i + 1}"]`
                      );
                      nextInput?.focus();
                    }
                    if (next.every((d) => d !== '')) {
                      setTimeout(handleOtpComplete, 800);
                    }
                  }}
                  data-otp={i}
                  className="w-14 h-14 text-center text-2xl bg-royal-gold/10 border border-royal-gold/30 rounded-xl text-royal-cream outline-none focus:border-royal-gold"
                />
              ))}
            </div>
          </div>
        )}

        {step === 'verified' && (
          <div className="mt-8 animate-scale-in">
            <div className="text-4xl mb-2">✅</div>
            <p className="text-royal-gold">Welcome! Loading your experience...</p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Name selection gate for 'name_select' access mode.
 */
function NameSelectGate({
  experience,
  onSelected,
}: {
  experience: Experience;
  onSelected: (role: ParticipantRole) => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 animate-fade-in">
      <div className="text-sm tracking-[6px] text-royal-gold mb-6 uppercase">
        Who are you?
      </div>
      <div className="flex gap-4">
        <button
          onClick={() => onSelected('a')}
          className="px-8 py-4 bg-gradient-to-br from-royal-gold/10 to-royal-gold/5 border-2 border-royal-gold/40 rounded-2xl text-royal-gold-light text-xl font-display hover:border-royal-gold transition-all"
        >
          {experience.person_a_name}
        </button>
        <button
          onClick={() => onSelected('b')}
          className="px-8 py-4 bg-gradient-to-br from-royal-gold/10 to-royal-gold/5 border-2 border-royal-gold/40 rounded-2xl text-royal-gold-light text-xl font-display hover:border-royal-gold transition-all"
        >
          {experience.person_b_name}
        </button>
      </div>
    </div>
  );
}

/**
 * Cooldown display.
 */
function CooldownDisplay({
  completedAt,
  onReplay,
}: {
  completedAt: string;
  onReplay: () => void;
}) {
  const [remaining, setRemaining] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Date.now() - new Date(completedAt).getTime();
      const left = COOLDOWN_MS - elapsed;
      if (left <= 0) {
        onReplay();
        return;
      }
      const h = Math.floor(left / 3600000);
      const m = Math.floor((left % 3600000) / 60000);
      const s = Math.floor((left % 60000) / 1000);
      setRemaining(`${h}h ${m}m ${s}s`);
    }, 1000);
    return () => clearInterval(interval);
  }, [completedAt, onReplay]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="text-4xl mb-4">⏳</div>
      <h2 className="text-2xl text-royal-gold font-normal mb-2">
        You&apos;ve already completed this experience
      </h2>
      <p className="text-royal-muted text-sm mb-6">
        You can replay in {remaining}
      </p>
    </div>
  );
}

/**
 * Dynamic stage renderer — renders the correct component based on stage_type.
 * During migration, this passes old-style props. Once all components
 * are refactored to StageProps, this becomes clean.
 */
function StageRenderer({
  stage,
  experience,
  participant,
  partner,
  onComplete,
  onReplay,
}: {
  stage: Stage;
  experience: Experience;
  participant: Participant;
  partner: Participant | null;
  onComplete: () => void;
  onReplay: () => void;
}) {
  // TODO: Once components are refactored, pass StageProps directly.
  // For now, each stage type gets its own adapter logic.

  const stageProps = {
    experience,
    participant,
    partner,
    stageConfig: stage.config,
    onComplete,
    onReplay,
  };

  // The Component from registry
  const Component = STAGE_COMPONENTS[stage.stage_type];

  if (!Component) {
    return (
      <div className="py-16 text-center">
        <p className="text-royal-muted">Unknown stage: {stage.stage_type}</p>
        <button onClick={onComplete} className="mt-4 text-royal-gold underline">
          Skip →
        </button>
      </div>
    );
  }

  // Pass the universal props — components will be refactored incrementally
  return <Component {...stageProps} />;
}
