'use client';

import { useState, useEffect } from 'react';
import { GoldDivider, MandalaRing } from './Ornaments';
import { supabase, type PlayerID, getPartnerName, getPlayerDisplayName } from '@/lib/supabase';

interface WaitingRoomProps {
  player: PlayerID;
  onBothComplete: () => void;
}

export default function WaitingRoom({ player, onBothComplete }: WaitingRoomProps) {
  const [partnerDone, setPartnerDone] = useState(false);
  const [checking, setChecking] = useState(true);
  const [dots, setDots] = useState('');

  const partnerName = getPartnerName(player);
  const partnerId = player === 'manoj' ? 'pooja' : 'manoj';

  useEffect(() => {
    // Animate dots
    const dotInterval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? '' : d + '.'));
    }, 500);

    // Check partner status immediately
    async function checkPartner() {
      const { data } = await supabase
        .from('players')
        .select('quiz_completed')
        .eq('id', partnerId)
        .single();

      if (data?.quiz_completed) {
        setPartnerDone(true);
        setTimeout(() => onBothComplete(), 2000);
      }
      setChecking(false);
    }

    checkPartner();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('players-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'players',
          filter: `id=eq.${partnerId}`,
        },
        (payload: any) => {
          if (payload.new?.quiz_completed) {
            setPartnerDone(true);
            setTimeout(() => onBothComplete(), 2000);
          }
        }
      )
      .subscribe();

    return () => {
      clearInterval(dotInterval);
      supabase.removeChannel(channel);
    };
  }, [partnerId, onBothComplete]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative">
      <MandalaRing size={300} opacity={0.04} />

      <div className="relative z-10 text-center max-w-sm">
        {!partnerDone ? (
          <div className="animate-fade-in">
            <div className="text-6xl mb-6">⏳</div>
            <h2 className="text-2xl text-royal-gold font-normal mb-3">
              Your Challenge is Complete!
            </h2>
            <GoldDivider />
            <p className="text-base text-royal-muted leading-relaxed mb-4">
              Waiting for <span className="text-royal-gold font-semibold">{partnerName}</span> to finish their quiz{dots}
            </p>
            <div className="bg-royal-gold/[0.06] border border-royal-gold/15 rounded-2xl p-5 mt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-sm text-royal-cream">{getPlayerDisplayName(player)}</span>
                </div>
                <span className="text-xs text-green-400">Completed ✓</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-royal-gold/30 animate-pulse" />
                  <span className="text-sm text-royal-cream">{partnerName}</span>
                </div>
                <span className="text-xs text-royal-muted animate-pulse-soft">In progress...</span>
              </div>
            </div>
            <p className="text-xs text-royal-muted/40 mt-6 italic">
              Send them a nudge! The gift unlocks when both of you finish 🎁
            </p>
          </div>
        ) : (
          <div className="animate-scale-in">
            <div className="text-6xl mb-6">🎊</div>
            <h2 className="text-2xl text-royal-gold font-normal mb-3">
              {partnerName} Just Finished!
            </h2>
            <GoldDivider />
            <p className="text-base text-royal-muted">
              Both challenges complete. Unlocking your gift...
            </p>
            <div className="mt-6">
              <div className="w-8 h-8 border-2 border-royal-gold/30 border-t-royal-gold rounded-full mx-auto animate-spin-slow" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
