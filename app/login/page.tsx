'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signInWithEmail, signInWithGoogle, getSession } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // If already logged in, redirect to /create
    getSession().then((session) => {
      if (session) {
        router.replace('/create');
      } else {
        setChecking(false);
      }
    });
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    setError('');

    const { error: authError } = await signInWithEmail(email.trim(), password);
    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else {
      router.push('/create');
    }
  }

  async function handleGoogle() {
    setError('');
    const { error: authError } = await signInWithGoogle();
    if (authError) {
      setError(authError.message);
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#1A0A0A' }}>
        <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(212, 168, 83, 0.3)', borderTopColor: '#D4A853' }} />
      </div>
    );
  }

  const inputStyle: React.CSSProperties = {
    background: 'rgba(212, 168, 83, 0.06)',
    border: '1px solid rgba(212, 168, 83, 0.2)',
    color: '#F5E6D0',
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#1A0A0A' }}>
      {/* Background gradients */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(ellipse at 20% 50%, rgba(139, 28, 28, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 20%, rgba(212, 168, 83, 0.08) 0%, transparent 40%),
            radial-gradient(ellipse at 50% 80%, rgba(139, 28, 28, 0.1) 0%, transparent 50%)
          `,
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-block">
            <h1
              className="text-4xl font-light tracking-wide"
              style={{
                background: 'linear-gradient(to bottom, #E8D5A3, #D4A853)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontFamily: 'Cormorant Garamond, serif',
              }}
            >
              LoveCraft
            </h1>
          </Link>
          <p className="text-sm mt-2" style={{ color: '#A89A8C' }}>
            Sign in to your creator account
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{ background: 'rgba(212, 168, 83, 0.03)', border: '1px solid rgba(212, 168, 83, 0.12)' }}
        >
          {/* Google OAuth */}
          <button
            onClick={handleGoogle}
            className="w-full py-3 rounded-xl text-sm font-medium tracking-wide transition-all hover:scale-[1.02] flex items-center justify-center gap-3 mb-6"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(212, 168, 83, 0.2)',
              color: '#F5E6D0',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px" style={{ background: 'rgba(212, 168, 83, 0.15)' }} />
            <span className="text-xs" style={{ color: '#A89A8C' }}>or</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(212, 168, 83, 0.15)' }} />
          </div>

          {/* Email form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs tracking-wider uppercase mb-1.5 block" style={{ color: '#A89A8C' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors"
                style={inputStyle}
                autoComplete="email"
              />
            </div>
            <div>
              <label className="text-xs tracking-wider uppercase mb-1.5 block" style={{ color: '#A89A8C' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors"
                style={inputStyle}
                autoComplete="current-password"
              />
            </div>

            {error && (
              <p className="text-xs py-2 px-3 rounded-lg" style={{ background: 'rgba(244, 67, 54, 0.1)', color: '#F44336', border: '1px solid rgba(244, 67, 54, 0.2)' }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !email.trim() || !password.trim()}
              className="w-full py-3 rounded-xl text-sm font-semibold tracking-wider uppercase transition-all hover:scale-[1.02] disabled:opacity-40 disabled:hover:scale-100"
              style={{
                background: 'linear-gradient(135deg, #8B1C1C, #6B1515)',
                border: '1px solid rgba(212, 168, 83, 0.4)',
                color: '#E8D5A3',
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        {/* Footer link */}
        <p className="text-center mt-6 text-sm" style={{ color: '#A89A8C' }}>
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="underline transition-colors hover:opacity-80" style={{ color: '#D4A853' }}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
