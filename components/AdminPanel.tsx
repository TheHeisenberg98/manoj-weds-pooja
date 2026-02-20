'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface AdminPanelProps {
  onClose: () => void;
  onReset: () => void;
}

export default function AdminPanel({ onClose, onReset }: AdminPanelProps) {
  const [status, setStatus] = useState('');
  const [confirming, setConfirming] = useState<string | null>(null);

  const resetPlayer = async (playerId: string) => {
    setStatus(`Resetting ${playerId}...`);
    const { error } = await supabase
      .from('players')
      .update({
        quiz_completed: false,
        quiz_answers: {},
        quiz_score: 0,
        completed_at: null,
      })
      .eq('id', playerId);

    if (error) {
      setStatus(`Error: ${error.message}`);
    } else {
      setStatus(`✅ ${playerId} reset successfully`);
      setConfirming(null);
    }
  };

  const resetBoth = async () => {
    setStatus('Resetting both players...');
    const { error } = await supabase
      .from('players')
      .update({
        quiz_completed: false,
        quiz_answers: {},
        quiz_score: 0,
        completed_at: null,
      })
      .in('id', ['manoj', 'pooja']);

    if (error) {
      setStatus(`Error: ${error.message}`);
    } else {
      setStatus('✅ Both players reset');
      setConfirming(null);
      setTimeout(() => onReset(), 1000);
    }
  };

  const deleteAllData = async () => {
    setStatus('Deleting all data...');

    // Delete visits
    await supabase.from('visits').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // Reset players
    const { error } = await supabase
      .from('players')
      .update({
        quiz_completed: false,
        quiz_answers: {},
        quiz_score: 0,
        completed_at: null,
      })
      .in('id', ['manoj', 'pooja']);

    if (error) {
      setStatus(`Error: ${error.message}`);
    } else {
      setStatus('✅ All data deleted & reset');
      setConfirming(null);
      setTimeout(() => onReset(), 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
      <div className="bg-[#1a1a1a] border border-royal-gold/30 rounded-2xl p-6 w-full max-w-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg text-royal-gold font-semibold">🔧 Admin Panel</h2>
          <button
            onClick={onClose}
            className="text-royal-muted hover:text-white text-xl"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3">
          {/* Reset Manoj */}
          <button
            onClick={() => confirming === 'manoj' ? resetPlayer('manoj') : setConfirming('manoj')}
            className={`w-full py-3 rounded-xl text-sm font-display font-semibold transition-all ${
              confirming === 'manoj'
                ? 'bg-yellow-600/30 border border-yellow-500 text-yellow-300'
                : 'bg-royal-gold/10 border border-royal-gold/20 text-royal-cream hover:bg-royal-gold/20'
            }`}
          >
            {confirming === 'manoj' ? 'Tap again to confirm reset Manoj' : "Reset Manoj's Quiz"}
          </button>

          {/* Reset Pooja */}
          <button
            onClick={() => confirming === 'pooja' ? resetPlayer('pooja') : setConfirming('pooja')}
            className={`w-full py-3 rounded-xl text-sm font-display font-semibold transition-all ${
              confirming === 'pooja'
                ? 'bg-yellow-600/30 border border-yellow-500 text-yellow-300'
                : 'bg-royal-gold/10 border border-royal-gold/20 text-royal-cream hover:bg-royal-gold/20'
            }`}
          >
            {confirming === 'pooja' ? 'Tap again to confirm reset Pooja' : "Reset Pooja's Quiz"}
          </button>

          {/* Reset Both */}
          <button
            onClick={() => confirming === 'both' ? resetBoth() : setConfirming('both')}
            className={`w-full py-3 rounded-xl text-sm font-display font-semibold transition-all ${
              confirming === 'both'
                ? 'bg-orange-600/30 border border-orange-500 text-orange-300'
                : 'bg-orange-500/10 border border-orange-500/20 text-orange-200 hover:bg-orange-500/20'
            }`}
          >
            {confirming === 'both' ? 'Tap again to confirm reset BOTH' : 'Reset Both Players'}
          </button>

          {/* Divider */}
          <div className="border-t border-royal-gold/10 my-2" />

          {/* Delete All */}
          <button
            onClick={() => confirming === 'delete' ? deleteAllData() : setConfirming('delete')}
            className={`w-full py-3 rounded-xl text-sm font-display font-semibold transition-all ${
              confirming === 'delete'
                ? 'bg-red-700/40 border border-red-500 text-red-300 animate-pulse'
                : 'bg-red-500/10 border border-red-500/20 text-red-300 hover:bg-red-500/20'
            }`}
          >
            {confirming === 'delete' ? '⚠️ TAP AGAIN TO DELETE ALL DATA' : '🗑️ Delete All Data & Reset'}
          </button>
        </div>

        {/* Status message */}
        {status && (
          <div className="mt-4 p-3 bg-royal-gold/5 border border-royal-gold/10 rounded-lg">
            <p className="text-xs text-royal-muted">{status}</p>
          </div>
        )}

        <p className="text-[10px] text-royal-muted/30 text-center mt-4">
          Hidden admin • Tap bottom-right corner 5x to open
        </p>
      </div>
    </div>
  );
}
