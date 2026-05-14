-- Migration 005 — Ajout des champs de navigation aux notifications
-- Additive uniquement, aucun breaking change

ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS entity_type TEXT,
  ADD COLUMN IF NOT EXISTS entity_id   UUID,
  ADD COLUMN IF NOT EXISTS link        TEXT;

-- Index pour les requêtes non-lues par destinataire (topbar badge)
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_unread
  ON notifications(recipient_id, is_read, created_at DESC)
  WHERE channel = 'in_app';
