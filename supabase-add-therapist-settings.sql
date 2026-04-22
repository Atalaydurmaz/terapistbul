-- ============================================================
-- Terapist panel ayarları (bildirimler, gizlilik, güvenlik)
-- ------------------------------------------------------------
-- /panel/ayarlar sayfasındaki tüm toggle/switch değerleri burada
-- saklanır. JSONB kullanıyoruz çünkü şema sık değişiyor ve
-- kolon başına ALTER TABLE gerektirmemeli.
--
-- Varsayılan değerler UI'daki ilk render ile tutarlı olmalı.
-- ============================================================

ALTER TABLE therapist_profiles
  ADD COLUMN IF NOT EXISTS settings JSONB NOT NULL DEFAULT '{}'::jsonb;

-- İletişim bilgileri (e-posta/telefon) zaten therapists tablosunda
-- duruyor — burada yeniden yazmıyoruz, PUT handler'ı therapists'ı da
-- günceller.

SELECT
  count(*) AS toplam_profil,
  count(*) FILTER (WHERE settings <> '{}'::jsonb) AS ayar_kaydedilmis
FROM therapist_profiles;
