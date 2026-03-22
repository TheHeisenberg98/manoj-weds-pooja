-- ============================================
-- LOVECRAFT — Multi-Tenant Schema (v2)
-- ============================================
-- Run this in Supabase SQL Editor AFTER the original supabase-setup.sql.
-- This does NOT drop existing `players` or `visits` tables.
-- ============================================

-- 1. Creators (authenticated users who build experiences)
CREATE TABLE IF NOT EXISTS creators (
  id UUID PRIMARY KEY,  -- matches auth.users.id
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  auth_provider TEXT DEFAULT 'email',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE creators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Creators can read own row" ON creators
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Creators can update own row" ON creators
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Creators can insert own row" ON creators
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. Experiences (each gift/experience)
CREATE TABLE IF NOT EXISTS experiences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL REFERENCES creators(id),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  occasion TEXT NOT NULL CHECK (occasion IN ('wedding', 'anniversary', 'birthday', 'friendship', 'family', 'custom')),
  person_a_name TEXT NOT NULL,
  person_b_name TEXT NOT NULL,
  person_a_label TEXT NOT NULL DEFAULT 'Person A',
  person_b_label TEXT NOT NULL DEFAULT 'Person B',
  theme JSONB NOT NULL DEFAULT '{
    "primaryBg": "#1A0A0A",
    "accentColor": "#8B1C1C",
    "goldColor": "#D4A853",
    "goldColorLight": "#E8D5A3",
    "goldColorDark": "#B8924A",
    "creamColor": "#F5E6D0",
    "mutedColor": "#A89A8C",
    "fontFamily": "Cormorant Garamond"
  }'::jsonb,
  gift_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  access_phones JSONB NOT NULL DEFAULT '[]'::jsonb,
  access_mode TEXT NOT NULL DEFAULT 'phone' CHECK (access_mode IN ('phone', 'name_select', 'open')),
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;

-- Creator can manage own experiences
CREATE POLICY "Creators manage own experiences" ON experiences
  FOR ALL USING (auth.uid() = creator_id);

-- Public can read published experiences
CREATE POLICY "Public reads published experiences" ON experiences
  FOR SELECT USING (is_published = TRUE);

-- 3. Stages (ordered stages within an experience)
CREATE TABLE IF NOT EXISTS stages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  experience_id UUID NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
  stage_type TEXT NOT NULL CHECK (stage_type IN (
    'phone_gate', 'hinge_intro', 'photo_journey', 'swipe_game',
    'quiz', 'waiting_room', 'compatibility', 'fortune_teller', 'gift_reveal'
  )),
  sort_order INTEGER NOT NULL DEFAULT 0,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE stages ENABLE ROW LEVEL SECURITY;

-- Creator manages stages via experience ownership
CREATE POLICY "Creators manage own stages" ON stages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM experiences
      WHERE experiences.id = stages.experience_id
        AND experiences.creator_id = auth.uid()
    )
  );

-- Public reads stages of published experiences
CREATE POLICY "Public reads published stages" ON stages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM experiences
      WHERE experiences.id = stages.experience_id
        AND experiences.is_published = TRUE
    )
  );

-- 4. Participants (people playing an experience)
CREATE TABLE IF NOT EXISTS participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  experience_id UUID NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('a', 'b')),
  phone TEXT,
  display_name TEXT,
  current_stage_id UUID REFERENCES stages(id),
  quiz_answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  swipe_answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  quiz_completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(experience_id, role)
);

ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

-- Public can read/update/insert participants for published experiences
CREATE POLICY "Public reads participants of published experiences" ON participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM experiences
      WHERE experiences.id = participants.experience_id
        AND experiences.is_published = TRUE
    )
  );

CREATE POLICY "Public inserts participants for published experiences" ON participants
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM experiences
      WHERE experiences.id = participants.experience_id
        AND experiences.is_published = TRUE
    )
  );

CREATE POLICY "Public updates participants of published experiences" ON participants
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM experiences
      WHERE experiences.id = participants.experience_id
        AND experiences.is_published = TRUE
    )
  );

-- Creator can manage participants of own experiences
CREATE POLICY "Creators manage own participants" ON participants
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM experiences
      WHERE experiences.id = participants.experience_id
        AND experiences.creator_id = auth.uid()
    )
  );

-- Enable Realtime on participants (critical for waiting room sync)
ALTER PUBLICATION supabase_realtime ADD TABLE participants;

-- 5. Sessions (visit/replay tracking)
CREATE TABLE IF NOT EXISTS sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  experience_id UUID NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  user_agent TEXT
);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Public can insert sessions for published experiences
CREATE POLICY "Public inserts sessions for published experiences" ON sessions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM experiences
      WHERE experiences.id = sessions.experience_id
        AND experiences.is_published = TRUE
    )
  );

-- Creator reads sessions of own experiences
CREATE POLICY "Creators read own sessions" ON sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM experiences
      WHERE experiences.id = sessions.experience_id
        AND experiences.creator_id = auth.uid()
    )
  );

-- 6. Media (uploaded photos/sounds per experience)
CREATE TABLE IF NOT EXISTS media (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  experience_id UUID NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL CHECK (media_type IN ('photo', 'sound')),
  storage_path TEXT NOT NULL,
  public_url TEXT,
  label TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE media ENABLE ROW LEVEL SECURITY;

-- Creator manages own media
CREATE POLICY "Creators manage own media" ON media
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM experiences
      WHERE experiences.id = media.experience_id
        AND experiences.creator_id = auth.uid()
    )
  );

-- Public reads media of published experiences
CREATE POLICY "Public reads published media" ON media
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM experiences
      WHERE experiences.id = media.experience_id
        AND experiences.is_published = TRUE
    )
  );

-- ============================================
-- Auto-create creator row on auth signup
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.creators (id, email, name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- Indexes for performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_experiences_creator_id ON experiences(creator_id);
CREATE INDEX IF NOT EXISTS idx_experiences_slug ON experiences(slug);
CREATE INDEX IF NOT EXISTS idx_stages_experience_id ON stages(experience_id);
CREATE INDEX IF NOT EXISTS idx_stages_sort_order ON stages(experience_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_participants_experience_id ON participants(experience_id);
CREATE INDEX IF NOT EXISTS idx_sessions_experience_id ON sessions(experience_id);
CREATE INDEX IF NOT EXISTS idx_media_experience_id ON media(experience_id);

-- ============================================
-- DONE! Multi-tenant schema is ready.
-- ============================================
