-- Migration 003 — Champs paiement détaillés sur les commandes

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS payment_method TEXT CHECK (payment_method IN ('wave', 'orange_money', 'especes', 'virement', 'cheque')),
  ADD COLUMN IF NOT EXISTS payment_reference TEXT,
  ADD COLUMN IF NOT EXISTS payment_note TEXT,
  ADD COLUMN IF NOT EXISTS last_payment_at TIMESTAMPTZ;
