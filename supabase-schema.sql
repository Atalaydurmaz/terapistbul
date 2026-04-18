-- TerapistBul Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================
-- APPOINTMENTS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS appointments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  note TEXT,
  therapist_name TEXT,
  therapist_email TEXT,
  type TEXT DEFAULT 'randevu', -- 'randevu' | 'mesaj'
  selected_day TEXT,
  selected_hour TEXT,
  status TEXT DEFAULT 'bekliyor', -- 'bekliyor' | 'onayli' | 'iptal'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- APPLICATIONS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS applications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  city TEXT,
  title TEXT,
  experience TEXT,
  education TEXT,
  specialties TEXT[] DEFAULT '{}',
  approaches TEXT[] DEFAULT '{}',
  about TEXT,
  price TEXT,
  session_mode TEXT[] DEFAULT '{}',
  diploma_url TEXT,
  diploma_file_name TEXT,
  video_url TEXT,
  video_file_name TEXT,
  video_file_size BIGINT,
  -- Store base64 for small files temporarily
  diploma_file TEXT,
  video_file TEXT,
  status TEXT DEFAULT 'bekliyor', -- 'bekliyor' | 'onaylandi' | 'reddedildi'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- THERAPISTS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS therapists (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  application_id UUID REFERENCES applications(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  title TEXT,
  city TEXT,
  specialties TEXT[] DEFAULT '{}',
  approaches TEXT[] DEFAULT '{}',
  experience INTEGER DEFAULT 0,
  education TEXT,
  about TEXT,
  price INTEGER DEFAULT 0,
  email TEXT,
  phone TEXT,
  online BOOLEAN DEFAULT true,
  in_person BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'aktif', -- 'aktif' | 'pasif' | 'bekliyor'
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT false,
  diploma_url TEXT,
  video_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- CLIENTS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS clients (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  birth_year TEXT,
  gender TEXT,
  status TEXT DEFAULT 'aktif', -- 'aktif' | 'pasif' | 'engellendi'
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- ENABLE REALTIME
-- =====================
ALTER PUBLICATION supabase_realtime ADD TABLE appointments;
ALTER PUBLICATION supabase_realtime ADD TABLE applications;
ALTER PUBLICATION supabase_realtime ADD TABLE therapists;
ALTER PUBLICATION supabase_realtime ADD TABLE clients;

-- =====================
-- ROW LEVEL SECURITY
-- =====================
-- Allow service role full access (for API routes)
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE therapists ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Service role bypass
CREATE POLICY "Service role full access appointments" ON appointments FOR ALL USING (true);
CREATE POLICY "Service role full access applications" ON applications FOR ALL USING (true);
CREATE POLICY "Service role full access therapists" ON therapists FOR ALL USING (true);
CREATE POLICY "Service role full access clients" ON clients FOR ALL USING (true);

-- Public read for therapists (website listing)
CREATE POLICY "Public read active therapists" ON therapists FOR SELECT USING (status = 'aktif');

-- =====================
-- THERAPIST PROFILES TABLE
-- Panel takvim, fiyat, galeri verilerini saklar
-- panel_id = therapists.js'deki statik ID ('ak', 'md', ...)
-- =====================
CREATE TABLE IF NOT EXISTS therapist_profiles (
  panel_id TEXT PRIMARY KEY,
  available_days JSONB DEFAULT '[]'::jsonb,
  day_hours     JSONB DEFAULT '{}'::jsonb,
  price         INTEGER,
  duration      INTEGER DEFAULT 50,
  is_online     BOOLEAN DEFAULT true,
  is_face_to_face BOOLEAN DEFAULT true,
  about         TEXT,
  education     TEXT,
  photo_url     TEXT,
  gallery_photos JSONB DEFAULT '[]'::jsonb,
  intro_video_url TEXT,
  free_consultation BOOLEAN DEFAULT false,
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE therapist_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access therapist_profiles"
  ON therapist_profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public read therapist_profiles"
  ON therapist_profiles FOR SELECT USING (true);
ALTER PUBLICATION supabase_realtime ADD TABLE therapist_profiles;
