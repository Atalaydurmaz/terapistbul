-- ============================================================
-- Test Verilerini Temizle — Playwright / Manuel testlerin
-- bıraktığı tüm test verilerini siler.
-- Demo hesapları (ak@terapistbul.com, md@terapistbul.com) korunur.
-- ============================================================

-- 1) Test terapistlerini sil
-- "Playwright Test", "Test Terapist" gibi isim veya test email'li her şey
DELETE FROM therapists
WHERE
  (name ILIKE '%playwright%' OR name ILIKE '%test terapist%' OR name ILIKE '%test user%')
  OR (email ILIKE '%playwright%' OR email ILIKE '%test@%' OR email ILIKE 'pw-%')
  OR (email IS NULL OR email = '')  -- e-postasız test kayıtları
;

-- 2) Test randevularını sil
-- İsim/email'inde "test", "playwright" geçen ya da demo hesaplara gelmeyen eski test randevuları
DELETE FROM appointments
WHERE
  name ILIKE '%playwright%'
  OR name ILIKE '%test %'
  OR email ILIKE '%playwright%'
  OR email ILIKE '%test@example%'
  OR email ILIKE 'pw-%'
  OR therapist_name ILIKE '%playwright%'
  OR therapist_name ILIKE '%test %'
  OR note ILIKE '%playwright%'
  OR note ILIKE '%e2e test%'
;

-- 3) Test mesajlarını sil (tablo varsa)
DO $$
BEGIN
  IF to_regclass('public.messages') IS NOT NULL THEN
    EXECUTE 'DELETE FROM messages WHERE
      sender_name ILIKE ''%playwright%'' OR
      sender_name ILIKE ''%test %'' OR
      content ILIKE ''%playwright%'' OR
      content ILIKE ''%e2e test%''';
  END IF;
END $$;

-- 4) Demo hesaplar yoksa geri ekle (therapists.email UNIQUE değil, manuel check)
INSERT INTO therapists (name, email, title, city, price, experience,
  specialties, approaches, online, in_person, verified, status, about)
SELECT 'Dr. Ayşe Kaya', 'ak@terapistbul.com', 'Psikolog', 'İstanbul', 1500, 8,
  ARRAY['Anksiyete','Depresyon'], ARRAY['BDT'], true, true, true, 'aktif',
  'Deneyimli klinik psikolog. Anksiyete ve depresyon alanlarında uzman.'
WHERE NOT EXISTS (SELECT 1 FROM therapists WHERE email = 'ak@terapistbul.com');

INSERT INTO therapists (name, email, title, city, price, experience,
  specialties, approaches, online, in_person, verified, status, about)
SELECT 'Dr. Mehmet Demir', 'md@terapistbul.com', 'Psikiyatrist', 'Ankara', 2000, 12,
  ARRAY['Depresyon','Travma'], ARRAY['EMDR','Psikanaliz'], true, false, true, 'aktif',
  'Travma ve depresyon tedavisinde uzmanlaşmış psikiyatrist.'
WHERE NOT EXISTS (SELECT 1 FROM therapists WHERE email = 'md@terapistbul.com');

-- Var olan demo hesapları tekrar 'aktif' yap (tests pasif yapmış olabilir)
UPDATE therapists SET status = 'aktif'
WHERE email IN ('ak@terapistbul.com', 'md@terapistbul.com');

-- 5) Özet: kalan terapist sayısı
SELECT
  count(*) FILTER (WHERE status = 'aktif') AS aktif_terapist,
  count(*) FILTER (WHERE status = 'pasif') AS pasif_terapist,
  count(*) AS toplam
FROM therapists;
