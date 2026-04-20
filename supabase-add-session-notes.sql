-- Seans notları — terapist video görüşme sırasında not alır, sonrasında da okuyabilir
ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS session_notes TEXT;
