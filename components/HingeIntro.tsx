'use client';

import { useState, useEffect } from 'react';
import { type PlayerID, getPlayerDisplayName } from '@/lib/supabase';

interface HingeIntroProps {
  player: PlayerID;
  onComplete: () => void;
}

export default function HingeIntro({ player, onComplete }: HingeIntroProps) {
  const [phase, setPhase] = useState<'story' | 'swipe' | 'match' | 'done'>('story');
  const [showProfile, setShowProfile] = useState(false);

  const playerName = getPlayerDisplayName(player);
  const partnerName = player === 'manoj' ? 'Pooja' : 'Manoj';

  useEffect(() => {
    // Auto-progress the intro
    const t1 = setTimeout(() => setShowProfile(true), 1500);
    return () => clearTimeout(t1);
  }, []);

  const handleSwipe = () => {
    setPhase('match');
    setTimeout(() => setPhase('done'), 3500);
    setTimeout(() => onComplete(), 5000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Hinge-style gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a2e] via-[#16213e] to-[#0f3460]" />

      <div className="relative z-10 w-full max-w-[360px]">
        {phase === 'story' && (
          <div className="text-center animate-fade-in">
            {/* Hinge logo parody */}
            <div className="mb-8">
              <div className="text-4xl mb-3">💝</div>
              <div className="text-2xl font-bold text-white tracking-wide" style={{ fontFamily: 'sans-serif' }}>
                hinge
              </div>
              <div className="text-xs text-white/40 mt-1 tracking-widest uppercase">
                Designed to be deleted
              </div>
            </div>

            <p className="text-white/60 text-sm mb-8 leading-relaxed">
              Once upon a time, two profiles crossed paths...
            </p>

            {/* Fake Hinge profile card */}
            {showProfile && (
              <div className="animate-slide-up">
                <div className="bg-white rounded-3xl overflow-hidden shadow-2xl text-left">
                  {/* Profile photo */}
                  <div className="w-full aspect-[3/4] relative">
                    <img
                      src={player === 'manoj' ? '/pooja.jpg' : '/manoj.jpg'}
                      alt={partnerName}
                      className="w-full h-full object-cover"
                    />
                    {/* Hinge-style prompt overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-5">
                      <div className="text-white">
                        <div className="text-2xl font-bold" style={{ fontFamily: 'sans-serif' }}>
                          {partnerName}, <span className="font-normal">26</span>
                        </div>
                        <div className="text-white/70 text-sm mt-1">📍 Bengaluru</div>
                      </div>
                    </div>
                  </div>

                  {/* Hinge prompt */}
                  <div className="p-5">
                    <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">
                      A life goal of mine
                    </div>
                    <div className="text-gray-800 text-base" style={{ fontFamily: 'sans-serif' }}>
                      {player === 'manoj'
                        ? 'Finding someone who laughs at my jokes even when they\'re not funny 😅'
                        : 'Someone who\'ll drive me around Bengaluru without complaining about traffic 🚗'}
                    </div>
                  </div>

                  {/* Like button */}
                  <div className="px-5 pb-5">
                    <button
                      onClick={handleSwipe}
                      className="w-full py-3.5 bg-gradient-to-r from-[#E91E63] to-[#FF5722] rounded-full text-white font-bold text-base tracking-wide transition-all hover:scale-[1.02] active:scale-95"
                      style={{ fontFamily: 'sans-serif' }}
                    >
                      ❤️ Like
                    </button>
                  </div>
                </div>

                <p className="text-white/30 text-xs mt-4 italic">
                  Tap like — just like {playerName} did back then...
                </p>
              </div>
            )}
          </div>
        )}

        {phase === 'match' && (
          <div className="text-center animate-scale-in">
            {/* Match explosion */}
            <div className="relative">
              {/* Glowing circles */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 rounded-full bg-[#E91E63]/20 animate-ping" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 rounded-full bg-[#E91E63]/30 animate-pulse" />
              </div>

              <div className="relative z-10 py-12">
                {/* Two profile circles coming together */}
                <div className="flex items-center justify-center mb-6">
                  <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden shadow-xl -mr-3 z-10">
                    <img src="/manoj.jpg" alt="Manoj" className="w-full h-full object-cover" />
                  </div>
                  <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden shadow-xl -ml-3">
                    <img src="/pooja.jpg" alt="Pooja" className="w-full h-full object-cover" />
                  </div>
                </div>

                <div className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'sans-serif' }}>
                  It&apos;s a Match! 💕
                </div>
                <p className="text-white/60 text-sm">
                  Manoj & Pooja matched on Hinge
                </p>
                <p className="text-white/40 text-xs mt-2">
                  ...and the rest is history
                </p>
              </div>
            </div>
          </div>
        )}

        {phase === 'done' && (
          <div className="text-center animate-fade-in">
            <p className="text-white/60 text-sm mb-2">From a swipe to forever...</p>
            <div className="text-5xl mb-4">💒</div>
            <h2 className="text-2xl font-display text-royal-gold font-light">
              Now let&apos;s celebrate their journey
            </h2>
            <div className="mt-4">
              <div className="w-6 h-6 border-2 border-royal-gold/30 border-t-royal-gold rounded-full mx-auto animate-spin-slow" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
