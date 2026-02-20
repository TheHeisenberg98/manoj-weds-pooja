'use client';

import { useState } from 'react';
import { GoldDivider } from './Ornaments';
import { getQuestionsForPlayer } from '@/lib/questions';
import { supabase, type PlayerID, getPlayerDisplayName, getPartnerName } from '@/lib/supabase';

interface QuizProps {
  player: PlayerID;
  onComplete: () => void;
}

export default function CoupleQuiz({ player, onComplete }: QuizProps) {
  const questions = getQuestionsForPlayer(player);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResult, setShowResult] = useState(false);
  const [saving, setSaving] = useState(false);

  const question = questions[current];
  const totalAboutPartner = questions.filter((q) => q.type === 'about_partner').length;
  const playerName = getPlayerDisplayName(player);
  const partnerName = getPartnerName(player);

  const handleSelect = async (idx: number) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);

    const newAnswers = { ...answers, [question.id]: idx };
    setAnswers(newAnswers);

    const isCorrect = question.type === 'about_partner' && idx === question.correctAnswer;
    if (isCorrect) setScore((s) => s + 1);

    setTimeout(async () => {
      if (current < questions.length - 1) {
        setCurrent((c) => c + 1);
        setSelected(null);
        setAnswered(false);
      } else {
        // Quiz complete — save to Supabase
        setSaving(true);
        setShowResult(true);

        try {
          const { error } = await supabase.from('players').upsert({
            id: player,
            quiz_completed: true,
            quiz_answers: newAnswers,
            quiz_score: score + (isCorrect ? 1 : 0),
            completed_at: new Date().toISOString(),
          });
          if (error) console.error('Save error:', error);
        } catch (err) {
          console.error('Save failed:', err);
        }

        setSaving(false);
        setTimeout(() => onComplete(), 3000);
      }
    }, 1500);
  };

  if (showResult) {
    const finalScore = score;
    return (
      <div className="text-center py-16 px-5 animate-scale-in">
        <div className="text-6xl mb-4">
          {finalScore >= totalAboutPartner * 0.8 ? '🎉' : finalScore >= totalAboutPartner * 0.5 ? '😄' : '😅'}
        </div>
        <h2 className="text-3xl text-royal-gold font-normal mb-2">
          {finalScore}/{totalAboutPartner} Correct!
        </h2>
        <p className="text-royal-muted text-[15px] mb-2">
          {finalScore >= totalAboutPartner * 0.8
            ? `${playerName}, you really know ${partnerName}! 👑`
            : finalScore >= totalAboutPartner * 0.5
            ? `Not bad, ${playerName}! You know ${partnerName} pretty well 😄`
            : `${playerName}... do you even know ${partnerName}? 😂`}
        </p>
        <p className="text-xs text-royal-muted/50 mb-4">
          (Matching answers will be compared when both of you finish!)
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
          How Well Do You Know {partnerName}?
        </h2>
        <p className="text-sm text-royal-muted italic">
          Both of you must complete this to unlock a surprise
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
        {/* Category & type badge */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-royal-muted/50">{question.category}</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full ${
            question.type === 'matching'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
              : 'bg-royal-gold/10 text-royal-gold border border-royal-gold/20'
          }`}>
            {question.type === 'matching' ? '🔄 Matching' : '🎯 About ' + partnerName}
          </span>
        </div>

        <div className="bg-royal-gold/[0.06] border border-royal-gold/15 rounded-2xl p-5 mb-5">
          <div className="text-xs text-royal-gold/50 mb-2">
            Question {current + 1} of {questions.length}
          </div>
          <p className="text-xl font-medium text-royal-cream leading-relaxed">
            {question.question}
          </p>
          {question.type === 'matching' && (
            <p className="text-xs text-purple-300/60 mt-2 italic">
              No right or wrong — we&apos;ll compare your answer with {partnerName}&apos;s!
            </p>
          )}
        </div>

        {/* Options */}
        <div className="flex flex-col gap-2.5">
          {question.options.map((opt, i) => {
            const isSelected = selected === i;
            const isCorrect = question.type === 'about_partner' && i === question.correctAnswer;
            let bg = 'bg-royal-gold/[0.06]';
            let border = 'border-royal-gold/15';
            let badge = '';

            if (answered && question.type === 'about_partner') {
              if (isCorrect) {
                bg = 'bg-green-800/20';
                border = 'border-green-500';
                badge = '✓';
              } else if (isSelected && !isCorrect) {
                bg = 'bg-red-900/20';
                border = 'border-red-400';
                badge = '✗';
              }
            } else if (answered && question.type === 'matching' && isSelected) {
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
                  badge === '✓' ? 'border-green-500 text-green-400' :
                  badge === '✗' ? 'border-red-400 text-red-400' :
                  'border-royal-gold/30 text-royal-gold'
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
