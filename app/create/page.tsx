'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  getCreatorExperiences,
  createExperience,
  createDefaultStages,
  deleteExperience,
} from '@/lib/experienceData';
import { useAuth } from '@/lib/auth';
import type { ExperienceListItem, Occasion } from '@/lib/types';

const OCCASION_BADGES: Record<string, { label: string; color: string }> = {
  wedding: { label: 'Wedding', color: '#E91E63' },
  anniversary: { label: 'Anniversary', color: '#9C27B0' },
  birthday: { label: 'Birthday', color: '#FF9800' },
  friendship: { label: 'Friendship', color: '#4CAF50' },
  family: { label: 'Family', color: '#2196F3' },
  custom: { label: 'Custom', color: '#607D8B' },
};

export default function CreatorDashboard() {
  const router = useRouter();
  const { creator, loading: authLoading, signOut } = useAuth();
  const [experiences, setExperiences] = useState<ExperienceListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [personA, setPersonA] = useState('');
  const [personB, setPersonB] = useState('');
  const [occasion, setOccasion] = useState<Occasion>('wedding');

  useEffect(() => {
    if (!authLoading && creator) {
      loadExperiences(creator.id);
    }
  }, [authLoading, creator]);

  async function loadExperiences(creatorId: string) {
    const data = await getCreatorExperiences(creatorId);
    setExperiences(data as ExperienceListItem[]);
    setLoading(false);
  }

  async function handleCreate() {
    if (!title.trim() || !personA.trim() || !personB.trim() || !creator) return;
    setCreating(true);
    try {
      const exp = await createExperience(creator.id, {
        title: title.trim(),
        occasion,
        person_a_name: personA.trim(),
        person_b_name: personB.trim(),
      });
      await createDefaultStages(exp.id);
      router.push(`/create/${exp.id}`);
    } catch (err) {
      console.error('Create failed:', err);
      setCreating(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this experience? This cannot be undone.')) return;
    setDeleting(id);
    try {
      await deleteExperience(id);
      setExperiences((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
    }
    setDeleting(null);
  }

  function resetForm() {
    setTitle('');
    setPersonA('');
    setPersonB('');
    setOccasion('wedding');
  }

  const inputStyle = {
    background: 'rgba(212, 168, 83, 0.06)',
    border: '1px solid rgba(212, 168, 83, 0.2)',
    color: '#F5E6D0',
  };

  return (
    <div className="min-h-screen relative">
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

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <Link href="/" className="text-sm tracking-widest uppercase mb-1 block transition-colors hover:opacity-80" style={{ color: '#A89A8C' }}>
              LoveCraft
            </Link>
            <h1 className="text-3xl font-light" style={{ background: 'linear-gradient(to bottom, #E8D5A3, #D4A853)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Your Experiences
            </h1>
            {creator && (
              <p className="text-xs mt-1" style={{ color: '#A89A8C' }}>
                {creator.name ?? creator.email}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={async () => { await signOut(); router.push('/login'); }}
              className="px-4 py-2 rounded-xl text-xs tracking-wider transition-all hover:scale-105"
              style={{ background: 'rgba(212, 168, 83, 0.06)', border: '1px solid rgba(212, 168, 83, 0.15)', color: '#A89A8C' }}
            >
              Sign Out
            </button>
            <button
              onClick={() => { resetForm(); setShowModal(true); }}
              className="px-6 py-3 rounded-xl text-sm font-semibold tracking-wider uppercase transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #8B1C1C, #6B1515)', border: '1px solid rgba(212, 168, 83, 0.4)', color: '#E8D5A3' }}
            >
              + Create New
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-20">
            <div className="w-8 h-8 border-2 border-royal-gold/30 border-t-royal-gold rounded-full mx-auto mb-4 animate-spin" />
            <p className="text-sm" style={{ color: '#A89A8C' }}>Loading experiences...</p>
          </div>
        ) : experiences.length === 0 ? (
          <div className="rounded-2xl p-16 text-center" style={{ background: 'rgba(212, 168, 83, 0.03)', border: '2px dashed rgba(212, 168, 83, 0.15)' }}>
            <div className="text-5xl mb-6">🎁</div>
            <h2 className="text-xl font-light mb-3" style={{ color: '#F5E6D0' }}>No experiences yet</h2>
            <p className="text-sm mb-8 max-w-md mx-auto" style={{ color: '#A89A8C' }}>
              Create your first interactive gift experience. Choose games, add photos, customize questions, and share a unique link with your loved ones.
            </p>
            <button
              onClick={() => { resetForm(); setShowModal(true); }}
              className="px-8 py-3 rounded-xl text-sm font-semibold tracking-wider uppercase transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #8B1C1C, #6B1515)', border: '1px solid rgba(212, 168, 83, 0.4)', color: '#E8D5A3' }}
            >
              Create Your First Experience
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {experiences.map((exp) => {
              const badge = OCCASION_BADGES[exp.occasion] ?? OCCASION_BADGES.custom;
              return (
                <div
                  key={exp.id}
                  className="rounded-2xl p-6 flex items-center gap-6 group transition-all hover:scale-[1.01]"
                  style={{ background: 'rgba(212, 168, 83, 0.04)', border: '1px solid rgba(212, 168, 83, 0.12)' }}
                >
                  {/* Left: Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${badge.color}20`, color: badge.color, border: `1px solid ${badge.color}40` }}>
                        {badge.label}
                      </span>
                      {exp.is_published ? (
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(76, 175, 80, 0.15)', color: '#4CAF50', border: '1px solid rgba(76, 175, 80, 0.3)' }}>
                          Published
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(168, 154, 140, 0.1)', color: '#A89A8C', border: '1px solid rgba(168, 154, 140, 0.2)' }}>
                          Draft
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-light truncate" style={{ color: '#F5E6D0' }}>{exp.title}</h3>
                    <p className="text-sm" style={{ color: '#A89A8C' }}>
                      {exp.person_a_name} & {exp.person_b_name}
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'rgba(168, 154, 140, 0.5)' }}>
                      /e/{exp.slug}
                    </p>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2">
                    {exp.is_published && (
                      <Link
                        href={`/e/${exp.slug}`}
                        target="_blank"
                        className="px-3 py-2 rounded-lg text-xs tracking-wider transition-all hover:scale-105"
                        style={{ background: 'rgba(212, 168, 83, 0.08)', border: '1px solid rgba(212, 168, 83, 0.2)', color: '#D4A853' }}
                      >
                        View
                      </Link>
                    )}
                    <Link
                      href={`/create/${exp.id}`}
                      className="px-4 py-2 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all hover:scale-105"
                      style={{ background: 'rgba(212, 168, 83, 0.1)', border: '1px solid rgba(212, 168, 83, 0.3)', color: '#D4A853' }}
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(exp.id)}
                      disabled={deleting === exp.id}
                      className="px-3 py-2 rounded-lg text-xs transition-all hover:scale-105 disabled:opacity-50"
                      style={{ background: 'rgba(244, 67, 54, 0.08)', border: '1px solid rgba(244, 67, 54, 0.2)', color: '#F44336' }}
                    >
                      {deleting === exp.id ? '...' : '✕'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div
            className="w-full max-w-md rounded-2xl p-8"
            style={{ background: '#1A0A0A', border: '1px solid rgba(212, 168, 83, 0.2)' }}
          >
            <h2 className="text-xl font-light mb-6" style={{ background: 'linear-gradient(to bottom, #E8D5A3, #D4A853)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Create New Experience
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-xs tracking-wider uppercase mb-1.5 block" style={{ color: '#A89A8C' }}>Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Manoj Weds Pooja"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors focus:border-royal-gold/50"
                  style={inputStyle}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs tracking-wider uppercase mb-1.5 block" style={{ color: '#A89A8C' }}>Person A</label>
                  <input
                    value={personA}
                    onChange={(e) => setPersonA(e.target.value)}
                    placeholder="Name"
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="text-xs tracking-wider uppercase mb-1.5 block" style={{ color: '#A89A8C' }}>Person B</label>
                  <input
                    value={personB}
                    onChange={(e) => setPersonB(e.target.value)}
                    placeholder="Name"
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs tracking-wider uppercase mb-1.5 block" style={{ color: '#A89A8C' }}>Occasion</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['wedding', 'anniversary', 'birthday', 'friendship', 'family', 'custom'] as Occasion[]).map((occ) => {
                    const b = OCCASION_BADGES[occ];
                    const sel = occasion === occ;
                    return (
                      <button
                        key={occ}
                        onClick={() => setOccasion(occ)}
                        className="px-3 py-2 rounded-xl text-xs text-center transition-all"
                        style={{
                          background: sel ? `${b.color}20` : 'rgba(212, 168, 83, 0.04)',
                          border: sel ? `1px solid ${b.color}60` : '1px solid rgba(212, 168, 83, 0.1)',
                          color: sel ? b.color : '#A89A8C',
                        }}
                      >
                        {b.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 rounded-xl text-sm tracking-wider transition-all"
                style={{ background: 'rgba(212, 168, 83, 0.06)', border: '1px solid rgba(212, 168, 83, 0.15)', color: '#A89A8C' }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={creating || !title.trim() || !personA.trim() || !personB.trim()}
                className="flex-1 py-3 rounded-xl text-sm font-semibold tracking-wider uppercase transition-all hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
                style={{ background: 'linear-gradient(135deg, #8B1C1C, #6B1515)', border: '1px solid rgba(212, 168, 83, 0.4)', color: '#E8D5A3' }}
              >
                {creating ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
