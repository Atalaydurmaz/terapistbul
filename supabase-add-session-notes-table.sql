-- =====================================================
-- SESSION NOTES (AI destekli seans notları)
-- =====================================================
-- Supabase SQL Editor'da çalıştırın.
--
-- Notlar:
--  * therapist_id: statik terapistler için 'ak','md' gibi kod, veya therapists.id (UUID).
--    TEXT olarak saklıyoruz; böylece her iki kimlik tipi de desteklenir.
--  * Her randevu için birden çok taslak olabilmesi için unique değildir;
--    ancak çoğu kullanım tek satır üzerinde güncellenir.

CREATE TABLE IF NOT EXISTS session_notes (
  id             UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  therapist_id   TEXT NOT NULL,                  -- panel_id (statik) veya therapists.id (UUID)
  therapist_email TEXT,                          -- sahip doğrulama için (küçük harfli)
  raw_text       TEXT,                           -- terapistin hızlı notları / transcript
  ai_summary     TEXT,                           -- yapılandırılmış SOAP notu (Türkçe)
  status         TEXT DEFAULT 'draft',           -- 'draft' | 'final'
  model          TEXT,                           -- hangi modelle üretildi (log)
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_session_notes_appointment ON session_notes (appointment_id);
CREATE INDEX IF NOT EXISTS idx_session_notes_therapist   ON session_notes (therapist_id);
CREATE INDEX IF NOT EXISTS idx_session_notes_therapist_email ON session_notes (therapist_email);

-- RLS — sadece service role erişir; API route'ları admin client üzerinden
-- owner doğrulamasını kendi yapar.
ALTER TABLE session_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access session_notes"
  ON session_notes FOR ALL USING (true) WITH CHECK (true);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE session_notes;
