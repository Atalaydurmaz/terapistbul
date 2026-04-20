-- Mevcut appointments rowlarının email kolonunu lowercase'e çek
UPDATE appointments SET email = LOWER(TRIM(email)) WHERE email IS NOT NULL AND email <> LOWER(TRIM(email));
