'use client';

import { useState, useEffect } from 'react';
import { GoldDivider, MandalaRing } from './Ornaments';
import { type PlayerID } from '@/lib/supabase';

const PREDICTIONS = [
  {
    category: 'Griha Pravesh 🏠',
    prediction: "Pehle 6 mahine toh dono ek doosre ke saath adjust karenge... AC ka temperature biggest issue hoga. Manoj chahega 18°C, Pooja bolegi 24°C. Compromise hoga 21°C pe, but secretly dono raat ko apne taraf set karenge. 😤❄️",
    stars: 4,
  },
  {
    category: 'Financial Yoga 💰',
    prediction: "Joint account khulega, lekin secret Swiggy expenses chhupane ke liye dono ke paas ek 'emergency fund' bhi hoga. Pooja ka emergency = shoes. Manoj ka emergency = gadgets. Pandit ji kehte hain — sab theek hai, budget banana band karo. 🛍️",
    stars: 3,
  },
  {
    category: 'Travel Dasha ✈️',
    prediction: "2026 mein ek international trip pakka hai. Manoj bolega Bali, Pooja bolegi Switzerland. Final destination hoga... Goa. Kyunki last minute mein sab plans wahi jaate hain. Stars confirm karte hain — India se bahar jaana mushkil hai. 🏖️",
    stars: 5,
  },
  {
    category: 'Kitchen Graha 🍳',
    prediction: "Cooking duties ka rotation banega, par actually Zomato aur Swiggy dono ke saath long-term relationship chal raha hai. Ek din Manoj Maggi banayega aur act karega jaise Gordon Ramsay hai. Pooja politely khaayegi aur secretly bread order karegi. 🍝",
    stars: 3,
  },
  {
    category: 'Argument Retrograde 🌀',
    prediction: "Monthly ek chhota sa fight hoga. Reason: 'Tune meri baat suni hi nahi.' Duration: exactly 4.5 hours. Resolution: 'Chal kuch khaate hain.' Repeat cycle har mahine. Saturn kehta hai yeh pattern 50 saal chalega. 💕",
    stars: 4,
  },
  {
    category: 'Baby Nakshatra 👶',
    prediction: "Abhi nahi abhi nahi... par jab bhi hoga, Manoj strict parent banne ki koshish karega aur 2 minute mein pighal jaayega. Pooja actually strict hogi but sabko lagega Manoj strict hai. Classic parent switcheroo. 😂",
    stars: 5,
  },
  {
    category: 'Social Media Rahu 📱',
    prediction: "Instagram pe couple goals post karenge, but real life mein ek dusre ki stories skip karenge. Manoj ka screen time: 6 hours. Pooja bolegi 'phone rakh', while her own screen time is 7 hours. Irony, thy name is marriage. 📵",
    stars: 3,
  },
];

interface FortunetellerProps {
  player: PlayerID;
  onComplete: () => void;
}

export default function Fortuneteller({ player, onComplete }: FortunetellerProps) {
  const [phase, setPhase] = useState<'intro' | 'reading' | 'complete'>('intro');
  const [currentPrediction, setCurrentPrediction] = useState(0);
  const [revealedPredictions, setRevealedPredictions] = useState<number[]>([]);
  const [showPrediction, setShowPrediction] = useState(false);

  const startReading = () => {
    setPhase('reading');
    setTimeout(() => setShowPrediction(true), 1000);
  };

  const nextPrediction = () => {
    setShowPrediction(false);
    if (currentPrediction < PREDICTIONS.length - 1) {
      setTimeout(() => {
        setCurrentPrediction((c) => c + 1);
        setRevealedPredictions((r) => [...r, currentPrediction]);
        setShowPrediction(true);
      }, 600);
    } else {
      setPhase('complete');
    }
  };

  const prediction = PREDICTIONS[currentPrediction];

  return (
    <div className="py-10 relative">
      <MandalaRing size={400} opacity={0.03} />

      {phase === 'intro' && (
        <div className="text-center animate-fade-in relative z-10">
          {/* Pandit avatar */}
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
            of Manoj & Pooja&apos;s stars, planets, and WhatsApp chat patterns 
            to predict their married life.
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
          {/* Progress */}
          <div className="flex gap-1.5 mb-6 justify-center">
            {PREDICTIONS.map((_, i) => (
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
              Prediction {currentPrediction + 1} of {PREDICTIONS.length}
            </span>
          </div>

          {showPrediction ? (
            <div key={currentPrediction} className="animate-slide-up">
              {/* Prediction card */}
              <div className="bg-gradient-to-br from-orange-900/20 to-royal-gold/[0.06] border border-royal-gold/20 rounded-2xl p-6 mb-6">
                {/* Category */}
                <div className="text-center mb-4">
                  <div className="inline-block px-4 py-1.5 bg-royal-gold/10 border border-royal-gold/20 rounded-full">
                    <span className="text-sm text-royal-gold font-semibold">
                      {prediction.category}
                    </span>
                  </div>
                </div>

                {/* Stars */}
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

                {/* Prediction text */}
                <p className="text-base text-royal-cream leading-relaxed">
                  {prediction.prediction}
                </p>
              </div>

              {/* Next button */}
              <div className="text-center">
                <button
                  onClick={nextPrediction}
                  className="px-8 py-3 bg-royal-gold/10 border border-royal-gold/30 rounded-xl text-royal-gold text-sm font-display font-semibold tracking-wider uppercase cursor-pointer hover:bg-royal-gold/20 transition-all"
                >
                  {currentPrediction < PREDICTIONS.length - 1 ? 'Next Prediction →' : 'Complete Reading ✨'}
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
