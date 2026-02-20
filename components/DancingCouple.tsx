'use client';

import { useState, useEffect } from 'react';
import { GoldDivider } from './Ornaments';
import { type PlayerID } from '@/lib/supabase';

interface DancingCoupleProps {
  player: PlayerID;
  onComplete: () => void;
}

// Animated dancing couple using CSS animations — will be replaced with actual AI video
export default function DancingCouple({ player, onComplete }: DancingCoupleProps) {
  const [phase, setPhase] = useState<'intro' | 'dance' | 'done'>('intro');

  const startDance = () => {
    setPhase('dance');
    setTimeout(() => setPhase('done'), 8000);
  };

  return (
    <div className="py-10 text-center relative">
      {phase === 'intro' && (
        <div className="animate-fade-in">
          <div className="text-xs tracking-[5px] text-royal-gold/50 uppercase mb-4">
            Special Performance
          </div>
          <div className="text-5xl mb-4">💃🕺</div>
          <h2 className="text-2xl text-royal-gold font-normal mb-3">
            The First Dance
          </h2>
          <p className="text-sm text-royal-muted italic mb-8 max-w-xs mx-auto">
            A special dance performance dedicated to the couple
          </p>

          <button
            onClick={startDance}
            className="px-10 py-3.5 bg-gradient-to-br from-purple-700 to-purple-900 border border-royal-gold/40 rounded-xl text-royal-gold-light text-base font-display font-semibold tracking-widest uppercase cursor-pointer hover:brightness-110 transition-all animate-glow"
          >
            ▶️ Play
          </button>
        </div>
      )}

      {phase === 'dance' && (
        <div className="animate-fade-in">
          {/* Dance stage */}
          <div className="relative bg-gradient-to-b from-purple-900/30 to-royal-red/20 border border-royal-gold/15 rounded-3xl p-8 min-h-[400px] overflow-hidden">
            {/* Disco lights */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-32 h-32 rounded-full opacity-20"
                  style={{
                    background: ['#D4A853', '#8B1C1C', '#E91E63', '#9C27B0', '#FF5722', '#4CAF50'][i],
                    left: `${(i * 20) % 80}%`,
                    top: `${(i * 25) % 70}%`,
                    animation: `discoFloat ${3 + i * 0.5}s ease-in-out infinite alternate`,
                    animationDelay: `${i * 0.3}s`,
                    filter: 'blur(40px)',
                  }}
                />
              ))}
            </div>

            {/* Video placeholder area */}
            <div className="relative z-10 flex flex-col items-center justify-center min-h-[350px]">
              {/* TODO: Replace with actual AI-generated dancing video */}
              {/* For now, animated dancing couple */}
              <div className="flex items-end gap-2 mb-8">
                <div
                  className="text-8xl"
                  style={{ animation: 'danceBounce 0.6s ease-in-out infinite alternate' }}
                >
                  🕺
                </div>
                <div
                  className="text-8xl"
                  style={{ animation: 'danceBounce 0.6s ease-in-out infinite alternate-reverse' }}
                >
                  💃
                </div>
              </div>

              <div className="text-center">
                <p className="text-xl text-royal-gold-light font-semibold mb-1">
                  Manoj & Pooja
                </p>
                <p className="text-sm text-royal-muted italic">
                  Dancing into forever... 💕
                </p>
              </div>

              {/* Music visualizer bars */}
              <div className="flex items-end gap-1 mt-8 h-12">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1.5 bg-gradient-to-t from-royal-gold to-royal-gold-light rounded-full"
                    style={{
                      animation: `musicBar ${0.4 + (i % 5) * 0.1}s ease-in-out infinite alternate`,
                      animationDelay: `${i * 0.05}s`,
                      height: 8,
                    }}
                  />
                ))}
              </div>

              <p className="text-[10px] text-royal-muted/30 mt-6">
                🎵 Imagine &ldquo;Tum Hi Ho&rdquo; playing in the background
              </p>
            </div>
          </div>
        </div>
      )}

      {phase === 'done' && (
        <div className="animate-scale-in">
          <div className="text-5xl mb-4">👏</div>
          <h2 className="text-2xl text-royal-gold font-normal mb-3">
            Beautiful, wasn&apos;t it?
          </h2>
          <p className="text-sm text-royal-muted italic mb-6">
            Now for the grand finale...
          </p>
          <GoldDivider />
          <button
            onClick={onComplete}
            className="px-10 py-3.5 bg-gradient-to-br from-royal-red to-royal-red-light border border-royal-gold/40 rounded-xl text-royal-gold-light text-base font-display font-semibold tracking-widest uppercase cursor-pointer hover:brightness-110 transition-all"
          >
            The Grand Finale →
          </button>
        </div>
      )}

      <style jsx>{`
        @keyframes danceBounce {
          0% { transform: translateY(0) rotate(-5deg); }
          100% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes discoFloat {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(20px, -20px) scale(1.3); }
        }
        @keyframes musicBar {
          0% { height: 8px; }
          100% { height: 48px; }
        }
      `}</style>
    </div>
  );
}
