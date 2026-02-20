'use client';

export function OrnateCorner({ flip = false }: { flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 120 120"
      className="w-20 h-20 opacity-60"
      style={{ transform: flip ? 'scaleX(-1)' : 'none' }}
    >
      <path d="M10,110 Q10,60 40,40 Q60,25 80,20 Q100,15 110,10" fill="none" stroke="#D4A853" strokeWidth="2" />
      <path d="M10,110 Q10,70 30,50 Q50,35 70,28 Q90,22 110,10" fill="none" stroke="#D4A853" strokeWidth="1.5" />
      <circle cx="40" cy="40" r="3" fill="#D4A853" />
      <circle cx="70" cy="28" r="2.5" fill="#D4A853" />
      <circle cx="95" cy="17" r="2" fill="#D4A853" />
      <path d="M25,75 Q35,65 45,55" fill="none" stroke="#D4A853" strokeWidth="1" strokeDasharray="3,3" />
    </svg>
  );
}

export function GoldDivider() {
  return (
    <div className="flex items-center justify-center gap-3 my-8">
      <div className="w-16 h-px bg-gradient-to-r from-transparent to-royal-gold" />
      <svg viewBox="0 0 24 24" className="w-5 h-5">
        <path d="M12 2L14 8L20 8L15 12L17 18L12 14L7 18L9 12L4 8L10 8Z" fill="#D4A853" />
      </svg>
      <div className="w-16 h-px bg-gradient-to-r from-royal-gold to-transparent" />
    </div>
  );
}

export function MandalaRing({ size = 200, opacity = 0.08 }: { size?: number; opacity?: number }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className="absolute"
      style={{ width: size, height: size, opacity }}
    >
      {[...Array(12)].map((_, i) => (
        <ellipse
          key={i}
          cx="100" cy="100" rx="80" ry="30"
          fill="none" stroke="#D4A853" strokeWidth="0.8"
          transform={`rotate(${i * 15} 100 100)`}
        />
      ))}
      <circle cx="100" cy="100" r="60" fill="none" stroke="#D4A853" strokeWidth="0.5" />
      <circle cx="100" cy="100" r="40" fill="none" stroke="#D4A853" strokeWidth="0.5" />
    </svg>
  );
}

export function Confetti() {
  const colors = ['#D4A853', '#8B1C1C', '#F5D998', '#A52A2A', '#FFD700', '#FF6B6B', '#4CAF50'];
  // Generate deterministic-looking random values
  const pieces = Array.from({ length: 50 }, (_, i) => ({
    left: ((i * 37 + 13) % 100),
    delay: ((i * 23) % 200) / 100,
    duration: 2 + ((i * 17) % 300) / 100,
    color: colors[i % colors.length],
    size: 6 + ((i * 11) % 8),
    rotation: (i * 47) % 360,
    drift: i % 2 === 0 ? 80 : -80,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {pieces.map((p, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: `${p.left}%`,
            top: -20,
            width: p.size,
            height: p.size * 0.6,
            background: p.color,
            borderRadius: 2,
            transform: `rotate(${p.rotation}deg)`,
            animation: `confettiFall ${p.duration}s ease-in ${p.delay}s forwards`,
          }}
        />
      ))}
    </div>
  );
}
