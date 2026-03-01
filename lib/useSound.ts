'use client';

import { useCallback } from 'react';
import { soundEngine, type SoundName } from './soundEngine';

export function useSound() {
  const play = useCallback((name: SoundName) => {
    const fn = soundEngine[name];
    if (typeof fn === 'function') {
      (fn as () => void).call(soundEngine);
    }
  }, []);

  return { play };
}
