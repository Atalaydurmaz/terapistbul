-- ============================================================
-- MARKETPLACE LAUNCH RESET
-- Admin dashboard'daki 71 Randevu · 34 Bekleyen · 2 Danışan
-- hepsi seed/test verisi. Canlıya çıkmadan önce temizle.
-- ============================================================
-- KURAL: Bundan sonra test verileri production Supabase'e
-- yazılmayacak. Test için ayrı bir branch/dev projesi kullan.
-- ============================================================
-- Supabase SQL Editor'da ÇALIŞTIRMADAN ÖNCE YEDEK AL.
-- Komutlar ayrı bloklar — gözden geçirdikten sonra çalıştır.
-- ============================================================


-- 0) Ne temizlenecek, göz at:
SELECT 'therapists'   AS tbl, COUNT(*) FROM therapists
UNION ALL SELECT 'clients',           COUNT(*) FROM clients
UNION ALL SELECT 'appointments',      COUNT(*) FROM appointments
UNION ALL SELECT 'applications',      COUNT(*) FROM applications
UNION ALL SELECT 'reviews',           COUNT(*) FROM reviews
UNION ALL SELECT 'messages',          COUNT(*) FROM messages
UNION ALL SELECT 'session_notes',     COUNT(*) FROM session_notes
UNION ALL SELECT 'payments',          COUNT(*) FROM payments;


-- ------------------------------------------------------------
-- 1) Randevu / danışan / mesaj / yorum / not / ödeme — hepsini sil
--    (Foreign key sırasına dikkat — bağımlı olandan başla)
-- ------------------------------------------------------------
BEGIN;

  DELETE FROM payments;         -- ödemeler (varsa)
  DELETE FROM session_notes;    -- seans notları
  DELETE FROM messages;         -- mesajlar
  DELETE FROM reviews;          -- yorumlar
  DELETE FROM appointments;     -- randevular
  DELETE FROM clients;          -- kayıtlı danışanlar

COMMIT;


-- ------------------------------------------------------------
-- 2) Başvurular — sadece 'bekliyor' olmayan (test) kayıtlar
--    (Gerçek başvuruları koru)
-- ------------------------------------------------------------
-- Hepsini silmek istersen:
-- DELETE FROM applications;
--
-- Sadece test / onaylanmış seed kayıtları sil:
DELETE FROM applications
 WHERE status = 'reddedildi'
    OR email LIKE '%test%'
    OR email LIKE '%example.com';


-- ------------------------------------------------------------
-- 3) Terapistler — sadece iki demo hesabı aktif bırak
--    (Önceki supabase-delete-all-therapists.sql ile aynı)
-- ------------------------------------------------------------
UPDATE therapists
   SET status     = 'aktif',
       updated_at = NOW()
 WHERE email IN ('ak@terapistbul.com', 'md@terapistbul.com');

UPDATE therapists
   SET status     = 'pasif',
       updated_at = NOW()
 WHERE email NOT IN ('ak@terapistbul.com', 'md@terapistbul.com')
   AND status IS DISTINCT FROM 'pasif';


-- ------------------------------------------------------------
-- 4) Doğrula — dashboard'da hepsi 0 / 2 gösterilmeli
-- ------------------------------------------------------------
SELECT 'therapists (aktif)' AS tbl,
       COUNT(*) FILTER (WHERE status = 'aktif') AS count
  FROM therapists
UNION ALL SELECT 'clients',        COUNT(*) FROM clients
UNION ALL SELECT 'appointments',   COUNT(*) FROM appointments
UNION ALL SELECT 'applications',   COUNT(*) FROM applications;

-- Beklenen:
--   therapists (aktif) = 2   (ak@ + md@)
--   clients            = 0
--   appointments       = 0
--   applications       = 0 veya gerçek başvuru sayısı
