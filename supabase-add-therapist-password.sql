-- ============================================================
-- Terapist (panel) parolalarını Supabase'e taşı
-- ------------------------------------------------------------
-- Önceden /api/panel/login tüm terapistler için sabit '123456'
-- parolasını kabul ediyordu. Artık her terapistin kendi
-- password_hash değeri olmalı (scrypt — src/lib/auth/password.js).
-- Geçiş dönemi için PANEL_DEV_PASSWORD env var'ı geçici bir
-- fallback sağlar; bu prod'da unset olmalı.
-- ============================================================

ALTER TABLE therapists
  ADD COLUMN IF NOT EXISTS password_hash TEXT;

CREATE INDEX IF NOT EXISTS idx_therapists_email_lower
  ON therapists (lower(email));

SELECT
  count(*) AS toplam_terapist,
  count(*) FILTER (WHERE password_hash IS NOT NULL) AS parola_hash_olan,
  count(*) FILTER (WHERE password_hash IS NULL)     AS parola_hash_olmayan
FROM therapists;
