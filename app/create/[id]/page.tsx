'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import {
  getExperienceById,
  getAllStagesForExperience,
  updateExperience,
  updateStage,
  deleteStage,
  createStage,
  reorderStages,
} from '@/lib/experienceData';
import type {
  Experience,
  Stage,
  Occasion,
  AccessMode,
  GiftType,
  ExperienceTheme,
  PhoneMapping,
  StageType,
} from '@/lib/types';
import { STAGE_REGISTRY, THEME_PRESETS } from '@/lib/types';

const TABS = [
  { id: 'basics', label: 'Basics', icon: '📝' },
  { id: 'stages', label: 'Stages', icon: '🎭' },
  { id: 'content', label: 'Content', icon: '✏️' },
  { id: 'gift', label: 'Gift', icon: '🎁' },
  { id: 'theme', label: 'Theme', icon: '🎨' },
  { id: 'publish', label: 'Publish', icon: '🚀' },
] as const;

type TabId = (typeof TABS)[number]['id'];

// Style constants
const inputCls = 'w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors';
const inputStyle = { background: 'rgba(212, 168, 83, 0.06)', border: '1px solid rgba(212, 168, 83, 0.2)', color: '#F5E6D0' };
const cardStyle = { background: 'rgba(212, 168, 83, 0.03)', border: '1px solid rgba(212, 168, 83, 0.1)' };
const labelCls = 'text-xs tracking-wider uppercase mb-1.5 block';
const labelStyle = { color: '#A89A8C' };
const goldGrad = { background: 'linear-gradient(to bottom, #E8D5A3, #D4A853)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' } as React.CSSProperties;

export default function ExperienceEditor() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { creator, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>('basics');
  const [experience, setExperience] = useState<Experience | null>(null);
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const saveTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!creator) {
      router.replace('/login');
      return;
    }
    async function load() {
      const [exp, stgs] = await Promise.all([
        getExperienceById(id),
        getAllStagesForExperience(id),
      ]);
      // Verify creator owns this experience
      if (exp && exp.creator_id !== creator!.id) {
        setUnauthorized(true);
        setLoading(false);
        return;
      }
      setExperience(exp);
      setStages(stgs);
      setLoading(false);
    }
    load();
  }, [id, authLoading, creator, router]);

  const autoSave = useCallback(async (updates: Record<string, any>) => {
    if (!experience) return;
    setSaveStatus('saving');
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        const updated = await updateExperience(experience.id, updates);
        setExperience(updated);
        setSaveStatus('saved');
      } catch {
        setSaveStatus('error');
      }
    }, 800);
  }, [experience]);

  const updateField = useCallback((field: string, value: any) => {
    if (!experience) return;
    setExperience({ ...experience, [field]: value } as Experience);
    autoSave({ [field]: value });
  }, [experience, autoSave]);

  const saveStageConfig = useCallback(async (stageId: string, config: any) => {
    setSaveStatus('saving');
    try {
      const updated = await updateStage(stageId, { config });
      setStages((prev) => prev.map((s) => (s.id === stageId ? { ...s, config: updated.config } : s)));
      setSaveStatus('saved');
    } catch {
      setSaveStatus('error');
    }
  }, []);

  if (unauthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-light mb-3" style={{ color: '#F5E6D0' }}>Access Denied</h2>
          <p className="text-sm mb-6" style={{ color: '#A89A8C' }}>You don&apos;t have permission to edit this experience.</p>
          <Link href="/create" className="px-6 py-3 rounded-xl text-sm font-semibold tracking-wider uppercase" style={{ background: 'linear-gradient(135deg, #8B1C1C, #6B1515)', border: '1px solid rgba(212, 168, 83, 0.4)', color: '#E8D5A3' }}>
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (loading || !experience) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-royal-gold/30 border-t-royal-gold rounded-full animate-spin" />
      </div>
    );
  }

  const statusText = saveStatus === 'saving' ? 'Saving...' : saveStatus === 'error' ? 'Save failed' : 'All changes saved';

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 pointer-events-none z-0" style={{ backgroundImage: 'radial-gradient(ellipse at 20% 50%, rgba(139,28,28,0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(212,168,83,0.08) 0%, transparent 40%)' }} />

      <div className="relative z-10">
        {/* Top bar */}
        <div className="sticky top-0 z-20 px-6 py-4 flex items-center justify-between" style={{ background: 'rgba(26, 10, 10, 0.9)', borderBottom: '1px solid rgba(212, 168, 83, 0.1)', backdropFilter: 'blur(12px)' }}>
          <div className="flex items-center gap-4">
            <Link href="/create" className="text-sm hover:opacity-80" style={{ color: '#A89A8C' }}>&larr; Back</Link>
            <h1 className="text-lg font-light hidden sm:block" style={{ color: '#F5E6D0' }}>{experience.title}</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs" style={{ color: saveStatus === 'error' ? '#F44336' : '#A89A8C' }}>{statusText}</span>
            {experience.is_published && experience.slug && (
              <Link href={`/e/${experience.slug}`} target="_blank" className="px-4 py-2 rounded-lg text-xs font-semibold tracking-wider uppercase hover:scale-105 transition-all" style={{ background: 'rgba(212,168,83,0.1)', border: '1px solid rgba(212,168,83,0.3)', color: '#D4A853' }}>
                Preview
              </Link>
            )}
          </div>
        </div>

        <div className="flex">
          {/* Sidebar tabs (desktop) */}
          <nav className="hidden md:flex flex-col w-56 min-h-[calc(100vh-65px)] sticky top-[65px] py-4 px-3 gap-1" style={{ borderRight: '1px solid rgba(212, 168, 83, 0.08)' }}>
            {TABS.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm transition-all" style={{ background: activeTab === tab.id ? 'rgba(212,168,83,0.1)' : 'transparent', color: activeTab === tab.id ? '#D4A853' : '#A89A8C', borderLeft: activeTab === tab.id ? '2px solid #D4A853' : '2px solid transparent' }}>
                <span>{tab.icon}</span><span className="tracking-wide">{tab.label}</span>
              </button>
            ))}
          </nav>

          {/* Mobile tabs */}
          <nav className="md:hidden fixed bottom-0 left-0 right-0 z-20 flex justify-around py-2 px-1" style={{ background: 'rgba(26,10,10,0.95)', borderTop: '1px solid rgba(212,168,83,0.1)', backdropFilter: 'blur(12px)' }}>
            {TABS.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className="flex flex-col items-center gap-1 py-1 px-2" style={{ color: activeTab === tab.id ? '#D4A853' : '#A89A8C' }}>
                <span className="text-lg">{tab.icon}</span><span className="text-[10px] tracking-wider">{tab.label}</span>
              </button>
            ))}
          </nav>

          {/* Content */}
          <main className="flex-1 p-6 md:p-10 pb-24 md:pb-10">
            <div className="max-w-2xl">
              {activeTab === 'basics' && <BasicsTab experience={experience} updateField={updateField} />}
              {activeTab === 'stages' && <StagesTab stages={stages} setStages={setStages} experienceId={experience.id} saveStageConfig={saveStageConfig} />}
              {activeTab === 'content' && <ContentTab stages={stages} saveStageConfig={saveStageConfig} experience={experience} />}
              {activeTab === 'gift' && <GiftTab experience={experience} updateField={updateField} />}
              {activeTab === 'theme' && <ThemeTab experience={experience} updateField={updateField} />}
              {activeTab === 'publish' && <PublishTab experience={experience} updateField={updateField} />}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// TAB: BASICS
