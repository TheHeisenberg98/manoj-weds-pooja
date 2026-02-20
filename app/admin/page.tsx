'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface PhotoRecord {
  id: string;
  chapter: string;
  caption: string;
  storage_path: string;
  photo_order: number;
  uploaded_by: string;
  created_at: string;
}

const CHAPTERS = [
  { id: 'childhood', label: '🌅 The Early Days' },
  { id: 'college', label: '🎓 College Chronicles' },
  { id: 'squad', label: '🏔️ The Squad' },
  { id: 'couple', label: '💕 Manoj & Pooja' },
];

export default function AdminPage() {
  const [photos, setPhotos] = useState<PhotoRecord[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState('childhood');
  const [caption, setCaption] = useState('');
  const [uploadedBy, setUploadedBy] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [message, setMessage] = useState('');

  // Simple password gate for admin
  const ADMIN_PASSWORD = 'manojwedpooja2025'; // Change this!

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
    } else {
      setMessage('Wrong password');
    }
  };

  const fetchPhotos = useCallback(async () => {
    const { data } = await supabase
      .from('photos')
      .select('*')
      .order('chapter')
      .order('photo_order');
    if (data) setPhotos(data);
  }, []);

  useEffect(() => {
    if (authenticated) fetchPhotos();
  }, [authenticated, fetchPhotos]);

  const getPublicUrl = (path: string) => {
    const { data } = supabase.storage.from('wedding-photos').getPublicUrl(path);
    return data.publicUrl;
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setMessage('');

    const currentPhotosInChapter = photos.filter((p) => p.chapter === selectedChapter).length;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;

      const ext = file.name.split('.').pop();
      const fileName = `${selectedChapter}/${Date.now()}-${i}.${ext}`;

      try {
        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('wedding-photos')
          .upload(fileName, file, { cacheControl: '3600', upsert: false });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          setMessage(`Error uploading ${file.name}: ${uploadError.message}`);
          continue;
        }

        // Save metadata
        await supabase.from('photos').insert({
          chapter: selectedChapter,
          caption: caption || '',
          storage_path: fileName,
          photo_order: currentPhotosInChapter + i,
          uploaded_by: uploadedBy || 'admin',
        });
      } catch (err) {
        console.error('Upload failed:', err);
      }
    }

    setUploading(false);
    setCaption('');
    setMessage(`✅ ${files.length} photo(s) uploaded!`);
    fetchPhotos();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleUpload(e.dataTransfer.files);
  };

  const deletePhoto = async (photo: PhotoRecord) => {
    // Delete from storage
    await supabase.storage.from('wedding-photos').remove([photo.storage_path]);
    // Delete from database
    await supabase.from('photos').delete().eq('id', photo.id);
    fetchPhotos();
    setMessage('Photo deleted');
  };

  const updateCaption = async (id: string, newCaption: string) => {
    await supabase.from('photos').update({ caption: newCaption }).eq('id', id);
    fetchPhotos();
  };

  const movePhoto = async (id: string, direction: 'up' | 'down') => {
    const photo = photos.find((p) => p.id === id);
    if (!photo) return;
    const chapterPhotos = photos.filter((p) => p.chapter === photo.chapter);
    const idx = chapterPhotos.findIndex((p) => p.id === id);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= chapterPhotos.length) return;

    const other = chapterPhotos[swapIdx];
    await supabase.from('photos').update({ photo_order: other.photo_order }).eq('id', photo.id);
    await supabase.from('photos').update({ photo_order: photo.photo_order }).eq('id', other.id);
    fetchPhotos();
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#1A0A0A] flex items-center justify-center p-6">
        <div className="bg-[#1a1a1a] border border-[#D4A853]/30 rounded-2xl p-8 w-full max-w-sm text-center">
          <div className="text-4xl mb-4">🔐</div>
          <h1 className="text-2xl text-[#D4A853] font-semibold mb-6" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Admin Access
          </h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            placeholder="Enter password"
            className="w-full p-3 bg-[#D4A853]/10 border border-[#D4A853]/25 rounded-xl text-[#F5E6D0] outline-none mb-4 text-center"
          />
          <button
            onClick={handleLogin}
            className="w-full py-3 bg-gradient-to-br from-[#8B1C1C] to-[#A52A2A] border border-[#D4A853]/40 rounded-xl text-[#F5D998] font-semibold"
          >
            Enter
          </button>
          {message && <p className="text-red-400 text-sm mt-3">{message}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-[#F5E6D0]" style={{ fontFamily: 'sans-serif' }}>
      {/* Header */}
      <div className="bg-[#1a1a1a] border-b border-[#D4A853]/20 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#D4A853]">📸 Photo Manager</h1>
            <p className="text-xs text-[#C4A882]">Manoj Weds Pooja</p>
          </div>
          <div className="text-sm text-[#C4A882]">
            {photos.length} photos uploaded
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Upload Section */}
        <div className="bg-[#1a1a1a] border border-[#D4A853]/15 rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-[#D4A853] mb-4">Upload Photos</h2>

          {/* Chapter select */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {CHAPTERS.map((ch) => (
              <button
                key={ch.id}
                onClick={() => setSelectedChapter(ch.id)}
                className={`p-3 rounded-xl text-sm font-medium transition-all ${
                  selectedChapter === ch.id
                    ? 'bg-[#D4A853]/20 border border-[#D4A853] text-[#D4A853]'
                    : 'bg-[#D4A853]/5 border border-[#D4A853]/15 text-[#C4A882] hover:bg-[#D4A853]/10'
                }`}
              >
                {ch.label}
                <span className="ml-2 text-xs opacity-60">
                  ({photos.filter((p) => p.chapter === ch.id).length})
                </span>
              </button>
            ))}
          </div>

          {/* Caption & uploaded by */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Caption (optional)"
              className="p-3 bg-[#D4A853]/5 border border-[#D4A853]/15 rounded-xl text-[#F5E6D0] text-sm outline-none placeholder:text-[#C4A882]/40"
            />
            <input
              type="text"
              value={uploadedBy}
              onChange={(e) => setUploadedBy(e.target.value)}
              placeholder="Your name (optional)"
              className="p-3 bg-[#D4A853]/5 border border-[#D4A853]/15 rounded-xl text-[#F5E6D0] text-sm outline-none placeholder:text-[#C4A882]/40"
            />
          </div>

          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer ${
              dragOver
                ? 'border-[#D4A853] bg-[#D4A853]/10'
                : 'border-[#D4A853]/20 hover:border-[#D4A853]/40'
            }`}
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <input
              id="file-input"
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleUpload(e.target.files)}
              className="hidden"
            />
            {uploading ? (
              <div>
                <div className="w-8 h-8 border-2 border-[#D4A853]/30 border-t-[#D4A853] rounded-full mx-auto mb-3 animate-spin" />
                <p className="text-sm text-[#D4A853]">Uploading...</p>
              </div>
            ) : (
              <div>
                <div className="text-4xl mb-3">📷</div>
                <p className="text-sm text-[#C4A882]">
                  Drag & drop photos here, or <span className="text-[#D4A853] underline">click to browse</span>
                </p>
                <p className="text-xs text-[#C4A882]/50 mt-2">
                  Supports multiple files • JPG, PNG, WebP
                </p>
              </div>
            )}
          </div>

          {message && (
            <p className="text-sm text-[#D4A853] mt-3 text-center">{message}</p>
          )}
        </div>

        {/* Photos by chapter */}
        {CHAPTERS.map((chapter) => {
          const chapterPhotos = photos
            .filter((p) => p.chapter === chapter.id)
            .sort((a, b) => a.photo_order - b.photo_order);

          if (chapterPhotos.length === 0) return null;

          return (
            <div key={chapter.id} className="mb-8">
              <h3 className="text-lg font-semibold text-[#D4A853] mb-4">
                {chapter.label}
                <span className="text-sm font-normal text-[#C4A882] ml-2">
                  ({chapterPhotos.length} photos)
                </span>
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {chapterPhotos.map((photo, idx) => (
                  <div
                    key={photo.id}
                    className="bg-[#1a1a1a] border border-[#D4A853]/15 rounded-xl overflow-hidden group"
                  >
                    <div className="relative aspect-[4/3]">
                      <img
                        src={getPublicUrl(photo.storage_path)}
                        alt={photo.caption}
                        className="w-full h-full object-cover"
                      />
                      {/* Overlay controls */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          onClick={() => movePhoto(photo.id, 'up')}
                          className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm hover:bg-white/40"
                          title="Move up"
                        >
                          ←
                        </button>
                        <button
                          onClick={() => deletePhoto(photo)}
                          className="w-8 h-8 bg-red-500/40 rounded-full flex items-center justify-center text-sm hover:bg-red-500/70"
                          title="Delete"
                        >
                          🗑️
                        </button>
                        <button
                          onClick={() => movePhoto(photo.id, 'down')}
                          className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm hover:bg-white/40"
                          title="Move down"
                        >
                          →
                        </button>
                      </div>
                      <div className="absolute top-2 left-2 bg-black/50 rounded-full px-2 py-0.5 text-[10px] text-white/70">
                        #{idx + 1}
                      </div>
                    </div>
                    <div className="p-3">
                      <input
                        type="text"
                        value={photo.caption}
                        onChange={(e) => {
                          // Optimistic update
                          setPhotos((prev) =>
                            prev.map((p) =>
                              p.id === photo.id ? { ...p, caption: e.target.value } : p
                            )
                          );
                        }}
                        onBlur={(e) => updateCaption(photo.id, e.target.value)}
                        placeholder="Add caption..."
                        className="w-full bg-transparent text-xs text-[#C4A882] outline-none placeholder:text-[#C4A882]/30"
                      />
                      {photo.uploaded_by && photo.uploaded_by !== 'admin' && (
                        <p className="text-[10px] text-[#C4A882]/40 mt-1">
                          by {photo.uploaded_by}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {photos.length === 0 && (
          <div className="text-center py-16 text-[#C4A882]/40">
            <div className="text-5xl mb-4">📭</div>
            <p>No photos uploaded yet. Start uploading above!</p>
          </div>
        )}

        {/* Share link for friends */}
        <div className="bg-[#1a1a1a] border border-[#D4A853]/15 rounded-2xl p-6 mt-8">
          <h3 className="text-sm font-semibold text-[#D4A853] mb-2">📤 Share with friends</h3>
          <p className="text-xs text-[#C4A882] mb-3">
            Share this page URL with your friends so they can upload photos too.
            They&apos;ll need the password: <code className="text-[#D4A853] bg-[#D4A853]/10 px-1.5 py-0.5 rounded">{ADMIN_PASSWORD}</code>
          </p>
          <p className="text-xs text-[#C4A882]/50">
            URL: <span className="text-[#D4A853]">yoursite.vercel.app/admin</span>
          </p>
        </div>
      </div>
    </div>
  );
}
