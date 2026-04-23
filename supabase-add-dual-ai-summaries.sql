-- =====================================================
-- DUAL AI SUMMARIES — Clinical (SOAP) + Client-Facing
-- =====================================================
-- Supabase SQL Editor'da çalıştırın.
--
-- session_notes tablosuna:
--   - client_summary: danışana gösterilecek destekleyici özet (Türkçe)
--   - shared_with_client: terapistin onayıyla danışana açıldığında true
--   - shared_at: açıldığı an
--
-- KURAL: ai_summary (klinik SOAP notu) ASLA danışana gönderilmez.
-- /api/hesabim/session-insights sadece client_summary döner.

ALTER TABLE session_notes
  ADD COLUMN IF NOT EXISTS client_summary     TEXT,
  ADD COLUMN IF NOT EXISTS shared_with_client BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS shared_at          TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_session_notes_shared
  ON session_notes (shared_with_client);
