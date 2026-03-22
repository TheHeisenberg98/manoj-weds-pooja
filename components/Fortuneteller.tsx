'use client';

import { useState } from 'react';
import { GoldDivider, MandalaRing } from './Ornaments';
import { useSound } from '@/lib/useSound';
import { soundEngine, MEME_SOUNDS } from '@/lib/soundEngine';
import type { StageProps } from '@/lib/types';

const DEFAULT_PREDICTIONS = [
  {
    category: 'Home Life 🏠',
    prediction: "The first 6 months will be an adjustment period... the AC temperature will be the biggest issue. One wants 18°C, the other says 24°C. Compromise at 21°C, but both secretly change it at night. 😤❄️",
    stars: 4,
    funny: false,
  },
  {
    category: 'Financial Yoga 💰',
    prediction: "A joint account will be opened, but both will maintain a secret 'emergency fund' for personal splurges. One's emergency = shoes. The other's = gadgets. The stars say — stop budgeting. 🛍️",
    stars: 3,
    funny: true,
  },
  {
    category: 'Travel Dasha ✈️',
    prediction: "An international trip is definitely happening. One will suggest Bali, the other Switzerland. Final destination? Somewhere local. Because last-minute plans always win. The stars confirm — adventures await. 🏖️",
    stars: 5,
    funny: false,
  },
  {
    category: 'Kitchen Graha 🍳',
    prediction: "Cooking duties will rotate, but food delivery apps will be the real winners. One day someone will make Maggi and act like a master chef. The other will politely eat it and secretly order pizza. 🍝",
    stars: 3,
    funny: true,
  },
  {
    category: 'Argument Retrograde 🌀',
    prediction: "A small monthly disagreement is inevitable. Reason: 'You never listen.' Duration: exactly 4.5 hours. Resolution: 'Let's eat something.' This pattern will repeat for 50 years. 💕",
    stars: 4,
    funny: false,
  },
];

interface PredictionItem {
  category: string;
  prediction: string;
  stars: number;
  funny: boolean;
}

