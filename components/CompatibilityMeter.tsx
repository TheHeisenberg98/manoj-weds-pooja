'use client';

import { useState, useEffect } from 'react';
import { GoldDivider, MandalaRing } from './Ornaments';
import { supabase, type PlayerID } from '@/lib/supabase';
import { compareMatchingAnswers } from '@/lib/questions';
import { soundEngine, MEME_SOUNDS } from '@/lib/soundEngine';

interface CompatibilityMeterProps {
  player: PlayerID;
  onComplete: () => void;
}

const ANALYSIS_STEPS = [
  { text: 'Analyzing quiz responses...', emoji: '🧪', duration: 1200 },
  { text: 'Cross-referencing compatibility vectors...', emoji: '📡', duration: 1000 },
  { text: 'Running astrological alignment check...', emoji: '🪐', duration: 1100 },
  { text: 'Consulting ancient love algorithms...', emoji: '📜', duration: 900 },
  { text: 'Calibrating Bollywood romance index...', emoji: '🎬', duration: 1000 },
  { text: 'Final computation...', emoji: '💫', duration: 800 },
];

const CATEGORY_SCORES = [
  { label: 'Emotional Connection', icon: '💕' },
  { label: 'Adventure Compatibility', icon: '🗺️' },
  { label: 'Food Sync', icon: '🍕' },
  { label: 'Future Alignment', icon: '🔮' },
  { label: 'Humor Match', icon: '😂' },
  { label: 'Argument Recovery Speed', icon: '⚡' },
];

