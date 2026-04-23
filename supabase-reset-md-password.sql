-- Mehmet Demir (md@terapistbul.com) için şifreyi "123456" olarak sıfırlar.
-- Hash scrypt ile oluşturuldu (N=16384, keylen=64, saltlen=16).
--
-- Giriş bilgileri:
--   E-posta: md@terapistbul.com
--   Şifre:   123456
--
-- Not: Login akışı md@terapistbul.com'u Supabase therapists tablosunda iki yolla eşleştiriyor:
--   1) name'den türetilen initials (Mehmet Demir → "md") + @terapistbul.com
--   2) email kolonu tam olarak md@terapistbul.com
-- Bu yüzden UPDATE ikisini de yakalıyor.

UPDATE therapists
SET password_hash = 'scrypt$16384$0d07912047b7dce14c5e91809ba39e69$0d4deb7d278821654c3358a707838daa3592c3d074585cc9a340cdaa5dafb2745a43e09b97da83b46581cf3131f439d3f34ad3b4cc67c2a3398c1a8df10b953b'
WHERE
  lower(email) = 'md@terapistbul.com'
  OR name ILIKE '%Mehmet%Demir%';

-- Doğrulama — hangi satır(lar) güncellendi?
SELECT id, name, email, status,
       CASE WHEN password_hash IS NOT NULL THEN 'var' ELSE 'yok' END AS sifre_durumu
FROM therapists
WHERE
  lower(email) = 'md@terapistbul.com'
  OR name ILIKE '%Mehmet%Demir%';
