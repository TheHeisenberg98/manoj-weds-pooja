'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function LandingPage() {
  const [slug, setSlug] = useState('');

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `
            radial-gradient(ellipse at 20% 50%, rgba(139, 28, 28, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 20%, rgba(212, 168, 83, 0.08) 0%, transparent 40%),
            radial-gradient(ellipse at 50% 80%, rgba(139, 28, 28, 0.1) 0%, transparent 50%)
          `,
        }}
      />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
        {/* Hero */}
        <div className="text-center max-w-lg">
          {/* Logo / Brand */}
          <div className="mb-2 text-sm tracking-[8px] uppercase" style={{ color: '#A89A8C' }}>
            Introducing
          </div>
          <h1
            className="text-6xl sm:text-7xl font-light mb-4"
            style={{
              background: 'linear-gradient(to bottom, #E8D5A3, #D4A853, #B8924A)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            LoveCraft
          </h1>
          <p className="text-lg sm:text-xl font-light leading-relaxed mb-2" style={{ color: '#F5E6D0' }}>
            Create beautiful, interactive gift experiences
            <br />
            for the people you love.
          </p>
          <p className="text-sm mb-10" style={{ color: '#A89A8C' }}>
            Quizzes, photo journeys, swipe games, compatibility scores &mdash; all wrapped in a cinematic experience they&apos;ll never forget.
          </p>

          {/* CTA */}
          <Link
            href="/create"
            className="inline-block px-10 py-4 rounded-xl text-base font-semibold tracking-widest uppercase transition-all duration-300 hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #8B1C1C, #6B1515)',
              border: '1px solid rgba(212, 168, 83, 0.4)',
              color: '#E8D5A3',
            }}
          >
            Create an Experience
          </Link>

          {/* Divider */}
          <div className="flex items-center gap-4 my-10">
            <div className="flex-1 h-px" style={{ background: 'rgba(212, 168, 83, 0.2)' }} />
            <span className="text-xs tracking-widest uppercase" style={{ color: '#A89A8C' }}>
              or
            </span>
            <div className="flex-1 h-px" style={{ background: 'rgba(212, 168, 83, 0.2)' }} />
          </div>

          {/* Slug input */}
          <p className="text-sm mb-4" style={{ color: '#A89A8C' }}>
            Already have a link? Enter your experience code
          </p>
          <div className="flex gap-3 max-w-sm mx-auto">
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              placeholder="e.g. manoj-weds-pooja"
              className="flex-1 px-4 py-3 rounded-xl text-sm outline-none transition-colors"
              style={{
                background: 'rgba(212, 168, 83, 0.08)',
                border: '1px solid rgba(212, 168, 83, 0.2)',
                color: '#F5E6D0',
              }}
            />
            <Link
              href={slug ? `/e/${slug}` : '#'}
              onClick={(e) => { if (!slug) e.preventDefault(); }}
              className="px-6 py-3 rounded-xl text-sm font-semibold tracking-wider uppercase transition-all"
              style={{
                background: slug ? 'rgba(212, 168, 83, 0.15)' : 'rgba(212, 168, 83, 0.05)',
                border: '1px solid rgba(212, 168, 83, 0.3)',
                color: slug ? '#D4A853' : '#A89A8C',
                pointerEvents: slug ? 'auto' : 'none',
              }}
            >
              Go
            </Link>
          </div>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-3 mt-16 max-w-md">
          {[
            { icon: '📸', label: 'Photo Journeys' },
            { icon: '❓', label: 'Couple Quizzes' },
            { icon: '👆', label: 'Swipe Games' },
            { icon: '💕', label: 'Compatibility Scores' },
            { icon: '🔮', label: 'Fortune Teller' },
            { icon: '🎁', label: 'Gift Reveals' },
          ].map((f) => (
            <span
              key={f.label}
              className="px-4 py-2 rounded-full text-xs tracking-wider"
              style={{
                background: 'rgba(212, 168, 83, 0.06)',
                border: '1px solid rgba(212, 168, 83, 0.15)',
                color: '#A89A8C',
              }}
            >
              {f.icon} {f.label}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-16 mb-8 text-center">
          <p className="text-xs" style={{ color: 'rgba(168, 154, 140, 0.5)' }}>
            Built with love. Powered by LoveCraft.
          </p>
        </div>
      </div>
    </div>
  );
}
