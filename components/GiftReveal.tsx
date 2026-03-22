'use client';

import { useState, useEffect } from 'react';
import { OrnateCorner, GoldDivider, MandalaRing, Confetti } from './Ornaments';
import { supabase } from '@/lib/supabase';
import { useSound } from '@/lib/useSound';
import { soundEngine, MEME_SOUNDS } from '@/lib/soundEngine';
import { markParticipantComplete, resetParticipant } from '@/lib/experienceData';
import type { StageProps, QuizConfig } from '@/lib/types';

interface MatchResult {
  questionId: string;
  question: string;
  personAAnswer: string;
  personBAnswer: string;
  matched: boolean;
  category: string;
}

export default function GiftReveal({
  experience,
  participant,
  partner,
  stageConfig,
  onComplete,
  ...rest
}: StageProps<'gift_reveal'> & { onReplay?: () => void }) {
  const onReplay = (rest as any).onReplay;
  const [revealed, setRevealed] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [matchResults, setMatchResults] = useState<MatchResult[]>([]);
  const [browniePoints, setBrowniePoints] = useState(0);
  const [showMatches, setShowMatches] = useState(false);
  const [showReplayOption, setShowReplayOption] = useState(false);
  const [resetting, setResetting] = useState(false);
  const { play } = useSound();

  const personAName = experience.person_a_name;
  const personBName = experience.person_b_name;
  const giftData = stageConfig.gift_data ?? {};
  const giftType = stageConfig.gift_type ?? 'message';

  useEffect(() => {
    let retryTimer: NodeJS.Timeout;

    async function loadMatches(attempt = 0) {
      // Fetch both participants' quiz answers
      const { data: participants } = await supabase
        .from('participants')
        .select('role, quiz_answers')
        .eq('experience_id', experience.id);

      if (participants && participants.length === 2) {
        const pA = participants.find((p: any) => p.role === 'a');
        const pB = participants.find((p: any) => p.role === 'b');

        if (pA?.quiz_answers && pB?.quiz_answers) {
          // Get quiz config for question text
          const { data: stages } = await supabase
            .from('stages')
            .select('config')
            .eq('experience_id', experience.id)
            .eq('stage_type', 'quiz')
            .single();

          const quizConfig = stages?.config as QuizConfig | null;
          const questions = quizConfig?.questions ?? [];

          const results: MatchResult[] = [];
          for (const q of questions) {
            const aIdx = pA.quiz_answers[q.id];
            const bIdx = pB.quiz_answers[q.id];
            if (aIdx !== undefined && bIdx !== undefined) {
              results.push({
                questionId: q.id,
                question: q.question,
                personAAnswer: q.options[aIdx] ?? `Option ${aIdx}`,
                personBAnswer: q.options[bIdx] ?? `Option ${bIdx}`,
                matched: aIdx === bIdx,
                category: q.category,
              });
            }
          }

          if (results.length > 0) {
            setMatchResults(results);
            setBrowniePoints(results.filter((r) => r.matched).length);
            return;
          }
        }
      }

      if (attempt < 3) {
        retryTimer = setTimeout(() => loadMatches(attempt + 1), 2000);
      }
    }

    loadMatches();
    return () => clearTimeout(retryTimer);
  }, [experience.id]);

  const handleReveal = () => {
    play('grandReveal');
    soundEngine.playFile(MEME_SOUNDS.airhorn);
    setShowConfetti(true);
    play('confetti');

    markParticipantComplete(participant.id);

    setTimeout(() => {
      setRevealed(true);
      setTimeout(() => {
        setShowMatches(true);
        if (matchResults.length > 0 && browniePoints < matchResults.length / 2) {
          soundEngine.playFile(MEME_SOUNDS.emotionalDamage);
        }
      }, 2000);
    }, 500);
  };

  const handleResetSession = async () => {
    setResetting(true);
    await resetParticipant(participant.id);
    setResetting(false);
    onReplay?.();
  };

  const renderGift = () => {
    if (giftType === 'voucher') {
      return (
        <>
          <div className="bg-gradient-to-br from-[#1a237e] to-[#283593] rounded-2xl p-6 mb-5">
            <div className="text-3xl font-bold text-[#FF5722] font-sans mb-1">
              {giftData.voucher_brand ?? 'Gift Voucher'}
            </div>
            <div className="text-sm text-white/70 mb-4">
              {giftData.voucher_subtitle ?? 'Gift Voucher'}
            </div>
            <div className="text-4xl font-bold text-white font-sans">
              {giftData.voucher_amount ?? ''}
            </div>
            <div className="text-xs text-white/50 mt-2">
              Valid for Flights • Hotels • Holidays
            </div>
          </div>
          {giftData.voucher_code && (
            <>
              <GoldDivider />
              <div className="bg-black/30 border border-royal-gold/20 rounded-xl p-4 mb-8">
                <div className="text-xs text-royal-gold/60 mb-1">Gift Card Number</div>
                <div className="text-lg text-white font-bold tracking-widest" style={{ fontFamily: 'monospace' }}>
                  {giftData.voucher_code}
                </div>
              </div>
            </>
          )}
        </>
      );
    }

    if (giftType === 'message') {
      return (
        <div className="bg-gradient-to-br from-royal-red/20 to-royal-gold/10 border border-royal-gold/30 rounded-2xl p-8 mb-6">
          <p className="text-lg text-royal-cream leading-relaxed italic">
            &ldquo;{giftData.message_text ?? 'With love and best wishes for your journey together!'}&rdquo;
          </p>
          {giftData.message_from && (
            <p className="text-sm text-royal-gold mt-4">
              — {giftData.message_from}
            </p>
          )}
        </div>
      );
    }

    if (giftType === 'image' && giftData.image_url) {
      return (
        <div className="rounded-2xl overflow-hidden mb-6">
          <img src={giftData.image_url} alt="Gift" className="w-full" />
        </div>
      );
    }

    if (giftType === 'link' && giftData.link_url) {
      return (
        <div className="mb-6">
          <a
            href={giftData.link_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-8 py-4 bg-gradient-to-br from-royal-red to-royal-red-light border-2 border-royal-gold rounded-2xl text-royal-gold-light text-lg font-display font-semibold tracking-wider uppercase"
          >
            {giftData.link_label ?? 'Open Your Gift'}
          </a>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="py-16 pb-24 text-center relative">
      {showConfetti && <Confetti />}
      <MandalaRing size={300} opacity={0.04} />

      <div className="relative z-10">
        <div className="text-xs tracking-[5px] text-royal-gold/50 uppercase mb-2">
          The Grand Finale
        </div>
        <div className="text-5xl mb-4">🎁</div>
        <h2 className="text-3xl font-normal bg-gradient-to-b from-royal-gold-light to-royal-gold bg-clip-text text-transparent mb-4">
          {giftData.reveal_text ?? 'A Gift For The Couple'}
        </h2>

        {!revealed ? (
          <div className="animate-slide-up">
            <p className="text-base text-royal-muted leading-relaxed mb-8 italic max-w-xs mx-auto">
              Both of you made it through the challenge.<br />
              From your friends who&apos;ve been through it all —<br />
              the late nights, the road trips, and every stupid plan that somehow worked.
            </p>
            <button
              onClick={handleReveal}
              className="px-12 py-4 bg-gradient-to-br from-royal-red via-royal-red-light to-royal-red border-2 border-royal-gold rounded-2xl text-royal-gold-light text-lg font-display font-semibold tracking-[3px] uppercase cursor-pointer animate-glow hover:brightness-110 transition-all"
            >
              Reveal Your Gift
            </button>
          </div>
        ) : (
          <div className="animate-scale-in">
            {/* Gift Card */}
            <div className="bg-gradient-to-br from-royal-red/30 to-royal-gold/10 border-2 border-royal-gold rounded-3xl p-8 relative overflow-hidden mb-6">
              <div className="absolute top-0 left-0"><OrnateCorner /></div>
              <div className="absolute top-0 right-0"><OrnateCorner flip /></div>

              <div className="text-sm tracking-[4px] text-royal-gold mb-4 uppercase">
                Your Gift
              </div>

              {renderGift()}

              {giftType !== 'message' && (
                <p className="text-base text-royal-cream leading-relaxed italic mb-2">
                  &ldquo;Go make memories together.<br />
                  You&apos;ve earned this one.&rdquo;
                </p>
              )}
            </div>

            {/* Matching Answers Comparison */}
            {showMatches && matchResults.length > 0 && (
              <div className="animate-slide-up">
                <div className="text-xs tracking-[5px] text-royal-gold/50 uppercase mb-2">
                  Brownie Points
                </div>
                <h3 className="text-2xl text-royal-gold font-normal mb-2">
                  How Well Do You Match?
                </h3>
                <div className="text-4xl mb-4">
                  {browniePoints}/{matchResults.length} 🏆
                </div>
                <p className="text-sm text-royal-muted mb-6">
                  {browniePoints === matchResults.length
                    ? "Perfect match! You two are made for each other! 💕"
                    : browniePoints >= matchResults.length / 2
                    ? "Pretty good! You're more alike than you think 😄"
                    : "Opposites attract, right? 😂"}
                </p>

                <div className="space-y-3">
                  {matchResults.map((result, i) => (
                    <div
                      key={result.questionId}
                      className="bg-royal-gold/[0.06] border border-royal-gold/15 rounded-xl p-4 text-left animate-slide-up"
                      style={{ animationDelay: `${i * 200}ms` }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-royal-muted/50">{result.category}</span>
                        <span className="text-lg">
                          {result.matched ? '✅' : '❌'}
                        </span>
                      </div>
                      <p className="text-sm text-royal-cream font-medium mb-3">
                        {result.question}
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <div className={`p-2 rounded-lg text-center ${
                          result.matched ? 'bg-green-800/20 border border-green-500/30' : 'bg-royal-red/20 border border-royal-red/30'
                        }`}>
                          <div className="text-[10px] text-royal-muted/60 mb-1">{personAName}</div>
                          <div className="text-xs text-royal-cream">{result.personAAnswer}</div>
                        </div>
                        <div className={`p-2 rounded-lg text-center ${
                          result.matched ? 'bg-green-800/20 border border-green-500/30' : 'bg-royal-red/20 border border-royal-red/30'
                        }`}>
                          <div className="text-[10px] text-royal-muted/60 mb-1">{personBName}</div>
                          <div className="text-xs text-royal-cream">{result.personBAnswer}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Replay option */}
            {showMatches && onReplay && (
              <div className="mt-10 pt-6 border-t border-royal-gold/10">
                {!showReplayOption ? (
                  <button
                    onClick={() => setShowReplayOption(true)}
                    className="text-xs text-royal-muted/40 hover:text-royal-muted/60 transition-colors underline underline-offset-2"
                  >
                    Want to experience this again?
                  </button>
                ) : (
                  <div className="animate-fade-in">
                    <p className="text-xs text-royal-muted/50 mb-3">
                      This will reset your session so you can replay from the start.
                    </p>
                    <button
                      onClick={handleResetSession}
                      disabled={resetting}
                      className="px-6 py-2.5 bg-royal-gold/10 border border-royal-gold/30 rounded-xl text-royal-gold text-sm font-display font-semibold tracking-wider uppercase cursor-pointer hover:bg-royal-gold/20 transition-all disabled:opacity-50"
                    >
                      {resetting ? 'Resetting...' : 'Reset My Session'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
