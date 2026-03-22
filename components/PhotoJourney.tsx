'use client';

import { useState, useEffect, useRef } from 'react';
import { GoldDivider } from './Ornaments';
import { useSound } from '@/lib/useSound';
import type { StageProps } from '@/lib/types';

interface PhotoItem {
  url: string;
  caption: string;
}

interface ChapterItem {
  title: string;
  subtitle: string;
  emoji: string;
  photos: PhotoItem[];
}

function PhotoCard({ photo, index }: { photo: PhotoItem; index: number }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.3 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="mb-5 transition-all duration-700"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(40px)',
        transitionDelay: `${index * 150}ms`,
        transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      }}
    >
      <div className="bg-royal-gold/[0.06] border border-royal-gold/15 rounded-2xl overflow-hidden">
        {photo.url ? (
          <img
            src={photo.url}
            alt={photo.caption || ''}
            className="w-full aspect-[4/3] object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full aspect-[4/3] bg-gradient-to-br from-royal-red/30 via-royal-gold/15 to-royal-red/20 flex items-center justify-center relative">
            <div className="text-center opacity-40">
              <div className="text-4xl mb-2">📷</div>
              <div className="text-xs tracking-widest uppercase">Photo</div>
            </div>
            <div className="absolute inset-2 border border-royal-gold/20 rounded-lg pointer-events-none" />
          </div>
        )}
        {photo.caption && (
          <div className="px-4 py-3.5">
            <p className="text-[15px] text-royal-muted italic leading-relaxed">
              &ldquo;{photo.caption}&rdquo;
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ChapterSection({ chapter, index, onVisible }: { chapter: ChapterItem; index: number; onVisible?: () => void }) {
  const [headingVisible, setHeadingVisible] = useState(false);
  const headingRef = useRef<HTMLDivElement>(null);
  const firedRef = useRef(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !firedRef.current) {
          firedRef.current = true;
          setHeadingVisible(true);
          onVisible?.();
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px 80px 0px' }
    );
    if (headingRef.current) obs.observe(headingRef.current);
    return () => obs.disconnect();
  }, [onVisible]);

  if (chapter.photos.length === 0) return null;

  return (
    <div className="mb-16 py-5">
      <div
        ref={headingRef}
        className="text-center mb-8 transition-all duration-500"
        style={{
          opacity: headingVisible ? 1 : 0,
          transform: headingVisible ? 'translateY(0)' : 'translateY(20px)',
        }}
      >
        <div className="text-xs tracking-[5px] text-royal-gold/50 uppercase mb-2">
          Chapter {index + 1}
        </div>
        <div className="text-4xl mb-2">{chapter.emoji}</div>
        <h2 className="text-3xl font-normal bg-gradient-to-b from-royal-gold-light to-royal-gold bg-clip-text text-transparent">
          {chapter.title}
        </h2>
        <p className="text-[15px] text-royal-muted italic mt-1">{chapter.subtitle}</p>
        <div className="w-12 h-px bg-gradient-to-r from-transparent via-royal-gold to-transparent mx-auto mt-4" />
      </div>
      {chapter.photos.map((photo, i) => (
        <PhotoCard key={`${index}-${i}`} photo={photo} index={i} />
      ))}
    </div>
  );
}

export default function PhotoJourney({
  experience,
  stageConfig,
  onComplete,
}: StageProps<'photo_journey'>) {
  const chapters = stageConfig.chapters ?? [];
  const { play } = useSound();

  useEffect(() => {
    play('bgMusicStart');
    return () => { play('bgMusicStop'); };
  }, [play]);

  if (chapters.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-royal-muted">No photo chapters configured.</p>
        <button onClick={onComplete} className="mt-4 text-royal-gold underline">Skip →</button>
      </div>
    );
  }

  return (
    <div className="pt-16 animate-fade-in">
      {/* Hero */}
      <div className="text-center mb-16">
        <div className="text-xs tracking-[6px] text-royal-gold/50 uppercase">
          A Journey of Love & Friendship
        </div>
        <GoldDivider />
        <h1 className="text-4xl font-light bg-gradient-to-b from-royal-gold-light to-royal-gold bg-clip-text text-transparent">
          The {experience.person_a_name} Story
        </h1>
        <p className="text-[15px] text-royal-muted italic mt-2">
          Scroll through the chapters of a life well-lived
        </p>
      </div>

      {/* Chapters */}
      {chapters.map((ch, i) => (
        <ChapterSection key={i} chapter={ch} index={i} onVisible={() => play('pageTurn')} />
      ))}

      {/* CTA */}
      <div className="text-center py-10">
        <GoldDivider />
        <p className="text-base text-royal-muted italic mb-6">
          You&apos;ve seen the journey. Now it&apos;s time for some fun.
        </p>
        <button
          onClick={onComplete}
          className="px-10 py-3.5 bg-gradient-to-br from-royal-red to-royal-red-light border border-royal-gold/40 rounded-xl text-royal-gold-light text-base font-display font-semibold tracking-widest uppercase cursor-pointer hover:brightness-110 transition-all"
        >
          Let&apos;s Play →
        </button>
      </div>
    </div>
  );
}
