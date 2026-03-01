'use client';

import { useState, useEffect } from 'react';
import { soundEngine } from '@/lib/soundEngine';

export default function SoundToggle() {
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('sound-muted');
    if (stored === 'true') {
      setMuted(true);
      soundEngine.muted = true;
    }
  }, []);

  const toggle = () => {
    const next = !muted;
    setMuted(next);
    soundEngine.muted = next;
    localStorage.setItem('sound-muted', String(next));
  };

  return (
    <button
      onClick={toggle}
      aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
      className="fixed bottom-4 left-4 z-50 w-10 h-10 rounded-full bg-royal-gold/10 border border-royal-gold/30 flex items-center justify-center text-lg transition-all hover:bg-royal-gold/20 active:scale-90"
    >
      {muted ? '🔇' : '🔊'}
    </button>
  );
}