// ═══════════════════════════════════════════════
function BasicsTab({ experience, updateField }: { experience: Experience; updateField: (f: string, v: any) => void }) {
  return (
    <div>
      <h2 className="text-2xl font-light mb-6" style={goldGrad}>Basic Details</h2>
      <div className="space-y-5">
        <Field label="Title" value={experience.title} onChange={(v) => updateField('title', v)} />
        <Field label="Subtitle" value={experience.subtitle ?? ''} onChange={(v) => updateField('subtitle', v || null)} placeholder="Optional tagline" />

        <div className="grid grid-cols-2 gap-3">
          <Field label="Person A Name" value={experience.person_a_name} onChange={(v) => updateField('person_a_name', v)} />
          <Field label="Person B Name" value={experience.person_b_name} onChange={(v) => updateField('person_b_name', v)} />
        </div>

        <div>
          <label className={labelCls} style={labelStyle}>Occasion</label>
          <div className="grid grid-cols-3 gap-2">
            {(['wedding', 'anniversary', 'birthday', 'friendship', 'family', 'custom'] as Occasion[]).map((occ) => (
              <button key={occ} onClick={() => updateField('occasion', occ)} className="px-3 py-2 rounded-xl text-xs text-center capitalize transition-all" style={{ background: experience.occasion === occ ? 'rgba(212,168,83,0.15)' : 'rgba(212,168,83,0.04)', border: experience.occasion === occ ? '1px solid rgba(212,168,83,0.5)' : '1px solid rgba(212,168,83,0.1)', color: experience.occasion === occ ? '#D4A853' : '#A89A8C' }}>
                {occ}
              </button>
            ))}
          </div>
        </div>

        <Field label="Slug (URL)" value={experience.slug} onChange={(v) => updateField('slug', v.toLowerCase().replace(/[^a-z0-9-]/g, ''))} prefix="/e/" />

        <div>
          <label className={labelCls} style={labelStyle}>Access Mode</label>
          <div className="grid grid-cols-3 gap-2">
            {([
              { id: 'phone', label: '📱 Phone', desc: 'Phone verification' },
              { id: 'name_select', label: '👤 Name', desc: 'Pick your name' },
              { id: 'open', label: '🔓 Open', desc: 'No gate' },
            ] as const).map((mode) => (
              <button key={mode.id} onClick={() => updateField('access_mode', mode.id)} className="px-3 py-3 rounded-xl text-center transition-all" style={{ background: experience.access_mode === mode.id ? 'rgba(212,168,83,0.15)' : 'rgba(212,168,83,0.04)', border: experience.access_mode === mode.id ? '1px solid rgba(212,168,83,0.5)' : '1px solid rgba(212,168,83,0.1)', color: experience.access_mode === mode.id ? '#D4A853' : '#A89A8C' }}>
                <div className="text-sm mb-0.5">{mode.label}</div>
                <div className="text-[10px] opacity-60">{mode.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {experience.access_mode === 'phone' && (
          <PhoneMappingEditor phones={experience.access_phones ?? []} onChange={(phones) => updateField('access_phones', phones)} />
        )}
      </div>
    </div>
  );
}

function PhoneMappingEditor({ phones, onChange }: { phones: PhoneMapping[]; onChange: (p: PhoneMapping[]) => void }) {
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState<'a' | 'b'>('a');

  return (
    <div>
      <label className={labelCls} style={labelStyle}>Phone Mappings</label>
      <div className="space-y-2 mb-3">
        {phones.map((p, i) => (
          <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl" style={cardStyle}>
            <span className="text-sm flex-1" style={{ color: '#F5E6D0' }}>+91 {p.phone}</span>
            <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(212,168,83,0.1)', color: '#D4A853' }}>
              Person {p.maps_to.toUpperCase()}
            </span>
            <button onClick={() => onChange(phones.filter((_, j) => j !== i))} className="text-xs" style={{ color: '#F44336' }}>✕</button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input value={newPhone} onChange={(e) => setNewPhone(e.target.value.replace(/\D/g, ''))} placeholder="Phone number" className="flex-1 px-3 py-2 rounded-xl text-sm outline-none" style={inputStyle} />
        <select value={newRole} onChange={(e) => setNewRole(e.target.value as 'a' | 'b')} className="px-3 py-2 rounded-xl text-sm outline-none" style={{ ...inputStyle, cursor: 'pointer' }}>
          <option value="a">Person A</option>
          <option value="b">Person B</option>
        </select>
        <button onClick={() => { if (newPhone.length >= 10) { onChange([...phones, { phone: newPhone, maps_to: newRole }]); setNewPhone(''); } }} className="px-4 py-2 rounded-xl text-xs font-semibold" style={{ background: 'rgba(212,168,83,0.1)', border: '1px solid rgba(212,168,83,0.3)', color: '#D4A853' }}>
          Add
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// TAB: STAGES
// ═══════════════════════════════════════════════
function StagesTab({ stages, setStages, experienceId, saveStageConfig }: { stages: Stage[]; setStages: React.Dispatch<React.SetStateAction<Stage[]>>; experienceId: string; saveStageConfig: (id: string, c: any) => Promise<void> }) {
  const [adding, setAdding] = useState(false);

  const moveStage = async (index: number, direction: -1 | 1) => {
    const newIdx = index + direction;
    if (newIdx < 0 || newIdx >= stages.length) return;
    const newStages = [...stages];
    [newStages[index], newStages[newIdx]] = [newStages[newIdx], newStages[index]];
    const reordered = newStages.map((s, i) => ({ ...s, sort_order: i }));
    setStages(reordered);
    await reorderStages(reordered.map((s) => ({ id: s.id, sort_order: s.sort_order })));
  };

  const toggleStage = async (stageId: string, enabled: boolean) => {
    await updateStage(stageId, { is_enabled: enabled });
    setStages((prev) => prev.map((s) => (s.id === stageId ? { ...s, is_enabled: enabled } : s)));
  };

  const handleDelete = async (stageId: string) => {
    if (!confirm('Remove this stage?')) return;
    await deleteStage(stageId);
    setStages((prev) => prev.filter((s) => s.id !== stageId));
  };

  const handleAdd = async (type: StageType) => {
    const entry = STAGE_REGISTRY.find((r) => r.type === type);
    const newStage = await createStage(experienceId, type, stages.length, entry?.defaultConfig ?? {});
    setStages((prev) => [...prev, newStage]);
    setAdding(false);
  };

  const existingTypes = new Set(stages.map((s) => s.stage_type));

  return (
    <div>
      <h2 className="text-2xl font-light mb-2" style={goldGrad}>Stage Builder</h2>
      <p className="text-sm mb-6" style={labelStyle}>Arrange the stages of your experience. Move up/down to reorder.</p>

      <div className="space-y-2 mb-6">
        {stages.map((stage, i) => {
          const entry = STAGE_REGISTRY.find((r) => r.type === stage.stage_type);
          return (
            <div key={stage.id} className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all" style={{ ...cardStyle, opacity: stage.is_enabled ? 1 : 0.5 }}>
              <span className="text-lg">{entry?.icon ?? '❓'}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium" style={{ color: '#F5E6D0' }}>{entry?.label ?? stage.stage_type}</div>
                <div className="text-[10px]" style={{ color: '#A89A8C' }}>{entry?.description}</div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => moveStage(i, -1)} disabled={i === 0} className="w-7 h-7 rounded flex items-center justify-center text-xs disabled:opacity-20" style={{ color: '#D4A853' }}>▲</button>
                <button onClick={() => moveStage(i, 1)} disabled={i === stages.length - 1} className="w-7 h-7 rounded flex items-center justify-center text-xs disabled:opacity-20" style={{ color: '#D4A853' }}>▼</button>
                <button onClick={() => toggleStage(stage.id, !stage.is_enabled)} className="px-2 py-1 rounded text-[10px] tracking-wider" style={{ background: stage.is_enabled ? 'rgba(76,175,80,0.15)' : 'rgba(168,154,140,0.1)', color: stage.is_enabled ? '#4CAF50' : '#A89A8C' }}>
                  {stage.is_enabled ? 'ON' : 'OFF'}
                </button>
                <button onClick={() => handleDelete(stage.id)} className="w-7 h-7 rounded flex items-center justify-center text-xs" style={{ color: '#F44336' }}>✕</button>
              </div>
            </div>
          );
        })}
      </div>

      {!adding ? (
        <button onClick={() => setAdding(true)} className="w-full py-3 rounded-xl text-sm tracking-wider transition-all" style={{ background: 'rgba(212,168,83,0.04)', border: '2px dashed rgba(212,168,83,0.15)', color: '#A89A8C' }}>
          + Add Stage
        </button>
      ) : (
        <div className="rounded-xl p-4" style={cardStyle}>
          <p className="text-xs mb-3" style={labelStyle}>Choose a stage to add:</p>
          <div className="grid grid-cols-2 gap-2">
            {STAGE_REGISTRY.filter((r) => !existingTypes.has(r.type)).map((entry) => (
              <button key={entry.type} onClick={() => handleAdd(entry.type)} className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all hover:scale-[1.02]" style={{ background: 'rgba(212,168,83,0.06)', border: '1px solid rgba(212,168,83,0.15)', color: '#F5E6D0' }}>
                <span>{entry.icon}</span>
                <div>
                  <div className="text-xs font-medium">{entry.label}</div>
                  <div className="text-[9px]" style={{ color: '#A89A8C' }}>{entry.description}</div>
                </div>
              </button>
            ))}
          </div>
          <button onClick={() => setAdding(false)} className="mt-3 text-xs" style={{ color: '#A89A8C' }}>Cancel</button>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════
// TAB: CONTENT
// ═══════════════════════════════════════════════
function ContentTab({ stages, saveStageConfig, experience }: { stages: Stage[]; saveStageConfig: (id: string, c: any) => Promise<void>; experience: Experience }) {
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
  const contentStages = stages.filter((s) => ['hinge_intro', 'photo_journey', 'swipe_game', 'quiz', 'waiting_room', 'fortune_teller', 'phone_gate'].includes(s.stage_type));

  return (
    <div>
      <h2 className="text-2xl font-light mb-2" style={goldGrad}>Content Editor</h2>
      <p className="text-sm mb-6" style={labelStyle}>Click a stage to edit its content.</p>

      {!selectedStage ? (
        <div className="space-y-2">
          {contentStages.map((stage) => {
            const entry = STAGE_REGISTRY.find((r) => r.type === stage.stage_type);
            return (
              <button key={stage.id} onClick={() => setSelectedStage(stage)} className="w-full flex items-center gap-3 px-4 py-4 rounded-xl text-left transition-all hover:scale-[1.01]" style={cardStyle}>
                <span className="text-xl">{entry?.icon}</span>
                <div>
                  <div className="text-sm" style={{ color: '#F5E6D0' }}>{entry?.label}</div>
                  <div className="text-[10px]" style={{ color: '#A89A8C' }}>{getContentSummary(stage)}</div>
                </div>
                <span className="ml-auto text-xs" style={{ color: '#A89A8C' }}>→</span>
              </button>
            );
          })}
        </div>
      ) : (
        <div>
          <button onClick={() => setSelectedStage(null)} className="text-xs mb-4 block" style={{ color: '#A89A8C' }}>&larr; Back to stages</button>
          <StageContentEditor stage={selectedStage} onSave={(config) => { saveStageConfig(selectedStage.id, config); setSelectedStage({ ...selectedStage, config }); }} experience={experience} />
        </div>
      )}
    </div>
  );
}

function getContentSummary(stage: Stage): string {
  const c = stage.config as any;
  switch (stage.stage_type) {
    case 'quiz': return `${c.questions?.length ?? 0} questions`;
    case 'swipe_game': return `${c.scenarios?.length ?? 0} scenarios`;
    case 'photo_journey': return `${c.chapters?.length ?? 0} chapters`;
    case 'hinge_intro': return `${c.cards?.length ?? 0} intro cards`;
    case 'fortune_teller': return `${c.fortunes?.length ?? 0} fortunes`;
    case 'waiting_room': return c.message ? 'Custom message' : 'Default message';
    case 'phone_gate': return c.welcome_text ? 'Custom welcome' : 'Default welcome';
    default: return 'Click to edit';
  }
}

function StageContentEditor({ stage, onSave, experience }: { stage: Stage; onSave: (config: any) => void; experience: Experience }) {
  const [config, setConfig] = useState<any>(stage.config);
  const save = (c: any) => { setConfig(c); onSave(c); };

  switch (stage.stage_type) {
    case 'quiz': return <QuizEditor config={config} onSave={save} />;
    case 'swipe_game': return <SwipeEditor config={config} onSave={save} />;
    case 'photo_journey': return <PhotoJourneyEditor config={config} onSave={save} />;
    case 'hinge_intro': return <HingeEditor config={config} onSave={save} />;
    case 'fortune_teller': return <FortuneEditor config={config} onSave={save} />;
    case 'waiting_room': return <SimpleTextEditor config={config} onSave={save} field="message" label="Custom waiting message" />;
    case 'phone_gate': return <SimpleTextEditor config={config} onSave={save} field="welcome_text" label="Welcome text" />;
    default: return <p className="text-sm" style={{ color: '#A89A8C' }}>No editor available for this stage type.</p>;
  }
}

// --- Quiz Editor ---
function QuizEditor({ config, onSave }: { config: any; onSave: (c: any) => void }) {
  const questions = config.questions ?? [];
  const addQ = () => onSave({ ...config, questions: [...questions, { id: `q-${Date.now()}`, question: '', options: ['', '', ''], category: '💕 General' }] });
  const removeQ = (i: number) => onSave({ ...config, questions: questions.filter((_: any, j: number) => j !== i) });
  const updateQ = (i: number, field: string, value: any) => {
    const updated = [...questions];
    updated[i] = { ...updated[i], [field]: value };
    onSave({ ...config, questions: updated });
  };
  const updateOpt = (qi: number, oi: number, value: string) => {
    const updated = [...questions];
    const opts = [...updated[qi].options];
    opts[oi] = value;
    updated[qi] = { ...updated[qi], options: opts };
    onSave({ ...config, questions: updated });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg" style={{ color: '#F5E6D0' }}>Quiz Questions ({questions.length})</h3>
        <button onClick={addQ} className="px-3 py-1.5 rounded-lg text-xs" style={{ background: 'rgba(212,168,83,0.1)', border: '1px solid rgba(212,168,83,0.3)', color: '#D4A853' }}>+ Add Question</button>
      </div>
      <div className="space-y-4">
        {questions.map((q: any, i: number) => (
          <div key={q.id || i} className="rounded-xl p-4" style={cardStyle}>
            <div className="flex items-start justify-between gap-2 mb-2">
              <input value={q.category} onChange={(e) => updateQ(i, 'category', e.target.value)} className="px-2 py-1 rounded text-[10px] outline-none w-32" style={inputStyle} placeholder="Category" />
              <button onClick={() => removeQ(i)} className="text-xs flex-shrink-0" style={{ color: '#F44336' }}>Remove</button>
            </div>
            <input value={q.question} onChange={(e) => updateQ(i, 'question', e.target.value)} className={`${inputCls} mb-2`} style={inputStyle} placeholder="Question text..." />
            <div className="space-y-1.5">
              {(q.options ?? []).map((opt: string, oi: number) => (
                <div key={oi} className="flex items-center gap-2">
                  <span className="text-[10px] w-4 text-center" style={{ color: '#A89A8C' }}>{String.fromCharCode(65 + oi)}</span>
                  <input value={opt} onChange={(e) => updateOpt(i, oi, e.target.value)} className="flex-1 px-3 py-2 rounded-lg text-xs outline-none" style={inputStyle} placeholder={`Option ${oi + 1}`} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Swipe Editor ---
function SwipeEditor({ config, onSave }: { config: any; onSave: (c: any) => void }) {
  const scenarios = config.scenarios ?? [];
  const add = () => onSave({ ...config, scenarios: [...scenarios, { text: '', emoji: '🤔' }] });
  const remove = (i: number) => onSave({ ...config, scenarios: scenarios.filter((_: any, j: number) => j !== i) });
  const update = (i: number, field: string, value: string) => {
    const updated = [...scenarios];
    updated[i] = { ...updated[i], [field]: value };
    onSave({ ...config, scenarios: updated });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg" style={{ color: '#F5E6D0' }}>Swipe Scenarios ({scenarios.length})</h3>
        <button onClick={add} className="px-3 py-1.5 rounded-lg text-xs" style={{ background: 'rgba(212,168,83,0.1)', border: '1px solid rgba(212,168,83,0.3)', color: '#D4A853' }}>+ Add</button>
      </div>
      <div className="space-y-2">
        {scenarios.map((s: any, i: number) => (
          <div key={i} className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={cardStyle}>
            <input value={s.emoji} onChange={(e) => update(i, 'emoji', e.target.value)} className="w-10 text-center text-lg bg-transparent outline-none" />
            <input value={s.text} onChange={(e) => update(i, 'text', e.target.value)} className="flex-1 px-2 py-1 rounded text-sm outline-none bg-transparent" style={{ color: '#F5E6D0' }} placeholder="Who's more likely to..." />
            <button onClick={() => remove(i)} className="text-xs" style={{ color: '#F44336' }}>✕</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Photo Journey Editor ---
function PhotoJourneyEditor({ config, onSave }: { config: any; onSave: (c: any) => void }) {
  const chapters = config.chapters ?? [];
  const addChapter = () => onSave({ ...config, chapters: [...chapters, { title: '', subtitle: '', emoji: '📸', photos: [] }] });
  const removeChapter = (i: number) => onSave({ ...config, chapters: chapters.filter((_: any, j: number) => j !== i) });
  const updateChapter = (i: number, field: string, value: any) => {
    const updated = [...chapters];
    updated[i] = { ...updated[i], [field]: value };
    onSave({ ...config, chapters: updated });
  };
  const addPhoto = (ci: number) => {
    const updated = [...chapters];
    updated[ci] = { ...updated[ci], photos: [...(updated[ci].photos ?? []), { url: '', caption: '' }] };
    onSave({ ...config, chapters: updated });
  };
  const updatePhoto = (ci: number, pi: number, field: string, value: string) => {
    const updated = [...chapters];
    const photos = [...updated[ci].photos];
    photos[pi] = { ...photos[pi], [field]: value };
    updated[ci] = { ...updated[ci], photos };
    onSave({ ...config, chapters: updated });
  };
  const removePhoto = (ci: number, pi: number) => {
    const updated = [...chapters];
    updated[ci] = { ...updated[ci], photos: updated[ci].photos.filter((_: any, j: number) => j !== pi) };
    onSave({ ...config, chapters: updated });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg" style={{ color: '#F5E6D0' }}>Photo Chapters ({chapters.length})</h3>
        <button onClick={addChapter} className="px-3 py-1.5 rounded-lg text-xs" style={{ background: 'rgba(212,168,83,0.1)', border: '1px solid rgba(212,168,83,0.3)', color: '#D4A853' }}>+ Add Chapter</button>
      </div>
      <div className="space-y-4">
        {chapters.map((ch: any, ci: number) => (
          <div key={ci} className="rounded-xl p-4" style={cardStyle}>
            <div className="flex items-center gap-2 mb-3">
              <input value={ch.emoji} onChange={(e) => updateChapter(ci, 'emoji', e.target.value)} className="w-10 text-center text-lg bg-transparent outline-none" />
              <input value={ch.title} onChange={(e) => updateChapter(ci, 'title', e.target.value)} className="flex-1 px-2 py-1 rounded text-sm outline-none bg-transparent" style={{ color: '#F5E6D0' }} placeholder="Chapter title" />
              <button onClick={() => removeChapter(ci)} className="text-xs" style={{ color: '#F44336' }}>Remove</button>
            </div>
            <input value={ch.subtitle} onChange={(e) => updateChapter(ci, 'subtitle', e.target.value)} className={`${inputCls} mb-3`} style={inputStyle} placeholder="Subtitle" />
            <div className="space-y-2 ml-4">
              {(ch.photos ?? []).map((photo: any, pi: number) => (
                <div key={pi} className="flex gap-2">
                  <input value={photo.url} onChange={(e) => updatePhoto(ci, pi, 'url', e.target.value)} className="flex-1 px-2 py-1.5 rounded text-xs outline-none" style={inputStyle} placeholder="Photo URL" />
                  <input value={photo.caption} onChange={(e) => updatePhoto(ci, pi, 'caption', e.target.value)} className="flex-1 px-2 py-1.5 rounded text-xs outline-none" style={inputStyle} placeholder="Caption" />
                  <button onClick={() => removePhoto(ci, pi)} className="text-xs" style={{ color: '#F44336' }}>✕</button>
                </div>
              ))}
              <button onClick={() => addPhoto(ci)} className="text-xs" style={{ color: '#D4A853' }}>+ Add Photo</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Hinge Intro Editor ---
function HingeEditor({ config, onSave }: { config: any; onSave: (c: any) => void }) {
  const cards = config.cards ?? [];
  const add = () => onSave({ ...config, cards: [...cards, { text: '', emoji: '💕', subtext: '' }] });
  const remove = (i: number) => onSave({ ...config, cards: cards.filter((_: any, j: number) => j !== i) });
  const update = (i: number, field: string, value: string) => {
    const updated = [...cards];
    updated[i] = { ...updated[i], [field]: value };
    onSave({ ...config, cards: updated });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg" style={{ color: '#F5E6D0' }}>Intro Cards ({cards.length})</h3>
        <button onClick={add} className="px-3 py-1.5 rounded-lg text-xs" style={{ background: 'rgba(212,168,83,0.1)', border: '1px solid rgba(212,168,83,0.3)', color: '#D4A853' }}>+ Add Card</button>
      </div>
      <div className="space-y-2">
        {cards.map((c: any, i: number) => (
          <div key={i} className="rounded-xl p-3" style={cardStyle}>
            <div className="flex gap-2 mb-2">
              <input value={c.emoji ?? ''} onChange={(e) => update(i, 'emoji', e.target.value)} className="w-10 text-center text-lg bg-transparent outline-none" placeholder="😊" />
              <input value={c.text} onChange={(e) => update(i, 'text', e.target.value)} className="flex-1 px-2 py-1 rounded text-sm outline-none bg-transparent" style={{ color: '#F5E6D0' }} placeholder="Card text" />
              <button onClick={() => remove(i)} className="text-xs" style={{ color: '#F44336' }}>✕</button>
            </div>
            <input value={c.subtext ?? ''} onChange={(e) => update(i, 'subtext', e.target.value)} className="w-full px-2 py-1 rounded text-xs outline-none bg-transparent" style={{ color: '#A89A8C' }} placeholder="Subtext (optional)" />
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Fortune Editor ---
function FortuneEditor({ config, onSave }: { config: any; onSave: (c: any) => void }) {
  const fortunes: string[] = config.fortunes ?? [];
  const add = () => onSave({ ...config, fortunes: [...fortunes, ''] });
  const remove = (i: number) => onSave({ ...config, fortunes: fortunes.filter((_: any, j: number) => j !== i) });
  const update = (i: number, value: string) => {
    const updated = [...fortunes];
    updated[i] = value;
    onSave({ ...config, fortunes: updated });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg" style={{ color: '#F5E6D0' }}>Fortune Predictions ({fortunes.length})</h3>
        <button onClick={add} className="px-3 py-1.5 rounded-lg text-xs" style={{ background: 'rgba(212,168,83,0.1)', border: '1px solid rgba(212,168,83,0.3)', color: '#D4A853' }}>+ Add</button>
      </div>
      <div className="space-y-2">
        {fortunes.map((f: string, i: number) => (
          <div key={i} className="flex gap-2">
            <textarea value={f} onChange={(e) => update(i, e.target.value)} rows={2} className="flex-1 px-3 py-2 rounded-xl text-sm outline-none resize-none" style={inputStyle} placeholder="Fortune text..." />
            <button onClick={() => remove(i)} className="text-xs self-start mt-2" style={{ color: '#F44336' }}>✕</button>
          </div>
        ))}
      </div>
      {fortunes.length === 0 && <p className="text-xs mt-2" style={{ color: '#A89A8C' }}>No fortunes added. Default predictions will be used.</p>}
    </div>
  );
}

// --- Simple text editor (waiting room message, phone gate welcome) ---
function SimpleTextEditor({ config, onSave, field, label }: { config: any; onSave: (c: any) => void; field: string; label: string }) {
  return (
    <div>
      <h3 className="text-lg mb-4" style={{ color: '#F5E6D0' }}>{label}</h3>
      <textarea value={config[field] ?? ''} onChange={(e) => onSave({ ...config, [field]: e.target.value || undefined })} rows={3} className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none" style={inputStyle} placeholder="Leave empty for default..." />
    </div>
  );
}

// ═══════════════════════════════════════════════
// TAB: GIFT
// ═══════════════════════════════════════════════
function GiftTab({ experience, updateField }: { experience: Experience; updateField: (f: string, v: any) => void }) {
  const gc = experience.gift_config ?? {};
  const giftType = (gc.gift_type ?? 'message') as GiftType;
  const updateGift = (field: string, value: any) => updateField('gift_config', { ...gc, [field]: value });

  return (
    <div>
      <h2 className="text-2xl font-light mb-6" style={goldGrad}>Gift Configuration</h2>

      <div>
        <label className={labelCls} style={labelStyle}>Gift Type</label>
        <div className="grid grid-cols-4 gap-2 mb-6">
          {([
            { id: 'voucher', label: '🎫 Voucher' },
            { id: 'message', label: '💌 Message' },
            { id: 'image', label: '🖼️ Image' },
            { id: 'link', label: '🔗 Link' },
          ] as const).map((t) => (
            <button key={t.id} onClick={() => updateGift('gift_type', t.id)} className="px-3 py-3 rounded-xl text-xs text-center transition-all" style={{ background: giftType === t.id ? 'rgba(212,168,83,0.15)' : 'rgba(212,168,83,0.04)', border: giftType === t.id ? '1px solid rgba(212,168,83,0.5)' : '1px solid rgba(212,168,83,0.1)', color: giftType === t.id ? '#D4A853' : '#A89A8C' }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {giftType === 'voucher' && (
          <>
            <Field label="Brand" value={gc.voucher_brand ?? ''} onChange={(v) => updateGift('voucher_brand', v)} placeholder="e.g. MakeMyTrip" />
            <Field label="Amount" value={gc.voucher_amount ?? ''} onChange={(v) => updateGift('voucher_amount', v)} placeholder="e.g. ₹ 10,001" />
            <Field label="Voucher Code" value={gc.voucher_code ?? ''} onChange={(v) => updateGift('voucher_code', v)} placeholder="e.g. 1001-1301-1205-8190" />
            <Field label="Subtitle" value={gc.voucher_subtitle ?? ''} onChange={(v) => updateGift('voucher_subtitle', v)} placeholder="e.g. Gift Voucher" />
          </>
        )}
        {giftType === 'message' && (
          <>
            <div>
              <label className={labelCls} style={labelStyle}>Message</label>
              <textarea value={gc.message_text ?? ''} onChange={(e) => updateGift('message_text', e.target.value)} rows={4} className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none" style={inputStyle} placeholder="Your heartfelt message..." />
            </div>
            <Field label="From" value={gc.message_from ?? ''} onChange={(v) => updateGift('message_from', v)} placeholder="e.g. With love, from the boys ❤️" />
          </>
        )}
        {giftType === 'image' && (
          <Field label="Image URL" value={gc.image_url ?? ''} onChange={(v) => updateGift('image_url', v)} placeholder="https://..." />
        )}
        {giftType === 'link' && (
          <>
            <Field label="Link URL" value={gc.link_url ?? ''} onChange={(v) => updateGift('link_url', v)} placeholder="https://..." />
            <Field label="Button Label" value={gc.link_label ?? ''} onChange={(v) => updateGift('link_label', v)} placeholder="e.g. Open Your Gift" />
          </>
        )}
        <Field label="Reveal Heading" value={gc.reveal_text ?? ''} onChange={(v) => updateGift('reveal_text', v)} placeholder="e.g. A Gift For The Couple" />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// TAB: THEME
// ═══════════════════════════════════════════════
function ThemeTab({ experience, updateField }: { experience: Experience; updateField: (f: string, v: any) => void }) {
  const theme = experience.theme;
  const updateTheme = (field: string, value: string) => updateField('theme', { ...theme, [field]: value });

  const fields: { key: keyof ExperienceTheme; label: string }[] = [
    { key: 'primaryBg', label: 'Background' },
    { key: 'accentColor', label: 'Accent' },
    { key: 'goldColor', label: 'Gold' },
    { key: 'goldColorLight', label: 'Gold Light' },
    { key: 'goldColorDark', label: 'Gold Dark' },
    { key: 'creamColor', label: 'Cream / Text' },
    { key: 'mutedColor', label: 'Muted' },
  ];

  return (
    <div>
      <h2 className="text-2xl font-light mb-6" style={goldGrad}>Theme & Design</h2>

      <label className={labelCls} style={labelStyle}>Presets</label>
      <div className="grid grid-cols-2 gap-3 mb-8">
        {Object.entries(THEME_PRESETS).map(([key, preset]) => (
          <button
            key={key}
            onClick={() => updateField('theme', { primaryBg: preset.primaryBg, accentColor: preset.accentColor, goldColor: preset.goldColor, goldColorLight: preset.goldColorLight, goldColorDark: preset.goldColorDark, creamColor: preset.creamColor, mutedColor: preset.mutedColor, fontFamily: preset.fontFamily })}
            className="rounded-xl p-4 text-left transition-all hover:scale-[1.02]"
            style={{ background: preset.primaryBg, border: `2px solid ${preset.goldColor}40` }}
          >
            <div className="text-xs font-semibold mb-1" style={{ color: preset.goldColor }}>{preset.name}</div>
            <div className="flex gap-1">
              {[preset.accentColor, preset.goldColor, preset.creamColor, preset.mutedColor].map((c, i) => (
                <div key={i} className="w-5 h-5 rounded-full" style={{ background: c, border: '1px solid rgba(255,255,255,0.1)' }} />
              ))}
            </div>
            <div className="text-[10px] mt-1" style={{ color: preset.mutedColor }}>{preset.fontFamily}</div>
          </button>
        ))}
      </div>

      <label className={labelCls} style={labelStyle}>Custom Colors</label>
      <div className="grid grid-cols-2 gap-3 mb-6">
        {fields.map(({ key, label }) => (
          <div key={key} className="flex items-center gap-2 px-3 py-2 rounded-xl" style={cardStyle}>
            <input type="color" value={theme[key]} onChange={(e) => updateTheme(key, e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent border-none" />
            <div>
              <div className="text-xs" style={{ color: '#F5E6D0' }}>{label}</div>
              <div className="text-[10px]" style={{ color: '#A89A8C' }}>{theme[key]}</div>
            </div>
          </div>
        ))}
      </div>

      <Field label="Font Family" value={theme.fontFamily} onChange={(v) => updateTheme('fontFamily', v)} placeholder="e.g. Cormorant Garamond" />
    </div>
  );
}

// ═══════════════════════════════════════════════
// TAB: PUBLISH
// ═══════════════════════════════════════════════
function PublishTab({ experience, updateField }: { experience: Experience; updateField: (f: string, v: any) => void }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== 'undefined' ? `${window.location.origin}/e/${experience.slug}` : `/e/${experience.slug}`;

  const togglePublish = () => {
    const now = experience.is_published ? false : true;
    updateField('is_published', now);
    if (now && !experience.published_at) {
      updateField('published_at', new Date().toISOString());
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <h2 className="text-2xl font-light mb-6" style={goldGrad}>Publish & Share</h2>

      {/* Publish toggle */}
      <div className="rounded-xl p-6 mb-6" style={cardStyle}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base" style={{ color: '#F5E6D0' }}>Status</h3>
            <p className="text-xs" style={{ color: '#A89A8C' }}>
              {experience.is_published ? 'Your experience is live and accessible.' : 'Your experience is in draft mode.'}
            </p>
          </div>
          <button onClick={togglePublish} className="px-6 py-2.5 rounded-xl text-sm font-semibold tracking-wider transition-all hover:scale-105" style={{ background: experience.is_published ? 'rgba(76,175,80,0.15)' : 'linear-gradient(135deg, #8B1C1C, #6B1515)', border: experience.is_published ? '1px solid rgba(76,175,80,0.4)' : '1px solid rgba(212,168,83,0.4)', color: experience.is_published ? '#4CAF50' : '#E8D5A3' }}>
            {experience.is_published ? '● Published' : 'Publish Now'}
          </button>
        </div>
      </div>

      {/* Share link */}
      <div className="rounded-xl p-6 mb-6" style={cardStyle}>
        <label className={labelCls} style={labelStyle}>Experience Link</label>
        <div className="flex gap-2 mb-3">
          <input value={url} readOnly className={`${inputCls} flex-1`} style={{ ...inputStyle, color: '#D4A853' }} />
          <button onClick={copyLink} className="px-4 py-2 rounded-xl text-xs font-semibold tracking-wider transition-all" style={{ background: 'rgba(212,168,83,0.1)', border: '1px solid rgba(212,168,83,0.3)', color: '#D4A853' }}>
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>

        <div className="flex gap-3">
          <Link href={`/e/${experience.slug}`} target="_blank" className="px-4 py-2 rounded-xl text-xs font-semibold tracking-wider transition-all hover:scale-105" style={{ background: 'rgba(212,168,83,0.1)', border: '1px solid rgba(212,168,83,0.3)', color: '#D4A853' }}>
            Open Preview →
          </Link>
        </div>
      </div>

      {/* QR Code placeholder */}
      <div className="rounded-xl p-6 text-center" style={cardStyle}>
        <div className="w-32 h-32 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ background: 'rgba(212,168,83,0.06)', border: '2px dashed rgba(212,168,83,0.15)' }}>
          <div>
            <div className="text-3xl mb-1">📱</div>
            <div className="text-[10px]" style={{ color: '#A89A8C' }}>QR Code</div>
          </div>
        </div>
        <p className="text-xs" style={{ color: '#A89A8C' }}>QR code generation coming soon</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// SHARED COMPONENTS
// ═══════════════════════════════════════════════
function Field({ label, value, onChange, placeholder, prefix }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; prefix?: string }) {
  return (
    <div>
      <label className={labelCls} style={labelStyle}>{label}</label>
      <div className="flex items-center">
        {prefix && <span className="text-xs mr-1" style={{ color: '#A89A8C' }}>{prefix}</span>}
        <input value={value} onChange={(e) => onChange(e.target.value)} className={inputCls} style={inputStyle} placeholder={placeholder} />
      </div>
    </div>
  );
}
