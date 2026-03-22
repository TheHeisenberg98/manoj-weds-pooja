'use client';

import { useState } from 'react';
import { GoldDivider } from './Ornaments';
import { supabase } from '@/lib/supabase';
import { useSound } from '@/lib/useSound';
import type { StageProps } from '@/lib/types';

export default function CoupleQuiz({
  experience,
  participant,
  partner,
  stageConfig,
  onComplete,
}: StageProps<'quiz'>) {
  const questions = stageConfig.questions ?? [];
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResult, setShowResult] = useState(false);
  const [saving, setSaving] = useState(false);
  const { play } = useSound();

  const playerName = participant.display_name ?? (participant.role === 'a' ? experience.person_a_name : experience.person_b_name);
  const partnerName = participant.role === 'a' ? experience.person_b_name : experience.person_a_name;

  if (questions.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-royal-muted">No quiz questions configured.</p>
        <button onClick={onComplete} className="mt-4 text-royal-gold underline">Skip →</button>
      </div>
    );
  }

  const question = questions[current];

  const handleSelect = async (idx: number) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    play('click');

    const newAnswers = { ...answers, [question.id]: idx };
    setAnswers(newAnswers);

    setTimeout(async () => {
      if (current < questions.length - 1) {
        setCurrent((c) => c + 1);
        setSelected(null);
        setAnswered(false);
      } else {
        setSaving(true);
        setShowResult(true);
        play('completionChime');

        try {
          await supabase
            .from('participants')
            .update({
              quiz_answers: newAnswers,
              quiz_completed: true,
            })
            .eq('id', participant.id);
        } catch (err) {
          console.error('Save failed:', err);
        }

        setSaving(false);
        setTimeout(() => onComplete(), 3000);
      }
    }, 1200);
  };

  if (showResult) {
    return (
      <div className="text-center py-16 px-5 animate-scale-in">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-3xl text-royal-gold font-normal mb-2">
          Challenge Complete!
        </h2>
        <p className="text-royal-muted text-[15px] mb-2">
          All answers recorded, {playerName}!
        </p>
        <p className="text-xs text-royal-muted/50 mb-4">
          We&apos;ll compare your answers with {partnerName}&apos;s at the grand reveal!
        </p>
        <GoldDivider />
        {saving ? (
          <div className="flex items-center justify-center gap-3">
            <div className="w-5 h-5 border-2 border-royal-gold/30 border-t-royal-gold rounded-full animate-spin-slow" />
            <p className="text-sm text-royal-gold">Saving your answers...</p>
          </div>
        ) : (
          <p className="text-sm text-royal-gold animate-pulse-soft">
            Checking if {partnerName} has completed the challenge...
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="py-10">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="text-xs tracking-[5px] text-royal-gold/50 uppercase mb-2">
          Couple&apos;s Challenge
        </div>
        <h2 className="text-3xl font-normal bg-gradient-to-b from-royal-gold-light to-royal-gold bg-clip-text text-transparent mb-1">
          How Well Do You Match?
        </h2>
        <p className="text-sm text-royal-muted italic">
          Both of you answer the same questions — let&apos;s see if you think alike!
        </p>
        <div className="inline-block mt-3 px-3 py-1 bg-royal-gold/10 border border-royal-gold/20 rounded-full">
          <span className="text-xs text-royal-gold">Playing as: {playerName}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex gap-1.5 mb-8 justify-center">
        {questions.map((_, i) => (
          <div
            key={i}
            className="h-1 rounded-full transition-all duration-300"
            style={{
              width: `${100 / questions.length}%`,
              maxWidth: 36,
              background: i <= current ? '#D4A853' : 'rgba(212, 168, 83, 0.15)',
            }}
          />
        ))}
      </div>

      {/* Question card */}
      <div key={current} className="animate-slide-up">
        {/* Category badge */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-royal-muted/50">{question.category}</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
            🔄 Matching
          </span>
        </div>

        <div className="bg-royal-gold/[0.06] border border-royal-gold/15 rounded-2xl p-5 mb-5">
          <div className="text-xs text-royal-gold/50 mb-2">
            Question {current + 1} of {questions.length}
          </div>
          <p className="text-xl font-medium text-royal-cream leading-relaxed">
            {question.question}
          </p>
          <p className="text-xs text-purple-300/60 mt-2 italic">
            No right or wrong — we&apos;ll compare your answer with {partnerName}&apos;s!
          </p>
        </div>

        {/* Options */}
        <div className="flex flex-col gap-2.5">
          {question.options.map((opt, i) => {
            const isSelected = selected === i;
            let bg = 'bg-royal-gold/[0.06]';
            let border = 'border-royal-gold/15';
            let badge = '';

            if (answered && isSelected) {
              bg = 'bg-purple-500/15';
              border = 'border-purple-400';
              badge = '✓';
            }

            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                className={`p-3.5 ${bg} border ${border} rounded-xl text-royal-cream text-base font-display text-left transition-all flex items-center gap-3 ${
                  answered ? 'cursor-default' : 'cursor-pointer hover:bg-royal-gold/10'
                }`}
              >
                <span className={`w-7 h-7 rounded-full border flex items-center justify-center text-sm flex-shrink-0 ${
                  badge === '✓' ? 'border-purple-400 text-purple-300' : 'border-royal-gold/30 text-royal-gold'
                }`}>
                  {badge || String.fromCharCode(65 + i)}
                </span>
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
