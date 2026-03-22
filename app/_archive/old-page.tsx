'use client';

import { useState, useCallback } from 'react';
import PhoneGate from '@/components/PhoneGate';
import HingeIntro from '@/components/HingeIntro';
import PhotoJourney from '@/components/PhotoJourney';
import SwipeGame from '@/components/SwipeGame';
import CoupleQuiz from '@/components/CoupleQuiz';
import WaitingRoom from '@/components/WaitingRoom';
import CompatibilityMeter from '@/components/CompatibilityMeter';
import Fortuneteller from '@/components/Fortuneteller';
import GiftReveal from '@/components/GiftReveal';
import AdminPanel from '@/components/AdminPanel';
import SoundToggle from '@/components/SoundToggle';
import CooldownScreen from '@/components/CooldownScreen';
import { supabase, type PlayerID } from '@/lib/supabase';

const COOLDOWN_MS = 2 * 60 * 60 * 1000; // 2 hours

type Stage =
  | 'gate'
  | 'cooldown'
  | 'hinge'
  | 'journey'
  | 'swipe'
  | 'quiz'
  | 'waiting'
  | 'compatibility'
  | 'pandit'
  | 'gift';

export default function Home() {
  const [stage, setStage] = useState<Stage>('gate');
  const [player, setPlayer] = useState<PlayerID | null>(null);
  const [completedAt, setCompletedAt] = useState<string | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminTapCount, setAdminTapCount] = useState(0);

  const handleVerified = useCallback(async (p: PlayerID) => {
    setPlayer(p);

    // Check if this player has already completed the journey
    const { data } = await supabase
      .from('players')
      .select('completed_at')
      .eq('id', p)
      .single();

    if (data?.completed_at) {
      const elapsed = Date.now() - new Date(data.completed_at).getTime();

      if (elapsed >= COOLDOWN_MS) {
        // Cooldown expired — auto-reset and let them play fresh
        await supabase
          .from('players')
          .update({
            quiz_completed: false,
            quiz_answers: {},
            quiz_score: 0,
            completed_at: null,
          })
          .eq('id', p);
        setStage('hinge');
      } else {
        // Still in cooldown — show countdown
        setCompletedAt(data.completed_at);
        setStage('cooldown');
      }
    } else {
      // Fresh session
      setStage('hinge');
    }
  }, []);

  // Hidden admin trigger: tap bottom-right corner 5 times
  const handleAdminTap = () => {
    const newCount = adminTapCount + 1;
    setAdminTapCount(newCount);
    if (newCount >= 5) {
      setShowAdmin(true);
      setAdminTapCount(0);
    }
    setTimeout(() => setAdminTapCount(0), 3000);
  };

  // Navigate to any stage (for admin skip)
  const goTo = useCallback((s: Stage) => setStage(s), []);

  // Replay: reset frontend state back to gate
  const handleReplay = useCallback(() => {
    setStage('gate');
    setPlayer(null);
    setCompletedAt(null);
  }, []);

  // Memoize all stage transition callbacks to prevent child re-subscriptions
  const goToHinge = useCallback(() => goTo('journey'), [goTo]);
  const goToSwipe = useCallback(() => goTo('swipe'), [goTo]);
  const goToQuiz = useCallback(() => goTo('quiz'), [goTo]);
  const goToWaiting = useCallback(() => goTo('waiting'), [goTo]);
  const goToCompatibility = useCallback(() => goTo('compatibility'), [goTo]);
  const goToPandit = useCallback(() => goTo('pandit'), [goTo]);
  const goToGift = useCallback(() => goTo('gift'), [goTo]);

  return (
    <div className="min-h-screen relative">
      {/* Background ambient gradients */}
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

      {/* Content container */}
      <div className="max-w-[480px] mx-auto px-5 relative z-10">
        {stage === 'gate' && (
          <PhoneGate onVerified={handleVerified} />
        )}
        {stage === 'cooldown' && player && completedAt && (
          <CooldownScreen player={player} completedAt={completedAt} onReplay={handleReplay} />
        )}
        {stage === 'hinge' && player && (
          <HingeIntro player={player} onComplete={goToHinge} />
        )}
        {stage === 'journey' && (
          <PhotoJourney onComplete={goToSwipe} />
        )}
        {stage === 'swipe' && player && (
          <SwipeGame player={player} onComplete={goToQuiz} />
        )}
        {stage === 'quiz' && player && (
          <CoupleQuiz player={player} onComplete={goToWaiting} />
        )}
        {stage === 'waiting' && player && (
          <WaitingRoom player={player} onBothComplete={goToCompatibility} />
        )}
        {stage === 'compatibility' && player && (
          <CompatibilityMeter player={player} onComplete={goToPandit} />
        )}
        {stage === 'pandit' && player && (
          <Fortuneteller player={player} onComplete={goToGift} />
        )}
        {stage === 'gift' && player && (
          <GiftReveal player={player} onReplay={handleReplay} />
        )}
      </div>

      {/* Sound mute/unmute toggle */}
      <SoundToggle />

      {/* Hidden admin trigger — tap bottom-right 5 times */}
      <div
        onClick={handleAdminTap}
        className="fixed bottom-0 right-0 w-16 h-16 z-50"
      />

      {/* Admin panel overlay */}
      {showAdmin && (
        <AdminPanel
          onClose={() => setShowAdmin(false)}
          onReset={() => {
            setStage('gate');
            setPlayer(null);
            setShowAdmin(false);
          }}
        />
      )}
    </div>
  );
}
