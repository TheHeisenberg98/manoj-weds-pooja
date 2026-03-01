// ==============================================
// Web Audio API Sound Engine — Synthesized + MP3 file playback
// ==============================================

class SoundEngine {
  private ctx: AudioContext | null = null;
  private _muted = false;
  private activeNodes: Set<AudioNode> = new Set();
  // Persistent nodes for loops
  private bgMusicNodes: AudioNode[] = [];
  private ambientNodes: AudioNode[] = [];
  private drumrollTimeout: ReturnType<typeof setTimeout> | null = null;
  // Cache for loaded audio files
  private audioCache: Map<string, HTMLAudioElement> = new Map();

  get muted() {
    return this._muted;
  }

  set muted(val: boolean) {
    this._muted = val;
    if (val && this.ctx) {
      this.bgMusicStop();
      this.ambientStop();
      this.drumrollStop();
    }
  }

  /** Lazily initialize AudioContext on first user gesture */
  private ensure(): AudioContext | null {
    if (this._muted) return null;
    if (!this.ctx) {
      try {
        this.ctx = new AudioContext();
      } catch {
        return null;
      }
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  /** Create white noise buffer */
  private noiseBuffer(duration: number): AudioBuffer {
    const ctx = this.ctx!;
    const len = ctx.sampleRate * duration;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    return buf;
  }

  // ==================== FILE PLAYBACK ====================

  /** Play an MP3 file from /sounds/ directory */
  playFile(filename: string) {
    if (this._muted) return;
    const path = `/sounds/${filename}`;
    let audio = this.audioCache.get(path);
    if (audio) {
      audio.currentTime = 0;
    } else {
      audio = new Audio(path);
      this.audioCache.set(path, audio);
    }
    audio.volume = 0.7;
    audio.play().catch(() => {});
  }

  // ==================== SYNTHESIZED SOUNDS ====================

  /** Soft chime — PhoneGate verification */
  chime() {
    const ctx = this.ensure();
    if (!ctx) return;
    const t = ctx.currentTime;
    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.exponentialRampToValueAtTime(1320, t + 0.15);
    osc.connect(gain);
    osc.start(t);
    osc.stop(t + 0.8);

    // Harmonic
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1760, t + 0.1);
    const g2 = ctx.createGain();
    g2.gain.setValueAtTime(0.1, t + 0.1);
    g2.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
    osc2.connect(g2).connect(ctx.destination);
    osc2.start(t + 0.1);
    osc2.stop(t + 0.6);
  }

  /** Hinge match reveal — ascending C-E-G with shimmer */
  matchReveal() {
    const ctx = this.ensure();
    if (!ctx) return;
    const t = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

    notes.forEach((freq, i) => {
      const delay = i * 0.12;
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, t + delay);
      gain.gain.linearRampToValueAtTime(0.2, t + delay + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 1.2);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t + delay);
      osc.stop(t + delay + 1.2);
    });