export default function CompatibilityMeter({ player, onComplete }: CompatibilityMeterProps) {
  const [phase, setPhase] = useState<'loading' | 'reveal' | 'breakdown'>('loading');
  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState(0);
  const [displayScore, setDisplayScore] = useState(0);
  const [matchCount, setMatchCount] = useState(0);
  const [totalMatching, setTotalMatching] = useState(0);
  const [categoryScores, setCategoryScores] = useState<number[]>([]);
  const [showCategories, setShowCategories] = useState(false);

  useEffect(() => {
    // Load real data and compute score
    async function computeScore() {
      const { data: players } = await supabase
        .from('players')
        .select('id, quiz_answers, quiz_score')
        .in('id', ['manoj', 'pooja']);

      let baseScore = 75; // Guaranteed minimum — it's a wedding gift after all!
      let matched = 0;
      let total = 0;

      if (players && players.length === 2) {
        const manoj = players.find((p: any) => p.id === 'manoj');
        const pooja = players.find((p: any) => p.id === 'pooja');

        if (manoj?.quiz_answers && pooja?.quiz_answers) {
          const results = compareMatchingAnswers(manoj.quiz_answers, pooja.quiz_answers);
          matched = results.filter((r) => r.matched).length;
          total = results.length;

          // Score formula: base 75 + up to 22 from matching (deterministic — both players see the same score)
          const matchBonus = total > 0 ? Math.round((matched / total) * 22) : 10;
          baseScore = 75 + matchBonus;
        }

        // Check swipe game overlap
        const manojSwipes = manoj?.quiz_answers?.swipe_game || {};
        const poojaSwipes = pooja?.quiz_answers?.swipe_game || {};
        const swipeKeys = Object.keys(manojSwipes);
        const swipeMatches = swipeKeys.filter((k) => manojSwipes[k] === poojaSwipes[k]).length;
        if (swipeKeys.length > 0) {
          baseScore = Math.min(99, baseScore + Math.round((swipeMatches / swipeKeys.length) * 3));
        }
      }

      setScore(Math.min(99, baseScore)); // Cap at 99 — 100 is too perfect
      setMatchCount(matched);
      setTotalMatching(total);

      // Deterministic category scores derived from match data so both players see the same breakdown
      const cats = CATEGORY_SCORES.map((_, i) => {
        // Spread scores around the base using a fixed offset per category
        const offsets = [3, -5, 7, -2, 4, -6];
        return Math.min(99, Math.max(70, baseScore + offsets[i]));
      });
      setCategoryScores(cats);
    }

    computeScore();

    // Start drumroll during analysis
    soundEngine.drumroll();

    // Run analysis steps
    let totalDelay = 0;

    ANALYSIS_STEPS.forEach((step, i) => {
      totalDelay += step.duration;
      setTimeout(() => setCurrentStep(i), totalDelay - step.duration);
    });

    // After all steps, reveal score
    const finalTimer = setTimeout(() => {
      soundEngine.drumrollStop();
      soundEngine.tada();
      soundEngine.playFile(MEME_SOUNDS.vineBoom);
      setPhase('reveal');
    }, totalDelay + 500);
    return () => {
      clearTimeout(finalTimer);
      soundEngine.drumrollStop();
    };
  }, []);

  // Animate score counter
  useEffect(() => {
    if (phase !== 'reveal') return;
    let current = 0;
    const target = score;
    const increment = Math.ceil(target / 60);
    const interval = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(interval);
        // Show categories after score settles
        setTimeout(() => setShowCategories(true), 1000);
      }
      setDisplayScore(current);
    }, 30);
    return () => clearInterval(interval);
  }, [phase, score]);

  return (
    <div className="py-10 text-center relative">
      <MandalaRing size={350} opacity={0.03} />

      {phase === 'loading' && (
        <div className="animate-fade-in relative z-10">
          <div className="text-xs tracking-[5px] text-royal-gold/50 uppercase mb-4">
            Advanced Analysis
          </div>
          <h2 className="text-2xl text-royal-gold font-normal mb-8">
            Computing Compatibility...
          </h2>

          {/* Fake terminal */}
          <div className="bg-black/40 border border-royal-gold/15 rounded-2xl p-5 text-left font-mono mb-6">
            {ANALYSIS_STEPS.slice(0, currentStep + 1).map((step, i) => (
              <div
                key={i}
                className="flex items-center gap-3 mb-3 animate-slide-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <span className="text-lg">{step.emoji}</span>
                <span className="text-xs text-green-400/80" style={{ fontFamily: 'monospace' }}>
                  {step.text}
                </span>
                {i < currentStep ? (
                  <span className="text-green-400 text-xs ml-auto">✓</span>
                ) : (
                  <span className="ml-auto">
                    <div className="w-3 h-3 border border-royal-gold/40 border-t-royal-gold rounded-full animate-spin-slow" />
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="h-1.5 bg-royal-gold/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-royal-gold to-royal-gold-light rounded-full transition-all duration-1000"
              style={{ width: `${((currentStep + 1) / ANALYSIS_STEPS.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {phase === 'reveal' && (
        <div className="relative z-10 animate-fade-in">
          <div className="text-xs tracking-[5px] text-royal-gold/50 uppercase mb-2">
            Results Are In
          </div>
          <h2 className="text-2xl text-royal-gold font-normal mb-8">
            Manoj & Pooja Compatibility
          </h2>

          {/* Giant score circle */}
          <div className="relative inline-block mb-8">
            <svg viewBox="0 0 200 200" className="w-52 h-52">
              {/* Background circle */}
              <circle cx="100" cy="100" r="85" fill="none" stroke="rgba(212,168,83,0.1)" strokeWidth="8" />
              {/* Animated progress circle */}
              <circle
                cx="100" cy="100" r="85"
                fill="none"
                stroke="url(#scoreGradient)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 85}`}
                strokeDashoffset={`${2 * Math.PI * 85 * (1 - displayScore / 100)}`}
                transform="rotate(-90 100 100)"
                className="transition-all duration-100"
              />
              <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#D4A853" />
                  <stop offset="50%" stopColor="#F5D998" />
                  <stop offset="100%" stopColor="#8B1C1C" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-5xl font-bold text-royal-cream" style={{ fontFamily: 'sans-serif' }}>
                {displayScore}%
              </div>
              <div className="text-xs text-royal-gold/60 mt-1">COMPATIBLE</div>
            </div>
          </div>

          {/* Verdict */}
          <div className="mb-6">
            {score >= 90 ? (
              <p className="text-lg text-royal-gold-light italic">
                &ldquo;Made for each other&rdquo; — even the stars agree ✨
              </p>
            ) : score >= 80 ? (
              <p className="text-lg text-royal-gold-light italic">
                &ldquo;A match written in the cosmos&rdquo; 🌙
              </p>
            ) : (
              <p className="text-lg text-royal-gold-light italic">
                &ldquo;Opposites attract — and these two prove it&rdquo; 💫
              </p>
            )}
          </div>

          {matchCount > 0 && (
            <p className="text-sm text-royal-muted mb-6">
              Matched on {matchCount}/{totalMatching} questions! 
              {matchCount > totalMatching / 2 ? ' 🎯 Great minds think alike!' : ' Different minds, one heart 💕'}
            </p>
          )}

          {/* Category breakdown */}
          {showCategories && (
            <div className="space-y-3 mb-8 animate-slide-up">
              {CATEGORY_SCORES.map((cat, i) => (
                <div key={i} className="flex items-center gap-3" style={{ animationDelay: `${i * 150}ms` }}>
                  <span className="text-lg w-8">{cat.icon}</span>
                  <span className="text-sm text-royal-muted flex-1 text-left">{cat.label}</span>
                  <div className="w-24 h-2 bg-royal-gold/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-royal-gold to-royal-gold-light rounded-full transition-all duration-1000"
                      style={{
                        width: `${categoryScores[i] || 0}%`,
                        transitionDelay: `${i * 200}ms`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-royal-gold w-10 text-right" style={{ fontFamily: 'sans-serif' }}>
                    {categoryScores[i]}%
                  </span>
                </div>
              ))}
            </div>
          )}

          {showCategories && (
            <>
              <GoldDivider />
              <button
                onClick={onComplete}
                className="px-10 py-3.5 bg-gradient-to-br from-royal-red to-royal-red-light border border-royal-gold/40 rounded-xl text-royal-gold-light text-base font-display font-semibold tracking-widest uppercase cursor-pointer hover:brightness-110 transition-all animate-slide-up"
              >
                Continue →
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
