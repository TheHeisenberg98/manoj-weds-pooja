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
import DancingCouple from '@/components/DancingCouple';
import GiftReveal from '@/components/GiftReveal';
import AdminPanel from '@/components/AdminPanel';
import { type PlayerID } from '@/lib/supabase';

type Stage =
  | 'gate'
  | 'hinge'
  | 'journey'
  | 'swipe'
  | 'quiz'
  | 'waiting'
  | 'compatibility'
  | 'pandit'
  | 'dance'
  | 'gift';

export default function Home() {
  const [stage, setStage] = useState<Stage>('gate');
  const [player, setPlayer] = useState<PlayerID | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminTapCount, setAdminTapCount] = useState(0);

  const handleVerified = useCallback((p: PlayerID) => {
    setPlayer(p);
    setStage('hinge');
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
        {stage === 'hinge' && player && (
          <HingeIntro player={player} onComplete={() => goTo('journey')} />
        )}
        {stage === 'journey' && (
          <PhotoJourney onComplete={() => goTo('swipe')} />
        )}
        {stage === 'swipe' && player && (
          <SwipeGame player={player} onComplete={() => goTo('quiz')} />
        )}
        {stage === 'quiz' && player && (
          <CoupleQuiz player={player} onComplete={() => goTo('waiting')} />
        )}
        {stage === 'waiting' && player && (
          <WaitingRoom player={player} onBothComplete={() => goTo('compatibility')} />
        )}
        {stage === 'compatibility' && player && (
          <CompatibilityMeter player={player} onComplete={() => goTo('pandit')} />
        )}
        {stage === 'pandit' && player && (
          <Fortuneteller player={player} onComplete={() => goTo('dance')} />
        )}
        {stage === 'dance' && player && (
          <DancingCouple player={player} onComplete={() => goTo('gift')} />
        )}
        {stage === 'gift' && player && (
          <GiftReveal player={player} />
        )}
      </div>

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