    // Shimmer — high pitched noise burst
    const noise = ctx.createBufferSource();
    noise.buffer = this.noiseBuffer(0.6);
    const hpf = ctx.createBiquadFilter();
    hpf.type = 'highpass';
    hpf.frequency.value = 6000;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.06, t + 0.3);
    ng.gain.exponentialRampToValueAtTime(0.001, t + 0.9);
    noise.connect(hpf).connect(ng).connect(ctx.destination);
    noise.start(t + 0.3);
    noise.stop(t + 0.9);
  }

  /** Page turn — filtered noise burst */
  pageTurn() {
    const ctx = this.ensure();
    if (!ctx) return;
    const t = ctx.currentTime;
    const noise = ctx.createBufferSource();
    noise.buffer = this.noiseBuffer(0.2);
    const bpf = ctx.createBiquadFilter();
    bpf.type = 'bandpass';
    bpf.frequency.value = 2000;
    bpf.Q.value = 0.5;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    noise.connect(bpf).connect(gain).connect(ctx.destination);
    noise.start(t);
    noise.stop(t + 0.2);
  }

  /** Soft background music — detuned pad loop */
  bgMusicStart() {
    const ctx = this.ensure();
    if (!ctx) return;
    if (this.bgMusicNodes.length > 0) return; // already playing

    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.06;
    masterGain.connect(ctx.destination);

    const lpf = ctx.createBiquadFilter();
    lpf.type = 'lowpass';
    lpf.frequency.value = 800;
    lpf.connect(masterGain);

    // Two detuned oscillators for warmth
    [220, 330].forEach((freq) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      osc.detune.value = (Math.random() - 0.5) * 10;
      osc.connect(lpf);
      osc.start();
      this.bgMusicNodes.push(osc);
    });

    // Sub bass
    const sub = ctx.createOscillator();
    sub.type = 'sine';
    sub.frequency.value = 110;
    const subGain = ctx.createGain();
    subGain.gain.value = 0.04;
    sub.connect(subGain).connect(ctx.destination);
    sub.start();
    this.bgMusicNodes.push(sub, masterGain, lpf, subGain);
  }

  bgMusicStop() {
    this.bgMusicNodes.forEach((n) => {
      try {
        if (n instanceof OscillatorNode) n.stop();
        n.disconnect();
      } catch {}
    });
    this.bgMusicNodes = [];
  }

  /** Swipe whoosh — bandpass noise sweep */
  whoosh() {
    const ctx = this.ensure();
    if (!ctx) return;
    const t = ctx.currentTime;
    const noise = ctx.createBufferSource();
    noise.buffer = this.noiseBuffer(0.3);
    const bpf = ctx.createBiquadFilter();
    bpf.type = 'bandpass';
    bpf.frequency.setValueAtTime(400, t);
    bpf.frequency.exponentialRampToValueAtTime(3000, t + 0.15);
    bpf.frequency.exponentialRampToValueAtTime(400, t + 0.3);
    bpf.Q.value = 2;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    noise.connect(bpf).connect(gain).connect(ctx.destination);
    noise.start(t);
    noise.stop(t + 0.3);
  }

  /** Short pop — SwipeGame selection */
  pop() {
    const ctx = this.ensure();
    if (!ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(200, t + 0.08);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.1);
  }

  /** Tiny click — quiz answer */
  click() {
    const ctx = this.ensure();
    if (!ctx) return;
    const t = ctx.currentTime;
    const noise = ctx.createBufferSource();
    noise.buffer = this.noiseBuffer(0.03);
    const hpf = ctx.createBiquadFilter();
    hpf.type = 'highpass';
    hpf.frequency.value = 3000;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
    noise.connect(hpf).connect(gain).connect(ctx.destination);
    noise.start(t);
    noise.stop(t + 0.03);
  }

  /** 3-note completion arpeggio — quiz complete */
  completionChime() {
    const ctx = this.ensure();
    if (!ctx) return;
    const t = ctx.currentTime;
    const notes = [659.25, 783.99, 1046.5]; // E5, G5, C6

    notes.forEach((freq, i) => {
      const delay = i * 0.15;
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.2, t + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.6);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t + delay);
      osc.stop(t + delay + 0.6);
    });
  }

  /** Ambient waiting loop — soft drone */
  ambientLoop() {
    const ctx = this.ensure();
    if (!ctx) return;
    if (this.ambientNodes.length > 0) return;

    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.04;
    masterGain.connect(ctx.destination);

    const lpf = ctx.createBiquadFilter();
    lpf.type = 'lowpass';
    lpf.frequency.value = 600;
    lpf.connect(masterGain);

    // Drone
    const drone = ctx.createOscillator();
    drone.type = 'sine';
    drone.frequency.value = 165; // E3
    drone.connect(lpf);
    drone.start();

    // Shimmer
    const shimmer = ctx.createOscillator();
    shimmer.type = 'sine';
    shimmer.frequency.value = 330;
    shimmer.detune.value = 5;
    const sGain = ctx.createGain();
    sGain.gain.value = 0.02;
    shimmer.connect(sGain).connect(ctx.destination);
    shimmer.start();

    this.ambientNodes.push(drone, shimmer, masterGain, lpf, sGain);
  }

  ambientStop() {
    this.ambientNodes.forEach((n) => {
      try {
        if (n instanceof OscillatorNode) n.stop();
        n.disconnect();
      } catch {}
    });
    this.ambientNodes = [];
  }

  /** Celebration burst — fast ascending scale + noise */
  celebration() {
    const ctx = this.ensure();
    if (!ctx) return;
    const t = ctx.currentTime;
    const scale = [523, 587, 659, 698, 784, 880, 988, 1047]; // C5 major scale

    scale.forEach((freq, i) => {
      const delay = i * 0.06;
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.15, t + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.3);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t + delay);
      osc.stop(t + delay + 0.3);
    });

    // Noise burst at end
    const noise = ctx.createBufferSource();
    noise.buffer = this.noiseBuffer(0.4);
    const hpf = ctx.createBiquadFilter();
    hpf.type = 'highpass';
    hpf.frequency.value = 4000;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.08, t + 0.4);
    ng.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
    noise.connect(hpf).connect(ng).connect(ctx.destination);
    noise.start(t + 0.4);
    noise.stop(t + 0.8);
  }

  /** Drumroll — rapid noise hits with crescendo */
  private drumrollRunning = false;

  drumroll() {
    const ctx = this.ensure();
    if (!ctx) return;
    if (this.drumrollRunning) return;
    this.drumrollRunning = true;

    let volume = 0.05;
    const hit = () => {
      if (!this.drumrollRunning || this._muted) {
        this.drumrollRunning = false;
        return;
      }
      const t = ctx.currentTime;
      const noise = ctx.createBufferSource();
      noise.buffer = this.noiseBuffer(0.06);
      const bpf = ctx.createBiquadFilter();
      bpf.type = 'bandpass';
      bpf.frequency.value = 200;
      bpf.Q.value = 1;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(Math.min(volume, 0.2), t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
      noise.connect(bpf).connect(gain).connect(ctx.destination);
      noise.start(t);
      noise.stop(t + 0.06);
      volume += 0.003;
      this.drumrollTimeout = setTimeout(hit, 60 + Math.random() * 20);
    };
    hit();
  }

  drumrollStop() {
    this.drumrollRunning = false;
    if (this.drumrollTimeout) {
      clearTimeout(this.drumrollTimeout);
      this.drumrollTimeout = null;
    }
  }

  /** Tada — major chord with cymbal */
  tada() {
    const ctx = this.ensure();
    if (!ctx) return;
    this.drumrollStop();
    const t = ctx.currentTime;
    const chord = [523.25, 659.25, 783.99, 1046.5]; // C major

    chord.forEach((freq) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 1.5);
    });

    // Cymbal noise
    const noise = ctx.createBufferSource();
    noise.buffer = this.noiseBuffer(1.0);
    const hpf = ctx.createBiquadFilter();
    hpf.type = 'highpass';
    hpf.frequency.value = 5000;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.1, t);
    ng.gain.exponentialRampToValueAtTime(0.001, t + 1.0);
    noise.connect(hpf).connect(ng).connect(ctx.destination);
    noise.start(t);
    noise.stop(t + 1.0);
  }

  /** Mystical sweep — detuned sine with reverb feel */
  mystical() {
    const ctx = this.ensure();
    if (!ctx) return;
    const t = ctx.currentTime;

    // Sweep oscillator
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.exponentialRampToValueAtTime(800, t + 0.8);
    osc.frequency.exponentialRampToValueAtTime(400, t + 1.5);

    // Detuned copy
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(203, t);
    osc2.frequency.exponentialRampToValueAtTime(808, t + 0.8);
    osc2.frequency.exponentialRampToValueAtTime(404, t + 1.5);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.5);

    osc.connect(gain).connect(ctx.destination);
    osc2.connect(gain);
    osc.start(t);
    osc2.start(t);
    osc.stop(t + 1.5);
    osc2.stop(t + 1.5);
  }

  /** Bell — sine with harmonics, long decay */
  bell() {
    const ctx = this.ensure();
    if (!ctx) return;
    const t = ctx.currentTime;
    const harmonics = [800, 1600, 2400];

    harmonics.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const gain = ctx.createGain();
      const vol = 0.15 / (i + 1);
      gain.gain.setValueAtTime(vol, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 1.2);
    });
  }

  /** Grand reveal — low sweep + chord + shimmer */
  grandReveal() {
    const ctx = this.ensure();
    if (!ctx) return;
    const t = ctx.currentTime;

    // Low sweep
    const sweep = ctx.createOscillator();
    sweep.type = 'sine';
    sweep.frequency.setValueAtTime(80, t);
    sweep.frequency.exponentialRampToValueAtTime(400, t + 0.8);
    const sg = ctx.createGain();
    sg.gain.setValueAtTime(0.2, t);
    sg.gain.exponentialRampToValueAtTime(0.001, t + 1.0);
    sweep.connect(sg).connect(ctx.destination);
    sweep.start(t);
    sweep.stop(t + 1.0);

    // Chord hits at 0.6s
    const chord = [440, 554.37, 659.25, 880]; // A major
    chord.forEach((freq) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, t);
      gain.gain.setValueAtTime(0.18, t + 0.6);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 2.2);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 2.2);
    });

    // Shimmer
    const noise = ctx.createBufferSource();
    noise.buffer = this.noiseBuffer(1.5);
    const hpf = ctx.createBiquadFilter();
    hpf.type = 'highpass';
    hpf.frequency.value = 6000;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0, t);
    ng.gain.setValueAtTime(0.07, t + 0.6);
    ng.gain.exponentialRampToValueAtTime(0.001, t + 2.0);
    noise.connect(hpf).connect(ng).connect(ctx.destination);
    noise.start(t);
    noise.stop(t + 2.0);
  }

  /** Confetti sparkle — cascade of random high pings */
  confetti() {
    const ctx = this.ensure();
    if (!ctx) return;
    const t = ctx.currentTime;

    for (let i = 0; i < 12; i++) {
      const delay = i * 0.08 + Math.random() * 0.04;
      const freq = 1500 + Math.random() * 3000;
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.08, t + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.2);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t + delay);
      osc.stop(t + delay + 0.2);
    }
  }
}

// Singleton
export const soundEngine = new SoundEngine();

export type SoundName =
  | 'chime'
  | 'matchReveal'
  | 'pageTurn'
  | 'bgMusicStart'
  | 'bgMusicStop'
  | 'whoosh'
  | 'pop'
  | 'click'
  | 'completionChime'
  | 'ambientLoop'
  | 'ambientStop'
  | 'celebration'
  | 'drumroll'
  | 'drumrollStop'
  | 'tada'
  | 'mystical'
  | 'bell'
  | 'grandReveal'
  | 'confetti'
  | 'playFile';

// Meme sound file names for convenience
export const MEME_SOUNDS = {
  vineBoom: 'vine-boom.mp3',
  emotionalDamage: 'emotional-damage.mp3',
  bruh: 'bruh.mp3',
  airhorn: 'airhorn.mp3',
} as const;
