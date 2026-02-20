-- ============================================
-- MANOJ WEDS POOJA — Supabase Setup
-- ============================================
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- 1. Create players table
CREATE TABLE IF NOT EXISTS players (
  id TEXT PRIMARY KEY,              -- 'manoj' or 'pooja'
  phone TEXT,
  quiz_completed BOOLEAN DEFAULT FALSE,
  quiz_answers JSONB DEFAULT '{}',
  quiz_score INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Insert initial player rows
INSERT INTO players (id, phone) VALUES
  ('manoj', '8825607563'),
  ('pooja', '8448522614')
ON CONFLICT (id) DO NOTHING;

-- 3. Enable Realtime on the players table
-- This is CRITICAL for the live sync feature
ALTER PUBLICATION supabase_realtime ADD TABLE players;

-- 4. Create RLS policies (allow all for this simple use case)
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read player status (needed for realtime)
CREATE POLICY "Allow public read" ON players
  FOR SELECT USING (true);

-- Allow anyone to update (quiz completion)
CREATE POLICY "Allow public update" ON players
  FOR UPDATE USING (true);

-- Allow upsert
CREATE POLICY "Allow public insert" ON players
  FOR INSERT WITH CHECK (true);

-- 5. Optional: Visit tracking table
CREATE TABLE IF NOT EXISTS visits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id TEXT REFERENCES players(id),
  visited_at TIMESTAMPTZ DEFAULT NOW(),
  user_agent TEXT
);

ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public insert visits" ON visits
  FOR INSERT WITH CHECK (true);

-- ============================================
-- DONE! Your database is ready.
-- ============================================
