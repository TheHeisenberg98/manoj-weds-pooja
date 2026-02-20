'use client';

import { useState, useRef } from 'react';
import { OrnateCorner, GoldDivider, MandalaRing } from './Ornaments';
import { getPlayerByPhone, type PlayerID } from '@/lib/supabase';

interface PhoneGateProps {
  onVerified: (player: PlayerID) => void;
}

export default function PhoneGate({ onVerified }: PhoneGateProps) {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [step, setStep] = useState<'phone' | 'otp' | 'verified'>('phone');
  const [error, setError] = useState('');
  const [showVerifying, setShowVerifying] = useState(false);
  const otpRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  const handlePhoneSend = () => {
    const player = getPlayerByPhone(phone);
    if (player) {
      setError('');
      setStep('otp');
    } else {
      setError('This experience is exclusively crafted for the couple ✨');
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 3) otpRefs[index + 1].current?.focus();
    if (newOtp.every((d) => d !== '')) {
      setShowVerifying(true);
      setTimeout(() => {
        setStep('verified');
        const player = getPlayerByPhone(phone)!;
        setTimeout(() => onVerified(player), 1500);
      }, 1800);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative animate-fade-in">
      <MandalaRing size={350} opacity={0.05} />

      <div className="relative z-10 text-center w-full max-w-[360px]">
        {/* Ornate corners */}
        <div className="flex justify-between -mb-2">
          <OrnateCorner />
          <OrnateCorner flip />
        </div>

        <div className="text-sm tracking-[6px] text-royal-gold mb-2 uppercase">
          Shubh Vivah
        </div>

        <h1 className="text-5xl font-light leading-tight my-2 bg-gradient-to-b from-royal-gold-light via-royal-gold to-royal-gold-dark bg-clip-text text-transparent">
          Manoj
        </h1>
        <div className="text-lg text-royal-gold italic">weds</div>
        <h1 className="text-5xl font-light leading-tight mt-2 mb-4 bg-gradient-to-b from-royal-gold-light via-royal-gold to-royal-gold-dark bg-clip-text text-transparent">
          Pooja
        </h1>

        <GoldDivider />

        {/* Phone step */}
        {step === 'phone' && (
          <div className="animate-slide-up">
            <p className="text-[15px] text-royal-muted mb-6 leading-relaxed">
              This is a private celebration.<br />
              Enter your phone number to continue.
            </p>
            <div className="flex items-center bg-royal-gold/[0.08] border border-royal-gold/25 rounded-xl px-4 py-3 mb-4">
              <span className="text-royal-gold mr-3 text-[15px]">+91</span>
              <input
                type="tel"
                maxLength={10}
                value={phone}
                onChange={(e) => { setPhone(e.target.value.replace(/\D/g, '')); setError(''); }}
                placeholder="Enter your number"
                className="flex-1 bg-transparent border-none outline-none text-royal-cream text-lg font-display tracking-widest placeholder:text-royal-muted/40"
              />
            </div>
            {error && (
              <p className="text-red-400 text-sm mb-3 animate-shake">{error}</p>
            )}
            <button
              onClick={handlePhoneSend}
              disabled={phone.length < 10}
              className={`w-full py-3.5 rounded-xl text-royal-gold-light text-base font-display font-semibold tracking-[3px] uppercase transition-all border border-royal-gold/40 ${
                phone.length >= 10
                  ? 'bg-gradient-to-br from-royal-red via-royal-red-light to-royal-red cursor-pointer hover:brightness-110'
                  : 'bg-royal-red/30 cursor-not-allowed'
              }`}
            >
              Send OTP
            </button>
          </div>
        )}

        {/* OTP step */}
        {step === 'otp' && (
          <div className="animate-slide-up">
            <p className="text-sm text-royal-muted mb-6">
              Enter the 4-digit OTP sent to +91 {phone.slice(0, 3)}***{phone.slice(-2)}
            </p>
            <div className="flex gap-3 justify-center mb-6">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={otpRefs[i]}
                  type="tel"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  disabled={showVerifying}
                  className={`w-[52px] h-[60px] text-center text-2xl font-display bg-royal-gold/[0.08] border rounded-lg text-royal-gold-light outline-none transition-all ${
                    digit ? 'border-royal-gold' : 'border-royal-gold/25'
                  }`}
                />
              ))}
            </div>
            {showVerifying && (
              <div className="animate-fade-in">
                <div className="w-7 h-7 border-2 border-royal-gold/30 border-t-royal-gold rounded-full mx-auto mb-3 animate-spin-slow" />
                <p className="text-sm text-royal-gold">Verifying...</p>
              </div>
            )}
            <p className="text-xs text-royal-muted/50 mt-4">
              Hint: Any 4 digits will work 😉
            </p>
          </div>
        )}

        {/* Verified step */}
        {step === 'verified' && (
          <div className="animate-scale-in text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-700 to-green-500 flex items-center justify-center mx-auto mb-4 text-3xl">
              ✓
            </div>
            <p className="text-lg text-royal-gold font-semibold">Verified Successfully</p>
            <p className="text-sm text-royal-muted mt-2">Welcome, preparing your experience...</p>
          </div>
        )}
      </div>
    </div>
  );
}
