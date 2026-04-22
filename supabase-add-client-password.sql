-- ============================================================
-- Danışan (client) parolalarını Supabase'e taşı
-- ------------------------------------------------------------
-- Önceden src/data/registered-users.json dosyasında düz metin
-- parola tutuluyordu. Artık clients tablosuna hash'lenmiş olarak
-- yazılacak (scrypt — bkz. src/lib/auth/password.js).
-- ============================================================

-- 1) password_hash kolonunu ekle (yoksa)
ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- 2) E-posta zaten UNIQUE; ek index gerekmez. Ama email'i normalize
--    etmek için case-insensitive arama hızlandırılabilir.
CREATE INDEX IF NOT EXISTS idx_clients_email_lower
  ON clients (lower(email));

-- 3) Özet
SELECT
  count(*) AS toplam_danisan,
  count(*) FILTER (WHERE password_hash IS NOT NULL) AS parola_hash_olan,
  count(*) FILTER (WHERE password_hash IS NULL)     AS parola_hash_olmayan
FROM clients;
