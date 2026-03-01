'use client';

import { useState, useEffect } from 'react';
import { GoldDivider } from './Ornaments';
import { supabase, type PlayerID, getPlayerDisplayName } from '@/lib/supabase';

const COOLDOWN_MS = 2 * 60 * 60 * 1000; // 2 hours

interface CooldownScreenProps {
  player: PlayerID;
  completedAt: string; // ISO timestamp
  onReplay: () => void;
}

function formatTimeLeft(ms: number): string {
  if (ms <= 0) return '0:00';
  const totalSec = Math.ceil(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function CooldownScreen({ player, completedAt, onReplay }: CooldownScreenProps) {
  const [timeLeft, setTimeLeft] = useState(() => {
    const elapsed = Date.now() - new Date(completedAt).getTime();
    return Math.max(0, COOLDOWN_MS - elapsed);
  });
  const [resetting, setResetting] = useState(false);

  const expired = timeLeft <= 0;

  useEffect(() => {
    if (expired) return;
    const interval = setInterval(() => {
      const elapsed = Date.now() - new Date(completedAt).getTime();
      const remaining = Math.max(0, COOLDOWN_MS - elapsed);
      setTimeLeft(remaining);
      if (remaining <= 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [completedAt, expired]);

  const handleReplay = async () => {
    setResetting(true);
    await supabase
      .from('players')
      .update({
        quiz_completed: false,
        quiz_answers: {},
        quiz_score: 0,
        completed_at: null,
      })
      .eq('id', player);
    setResetting(false);
    onReplay();
  };

  const playerName = getPlayerDisplayName(player);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center animate-fade-in px-4">
        <div className="text-5xl mb-4">💒</div>
        <h2 className="text-2xl font-normal bg-gradient-to-b from-royal-gold-light to-royal-gold bg-clip-text text-transparent mb-3">
          Welcome Back, {playerName}!
        </h2>

        <GoldDivider />

        {expired ? (
          <>
            <p className="text-base text-royal-muted italic mb-2">
              Your cooldown has expired. Ready to relive the journey?
            </p>
            <p className="text-xs text-royal-muted/50 mb-8">
              All your previous answers will be cleared for a fresh start.
            </p>
            <button
              onClick={handleReplay}
              disabled={resetting}
              className="px-10 py-3.5 bg-gradient-to-br from-royal-red to-royal-red-light border border-royal-gold/40 rounded-xl text-royal-gold-light text-base font-display font-semibold tracking-widest uppercase cursor-pointer hover:brightness-110 transition-all disabled:opacity-50"
            >
              {resetting ? 'Resetting...' : 'Replay Journey'}
            </button>
          </>
        ) : (
          <>
            <p className="text-base text-royal-muted italic mb-2">
              You&apos;ve already completed the journey!
            </p>
            <p className="text-sm text-royal-muted/60 mb-6">
              You can replay in
            </p>

            {/* Countdown */}
            <div className="inline-block bg-royal-gold/[0.06] border border-royal-gold/20 rounded-2xl px-8 py-5 mb-6">
              <div className="text-3xl font-light text-royal-gold tracking-wider" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {formatTimeLeft(timeLeft)}
              </div>
              <div className="text-xs text-royal-muted/40 mt-1">remaining</div>
            </div>

            <p className="text-xs text-royal-muted/40 max-w-xs mx-auto">
              The cooldown ensures both players can view their results before the session resets.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
