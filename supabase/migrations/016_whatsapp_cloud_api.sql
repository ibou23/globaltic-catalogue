-- ═══════════════════════════════════════════════════════════════
-- Migration 016 — WhatsApp Cloud API infrastructure
-- Enrichissement whatsapp_messages + table webhook_events
-- ═══════════════════════════════════════════════════════════════

-- Colonnes manquantes sur whatsapp_messages
ALTER TABLE whatsapp_messages ADD COLUMN IF NOT EXISTS phone_number TEXT;
ALTER TABLE whatsapp_messages ADD COLUMN IF NOT EXISTS contact_name TEXT;
ALTER TABLE whatsapp_messages ADD COLUMN IF NOT EXISTS raw_payload JSONB DEFAULT '{}'::jsonb;
ALTER TABLE whatsapp_messages ADD COLUMN IF NOT EXISTS processed BOOLEAN NOT NULL DEFAULT false;

-- Contrainte message_type étendue (audio + other)
ALTER TABLE whatsapp_messages DROP CONSTRAINT IF EXISTS whatsapp_messages_message_type_check;
ALTER TABLE whatsapp_messages ADD CONSTRAINT whatsapp_messages_message_type_check
  CHECK (message_type IN ('text', 'image', 'document', 'audio', 'template', 'interactive', 'other'));

-- Contrainte status étendue (received pour inbound)
ALTER TABLE whatsapp_messages DROP CONSTRAINT IF EXISTS whatsapp_messages_status_check;
ALTER TABLE whatsapp_messages ADD CONSTRAINT whatsapp_messages_status_check
  CHECK (status IN ('received', 'sent', 'delivered', 'read', 'failed'));

-- Index supplémentaires
CREATE INDEX IF NOT EXISTS idx_wa_messages_phone ON whatsapp_messages(phone_number);
CREATE INDEX IF NOT EXISTS idx_wa_messages_direction ON whatsapp_messages(direction);
CREATE INDEX IF NOT EXISTS idx_wa_messages_processed ON whatsapp_messages(processed) WHERE processed = false;
CREATE UNIQUE INDEX IF NOT EXISTS idx_wa_messages_meta_id ON whatsapp_messages(whatsapp_message_id) WHERE whatsapp_message_id IS NOT NULL;

-- ───────────────────────────────────────────────────────────────
-- Table événements webhook bruts (pour debug et audit)
-- ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS whatsapp_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL DEFAULT 'unknown',
  raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  processed BOOLEAN NOT NULL DEFAULT false,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wa_events_processed ON whatsapp_webhook_events(processed) WHERE processed = false;
CREATE INDEX IF NOT EXISTS idx_wa_events_created ON whatsapp_webhook_events(created_at DESC);

-- RLS sur webhook_events
ALTER TABLE whatsapp_webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wa_events_admin_all" ON whatsapp_webhook_events
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.admin_profiles WHERE user_id = auth.uid() AND is_active = true)
  );
