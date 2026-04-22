-- ============================================================
-- DEMO TERAPİSTLERİ KORU — GERİ KALANLARI KALDIR
-- Tutulacaklar:
--   ak@terapistbul.com   (Alper Kaya)
--   md@terapistbul.com   (Merve ...)
-- Diğer tüm terapistler 'pasif' duruma alınır — listede görünmezler,
-- veri kaybı olmaz, ileride geri alınabilir.
-- ============================================================
-- Supabase SQL Editor'da sırayla çalıştır.
-- ============================================================


-- 0) Mevcut durumu gör
SELECT id, full_name, email, status
  FROM therapists
 ORDER BY created_at DESC;


-- 1) İki demo hesabı aktif tut (emin olmak için)
UPDATE therapists
   SET status     = 'aktif',
       updated_at = NOW()
 WHERE email IN ('ak@terapistbul.com', 'md@terapistbul.com');


-- 2) Diğer HERKESİ pasifleştir (soft delete)
UPDATE therapists
   SET status     = 'pasif',
       updated_at = NOW()
 WHERE email NOT IN ('ak@terapistbul.com', 'md@terapistbul.com')
   AND status IS DISTINCT FROM 'pasif';


-- 3) Doğrula — sadece iki demo hesabı 'aktif' kalmalı
SELECT email, full_name, status
  FROM therapists
 ORDER BY status, email;


-- ============================================================
-- OPSİYONEL: HARD DELETE (geri alınamaz)
-- ============================================================
-- Pasifleştirmek yerine fiziksel silmek istersen yorumu kaldır:
--
-- BEGIN;
--   DELETE FROM session_notes
--    WHERE therapist_id IN (
--      SELECT id FROM therapists
--       WHERE email NOT IN ('ak@terapistbul.com', 'md@terapistbul.com')
--    );
--   DELETE FROM appointments
--    WHERE therapist_id IN (
--      SELECT id FROM therapists
--       WHERE email NOT IN ('ak@terapistbul.com', 'md@terapistbul.com')
--    );
--   DELETE FROM payments
--    WHERE therapist_id IN (
--      SELECT id FROM therapists
--       WHERE email NOT IN ('ak@terapistbul.com', 'md@terapistbul.com')
--    );
--   DELETE FROM therapist_profiles
--    WHERE therapist_id IN (
--      SELECT id FROM therapists
--       WHERE email NOT IN ('ak@terapistbul.com', 'md@terapistbul.com')
--    );
--   DELETE FROM therapists
--    WHERE email NOT IN ('ak@terapistbul.com', 'md@terapistbul.com');
-- COMMIT;


-- ============================================================
-- GERİ ALMA
-- ============================================================
-- UPDATE therapists SET status = 'aktif' WHERE email = '<email>';
