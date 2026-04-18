-- TerapistBul — Therapist Profiles Table
-- Supabase SQL Editor'da çalıştırın

CREATE TABLE IF NOT EXISTS therapist_profiles (
  panel_id        TEXT PRIMARY KEY,
  available_days  JSONB    DEFAULT '[]'::jsonb,
  day_hours       JSONB    DEFAULT '{}'::jsonb,
  price           INTEGER,
  duration        INTEGER  DEFAULT 50,
  is_online       BOOLEAN  DEFAULT true,
  is_face_to_face BOOLEAN  DEFAULT true,
  about           TEXT,
  education       TEXT,
  photo_url       TEXT,
  gallery_photos  JSONB    DEFAULT '[]'::jsonb,
  intro_video_url TEXT,
  free_consultation BOOLEAN DEFAULT false,
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE therapist_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access therapist_profiles"
  ON therapist_profiles FOR ALL
  USING (true) WITH CHECK (true);

CREATE POLICY "Public read therapist_profiles"
  ON therapist_profiles FOR SELECT
  USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE therapist_profiles;
