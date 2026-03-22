'use client';

import { useState } from 'react';
import { GoldDivider } from './Ornaments';
import { useSound } from '@/lib/useSound';
import { updateParticipantSwipeAnswers } from '@/lib/experienceData';
import type { StageProps } from '@/lib/types';

export default function SwipeGame({
  experience,
  participant,
  partner,
  stageConfig,
  onComplete,
}: StageProps<'swipe_game'>) {
  const scenarios = stageConfig.scenarios ?? [];
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [swipeDir, setSwipeDir] = useState<'left' | 'right' | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [saving, setSaving] = useState(false);
  const { play } = useSound();

  const personAName = experience.person_a_name;
  const personBName = experience.person_b_name;
  const playerName = participant.display_name ?? (participant.role === 'a' ? personAName : personBName);
  const partnerName = participant.role === 'a' ? personBName : personAName;
  const leftLabel = stageConfig.left_label ?? personAName;
  const rightLabel = stageConfig.right_label ?? personBName;

  const scenario = scenarios[current];

  const handleSwipe = async (choice: 'a' | 'b') => {
    const dir = choice === 'a' ? 'left' : 'right';
    setSwipeDir(dir);
    play('whoosh');

    const scenarioId = `wml-${current}`;
    const newAnswers = { ...answers, [scenarioId]: choice };
    setAnswers(newAnswers);

    setTimeout(() => {
      setSwipeDir(null);
      play('pop');
      if (current < scenarios.length - 1) {
        setCurrent((c) => c + 1);
      } else {
        setSaving(true);
        setShowResult(true);
        saveAnswers(newAnswers);
      }
    }, 500);
  };

  const saveAnswers = async (finalAnswers: Record<string, string>) => {
    try {
      await updateParticipantSwipeAnswers(participant.id, finalAnswers);
    } catch (err) {
      console.error('Save error:', err);
    }
    setSaving(false);
  };

  if (scenarios.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-royal-muted">No scenarios configured for this game.</p>
        <button onClick={onComplete} className="mt-4 text-royal-gold underline">Skip →</button>
      </div>
    );
  }

  if (showResult) {
    const aCount = Object.values(answers).filter((v) => v === 'a').length;
    const bCount = Object.values(answers).filter((v) => v === 'b').length;

    return (
      <div className="py-16 text-center animate-scale-in">
        <div className="text-5xl mb-4">📊</div>
        <h2 className="text-2xl text-royal-gold font-normal mb-4">
          {playerName}&apos;s Verdict
        </h2>

        <div className="flex justify-center gap-6 mb-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-royal-cream" style={{ fontFamily: 'sans-serif' }}>
              {aCount}
            </div>
            <div className="text-sm text-royal-muted">{personAName}</div>
          </div>
          <div className="text-3xl text-royal-gold/30">vs</div>
          <div className="text-center">
            <div className="text-4xl font-bold text-royal-cream" style={{ fontFamily: 'sans-serif' }}>
              {bCount}
            </div>
            <div className="text-sm text-royal-muted">{personBName}</div>
          </div>
        </div>

        <p className="text-sm text-royal-muted italic mb-6">
          {aCount > bCount
            ? `Looks like ${personAName} is the troublemaker here 😂`
            : bCount > aCount
            ? `${personBName}'s getting all the blame! 😄`
            : "Perfectly balanced — as all couples should be ⚖️"}
        </p>

        <GoldDivider />

        <p className="text-xs text-royal-muted/50 mb-6">
          We&apos;ll compare with {partnerName}&apos;s answers at the end!
        </p>

        <button
          onClick={onComplete}
          className="px-10 py-3.5 bg-gradient-to-br from-royal-red to-royal-red-light border border-royal-gold/40 rounded-xl text-royal-gold-light text-base font-display font-semibold tracking-widest uppercase cursor-pointer hover:brightness-110 transition-all"
        >
          Continue →
        </button>
      </div>
    );
  }

  return (
    <div className="py-10">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="text-xs tracking-[5px] text-royal-gold/50 uppercase mb-2">
          Swipe Game
        </div>
        <h2 className="text-3xl font-normal bg-gradient-to-b from-royal-gold-light to-royal-gold bg-clip-text text-transparent mb-1">
          Who&apos;s More Likely To...
        </h2>
        <p className="text-sm text-royal-muted italic">
          Swipe left for {leftLabel}, right for {rightLabel}
        </p>
        <div className="inline-block mt-2 px-3 py-1 bg-royal-gold/10 border border-royal-gold/20 rounded-full">
          <span className="text-xs text-royal-gold">Playing as: {playerName}</span>
        </div>
      </div>

      {/* Progress */}
      <div className="flex gap-1 mb-6 justify-center">
        {scenarios.map((_, i) => (
          <div
            key={i}
            className="h-1 rounded-full transition-all duration-300"
            style={{
              width: `${100 / scenarios.length}%`,
              maxWidth: 20,
              background: i <= current ? '#D4A853' : 'rgba(212, 168, 83, 0.15)',
            }}
          />
        ))}
      </div>

      {/* Card */}
      <div className="relative" style={{ perspective: '1000px' }}>
        <div
          key={current}
          className="animate-slide-up"
          style={{
            transform: swipeDir === 'left'
              ? 'translateX(-120%) rotate(-15deg)'
              : swipeDir === 'right'
              ? 'translateX(120%) rotate(15deg)'
              : 'translateX(0) rotate(0)',
            opacity: swipeDir ? 0 : 1,
            transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          }}
        >
          <div className="bg-gradient-to-br from-royal-gold/[0.08] to-royal-red/10 border border-royal-gold/20 rounded-3xl p-8 text-center min-h-[280px] flex flex-col items-center justify-center">
            <div className="text-xs text-royal-gold/40 mb-4">
              {current + 1} of {scenarios.length}
            </div>
            <div className="text-5xl mb-5">{scenario.emoji}</div>
            <p className="text-xl text-royal-cream font-medium leading-relaxed">
              Who&apos;s more likely to...
            </p>
            <p className="text-2xl text-royal-gold-light font-semibold mt-2 leading-snug">
              {scenario.text}
            </p>
          </div>
        </div>
      </div>

      {/* Swipe buttons */}
      <div className="flex justify-center gap-6 mt-8">
        <button
          onClick={() => handleSwipe('a')}
          className="flex flex-col items-center gap-2 group"
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600/20 to-blue-800/20 border-2 border-blue-400/40 flex items-center justify-center text-3xl transition-all group-hover:scale-110 group-hover:border-blue-400 group-active:scale-95">
            👨
          </div>
          <span className="text-sm text-royal-muted group-hover:text-blue-300 transition-colors">{leftLabel}</span>
        </button>

        <button
          onClick={() => handleSwipe('b')}
          className="flex flex-col items-center gap-2 group"
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-600/20 to-rose-800/20 border-2 border-pink-400/40 flex items-center justify-center text-3xl transition-all group-hover:scale-110 group-hover:border-pink-400 group-active:scale-95">
            👩
          </div>
          <span className="text-sm text-royal-muted group-hover:text-pink-300 transition-colors">{rightLabel}</span>
        </button>
      </div>
    </div>
  );
}