export default function Fortuneteller({
  experience,
  participant,
  stageConfig,
  onComplete,
}: StageProps<'fortune_teller'>) {
  const personAName = experience.person_a_name;
  const personBName = experience.person_b_name;

  // Use fortunes from config, or fall back to defaults
  const predictions: PredictionItem[] = stageConfig.fortunes && stageConfig.fortunes.length > 0
    ? stageConfig.fortunes.map((text, i) => ({
        category: `Prediction ${i + 1} 🔮`,
        prediction: text,
        stars: Math.floor(Math.random() * 2) + 4,
        funny: i % 2 === 1,
      }))
    : DEFAULT_PREDICTIONS;

  const [phase, setPhase] = useState<'intro' | 'reading' | 'complete'>('intro');
  const [currentPrediction, setCurrentPrediction] = useState(0);
  const [revealedPredictions, setRevealedPredictions] = useState<number[]>([]);
  const [showPrediction, setShowPrediction] = useState(false);
  const { play } = useSound();

  const playPredictionSound = (pred: PredictionItem) => {
    play('mystical');
    if (pred.funny) {
      setTimeout(() => soundEngine.playFile(MEME_SOUNDS.bruh), 800);
    }
  };

  const startReading = () => {
    setPhase('reading');
    setTimeout(() => {
      setShowPrediction(true);
      playPredictionSound(predictions[0]);
    }, 1000);
  };

  const nextPrediction = () => {
    setShowPrediction(false);
    play('bell');
    if (currentPrediction < predictions.length - 1) {
      setTimeout(() => {
        const nextIdx = currentPrediction + 1;
        setCurrentPrediction((c) => c + 1);
        setRevealedPredictions((r) => [...r, currentPrediction]);
        setShowPrediction(true);
        playPredictionSound(predictions[nextIdx]);
      }, 600);
    } else {
      setPhase('complete');
    }
  };

  const prediction = predictions[currentPrediction];

  return (
    <div className="py-10 relative">
      <MandalaRing size={400} opacity={0.03} />

      {phase === 'intro' && (
        <div className="text-center animate-fade-in relative z-10">
          <div className="relative inline-block mb-6">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-orange-600/30 to-yellow-600/20 border-2 border-royal-gold/40 flex items-center justify-center text-6xl mx-auto">
              🧘
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-royal-gold/20 border border-royal-gold/30 rounded-full px-3 py-1">
              <span className="text-[10px] text-royal-gold">AI Pandit Ji</span>
            </div>
          </div>

          <h2 className="text-3xl font-normal bg-gradient-to-b from-royal-gold-light to-royal-gold bg-clip-text text-transparent mb-3">
            Kundli Reading
          </h2>
          <p className="text-sm text-royal-muted italic mb-2">
            &ldquo;Mujhe sab dikhai deta hai...&rdquo;
          </p>
          <p className="text-xs text-royal-muted/60 mb-8 leading-relaxed max-w-xs mx-auto">
            Our highly advanced AI Pandit has analyzed the cosmic alignment
            of {personAName} & {personBName}&apos;s stars, planets, and WhatsApp chat patterns
            to predict their future together.
          </p>

          <button
            onClick={startReading}
            className="px-10 py-3.5 bg-gradient-to-br from-orange-700 to-orange-900 border border-royal-gold/40 rounded-xl text-royal-gold-light text-base font-display font-semibold tracking-widest uppercase cursor-pointer hover:brightness-110 transition-all animate-glow"
          >
            🔮 Start Reading
          </button>
        </div>
      )}

      {phase === 'reading' && (
        <div className="relative z-10">
          <div className="flex gap-1.5 mb-6 justify-center">
            {predictions.map((_, i) => (
              <div
                key={i}
                className="h-1 rounded-full transition-all duration-300"
                style={{
                  width: 20,
                  background: i <= currentPrediction ? '#D4A853' : 'rgba(212, 168, 83, 0.15)',
                }}
              />
            ))}
          </div>

          <div className="text-center mb-4">
            <span className="text-xs text-royal-gold/50">
              Prediction {currentPrediction + 1} of {predictions.length}
            </span>
          </div>

          {showPrediction ? (
            <div key={currentPrediction} className="animate-slide-up">
              <div className="bg-gradient-to-br from-orange-900/20 to-royal-gold/[0.06] border border-royal-gold/20 rounded-2xl p-6 mb-6">
                <div className="text-center mb-4">
                  <div className="inline-block px-4 py-1.5 bg-royal-gold/10 border border-royal-gold/20 rounded-full">
                    <span className="text-sm text-royal-gold font-semibold">
                      {prediction.category}
                    </span>
                  </div>
                </div>

                <div className="flex justify-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className="text-lg"
                      style={{ opacity: i < prediction.stars ? 1 : 0.2 }}
                    >
                      ⭐
                    </span>
                  ))}
                </div>

                <p className="text-base text-royal-cream leading-relaxed">
                  {prediction.prediction}
                </p>
              </div>

              <div className="text-center">
                <button
                  onClick={nextPrediction}
                  className="px-8 py-3 bg-royal-gold/10 border border-royal-gold/30 rounded-xl text-royal-gold text-sm font-display font-semibold tracking-wider uppercase cursor-pointer hover:bg-royal-gold/20 transition-all"
                >
                  {currentPrediction < predictions.length - 1 ? 'Next Prediction →' : 'Complete Reading ✨'}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-4 animate-pulse">🔮</div>
              <p className="text-sm text-royal-gold animate-pulse-soft">
                Pandit ji is consulting the stars...
              </p>
            </div>
          )}
        </div>
      )}

      {phase === 'complete' && (
        <div className="text-center animate-scale-in relative z-10">
          <div className="text-6xl mb-4">🙏</div>
          <h2 className="text-2xl text-royal-gold font-normal mb-3">
            Reading Complete
          </h2>
          <p className="text-base text-royal-muted italic mb-2">
            &ldquo;Pandit ji ka aashirvaad hai — sab mangal hoga!&rdquo;
          </p>
          <p className="text-xs text-royal-muted/50 mb-6">
            Disclaimer: Yeh predictions 100% accurate hain.*
            <br />
            <span className="text-[10px]">*Source: trust me bro</span>
          </p>

          <GoldDivider />

          <button
            onClick={onComplete}
            className="px-10 py-3.5 bg-gradient-to-br from-royal-red to-royal-red-light border border-royal-gold/40 rounded-xl text-royal-gold-light text-base font-display font-semibold tracking-widest uppercase cursor-pointer hover:brightness-110 transition-all"
          >
            Continue →
          </button>
        </div>
      )}
    </div>
  );
}
