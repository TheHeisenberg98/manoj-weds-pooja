'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSound } from '@/lib/useSound';
import type { StageProps } from '@/lib/types';

/** Swipeable photo carousel with dot indicators */
function PhotoCarousel({
  photos,
  alt,
  onSwipe,
}: {
  photos: string[];
  alt: string;
  onSwipe?: () => void;
}) {
  const [current, setCurrent] = useState(0);
  const touchStart = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const goTo = useCallback(
    (idx: number) => {
      const next = Math.max(0, Math.min(photos.length - 1, idx));
      if (next !== current) {
        setCurrent(next);
        onSwipe?.();
      }
    },
    [current, photos.length, onSwipe]
  );

  const prev = useCallback(() => goTo(current - 1), [goTo, current]);
  const next = useCallback(() => goTo(current + 1), [goTo, current]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current === null) return;
    const diff = touchStart.current - e.changedTouches[0].clientX;
    touchStart.current = null;
    if (Math.abs(diff) < 40) return;
    if (diff > 0) next();
    else prev();
  };

  if (photos.length === 0) {
    return (
      <div className="w-full aspect-[3/4] bg-gradient-to-br from-royal-red/30 via-royal-gold/15 to-royal-red/20 flex items-center justify-center">
        <div className="text-4xl">💕</div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full aspect-[3/4] relative overflow-hidden select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="flex h-full transition-transform duration-300 ease-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {photos.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={`${alt} photo ${i + 1}`}
            className="w-full h-full object-cover flex-shrink-0"
            draggable={false}
          />
        ))}
      </div>

      {current > 0 && (
        <button
          onClick={prev}
          className="absolute left-0 top-0 w-1/3 h-full z-10 cursor-pointer"
          aria-label="Previous photo"
        />
      )}
      {current < photos.length - 1 && (
        <button
          onClick={next}
          className="absolute right-0 top-0 w-1/3 h-full z-10 cursor-pointer"
          aria-label="Next photo"
        />
      )}

      <div className="absolute top-3 left-0 right-0 flex justify-center gap-1.5 z-20">
        {photos.map((_, i) => (
          <div
            key={i}
            className="h-[3px] rounded-full transition-all duration-300"
            style={{
              width: photos.length <= 4 ? 48 : 32,
              background: i === current ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.35)',
            }}
          />
        ))}
      </div>

      {current > 0 && (
        <div className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 flex items-center justify-center text-white/70 opacity-0 hover:opacity-100 transition-opacity pointer-events-none z-20">
          ‹
        </div>
      )}
      {current < photos.length - 1 && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 flex items-center justify-center text-white/70 opacity-0 hover:opacity-100 transition-opacity pointer-events-none z-20">
          ›
        </div>
      )}
    </div>
  );
}

export default function HingeIntro({
  experience,
  participant,
  stageConfig,
  onComplete,
}: StageProps<'hinge_intro'>) {
  const [phase, setPhase] = useState<'story' | 'swipe' | 'match' | 'done'>('story');
  const [showProfile, setShowProfile] = useState(false);
  const { play } = useSound();

  const personAName = experience.person_a_name;
  const personBName = experience.person_b_name;
  const playerName = participant.display_name ?? (participant.role === 'a' ? personAName : personBName);
  const partnerName = participant.role === 'a' ? personBName : personAName;

  // Use cards from stageConfig if available, otherwise show a default card
  const cards = stageConfig.cards ?? [];
  // Extract profile photo URLs from cards (cards with subtext containing photo URLs) or use empty array
  const partnerPhotos: string[] = [];  // Photos will come from media table in future

  useEffect(() => {
    const t1 = setTimeout(() => setShowProfile(true), 1500);
    return () => clearTimeout(t1);
  }, []);

  const handleSwipe = () => {
    setPhase('match');
    play('matchReveal');
    setTimeout(() => setPhase('done'), 3500);
    setTimeout(() => onComplete(), 5000);
  };

  const handlePhotoSwipe = useCallback(() => {
    play('pageTurn');
  }, [play]);

  // Determine the bio/prompt text from cards config
  const bioCard = cards.length > 0 ? cards[0] : null;
  const promptLabel = bioCard?.subtext ?? 'A life goal of mine';
  const promptText = bioCard?.text ?? `Making every moment count with ${playerName}`;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Hinge-style gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a2e] via-[#16213e] to-[#0f3460]" />

      <div className="relative z-10 w-full max-w-[360px]">
        {phase === 'story' && (
          <div className="text-center animate-fade-in">
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

            {showProfile && (
              <div className="animate-slide-up">
                <div className="bg-white rounded-3xl overflow-hidden shadow-2xl text-left">
                  <div className="relative">
                    {partnerPhotos.length > 0 ? (
                      <PhotoCarousel
                        photos={partnerPhotos}
                        alt={partnerName}
                        onSwipe={handlePhotoSwipe}
                      />
                    ) : (
                      <div className="w-full aspect-[3/4] bg-gradient-to-br from-[#E91E63]/20 via-[#9C27B0]/20 to-[#3F51B5]/20 flex items-center justify-center">
                        <div className="text-8xl">💕</div>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-5 z-30 pointer-events-none">
                      <div className="text-white">
                        <div className="text-2xl font-bold" style={{ fontFamily: 'sans-serif' }}>
                          {partnerName}, <span className="font-normal">26</span>
                        </div>
                        <div className="text-white/70 text-sm mt-1">📍 Bengaluru</div>
                      </div>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">
                      {promptLabel}
                    </div>
                    <div className="text-gray-800 text-base" style={{ fontFamily: 'sans-serif' }}>
                      {promptText}
                    </div>
                  </div>

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
            <div className="relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 rounded-full bg-[#E91E63]/20 animate-ping" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 rounded-full bg-[#E91E63]/30 animate-pulse" />
              </div>

              <div className="relative z-10 py-12">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden shadow-xl -mr-3 z-10 bg-gradient-to-br from-blue-500/30 to-blue-700/30 flex items-center justify-center text-4xl">
                    💙
                  </div>
                  <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden shadow-xl -ml-3 bg-gradient-to-br from-pink-500/30 to-pink-700/30 flex items-center justify-center text-4xl">
                    💗
                  </div>
                </div>

                <div className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'sans-serif' }}>
                  It&apos;s a Match! 💕
                </div>
                <p className="text-white/60 text-sm">
                  {personAName} & {personBName} matched on Hinge
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
