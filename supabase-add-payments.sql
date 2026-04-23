-- =====================================================
-- PAYMENT INTEGRATION (iyzico Marketplace)
-- =====================================================
-- Run this in Supabase SQL Editor.

-- Appointments: payment columns
ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS price             INTEGER,          -- TL cinsinden (tam sayı, ör: 1500)
  ADD COLUMN IF NOT EXISTS payment_status    TEXT DEFAULT 'pending', -- pending | paid | refunded | failed
  ADD COLUMN IF NOT EXISTS transaction_id    TEXT,             -- iyzico paymentId
  ADD COLUMN IF NOT EXISTS payment_token     TEXT,             -- iyzico CheckoutForm token (callback eşleşmesi için)
  ADD COLUMN IF NOT EXISTS payment_provider  TEXT DEFAULT 'iyzico',
  ADD COLUMN IF NOT EXISTS paid_at           TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS refunded_at       TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS commission_amount INTEGER,          -- platform payı
  ADD COLUMN IF NOT EXISTS therapist_amount  INTEGER;          -- terapist payı

CREATE INDEX IF NOT EXISTS idx_appointments_payment_status
  ON appointments (payment_status);

CREATE INDEX IF NOT EXISTS idx_appointments_transaction_id
  ON appointments (transaction_id);

-- Therapists: iyzico sub-merchant bilgileri
ALTER TABLE therapists
  ADD COLUMN IF NOT EXISTS iyzico_submerchant_key TEXT,
  ADD COLUMN IF NOT EXISTS iban                   TEXT,
  ADD COLUMN IF NOT EXISTS legal_name             TEXT,   -- fatura/hesap sahibi ad
  ADD COLUMN IF NOT EXISTS identity_number        TEXT,   -- TCKN
  ADD COLUMN IF NOT EXISTS tax_office             TEXT,
  ADD COLUMN IF NOT EXISTS tax_number             TEXT,
  ADD COLUMN IF NOT EXISTS submerchant_type       TEXT DEFAULT 'PERSONAL', -- PERSONAL | PRIVATE_COMPANY | LIMITED_OR_JOINT_STOCK_COMPANY
  ADD COLUMN IF NOT EXISTS submerchant_contact_name    TEXT,
  ADD COLUMN IF NOT EXISTS submerchant_contact_surname TEXT;

-- therapist_profiles için de price kolonu zaten mevcut; bir şey yapmaya gerek yok.
