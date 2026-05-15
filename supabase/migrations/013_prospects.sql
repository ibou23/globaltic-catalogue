-- ═══════════════════════════════════════════════════════════════
-- GLOBAL TIC PrintTech — Module Prospects CRM
-- Migration 013 — Prospects, fichiers, messages WhatsApp
-- ═══════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────
-- PROSPECTS
-- ───────────────────────────────────────────────────────────────

CREATE TABLE prospects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference TEXT UNIQUE NOT NULL,

  -- Contact
  full_name TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  phone_secondary TEXT,
  email TEXT,

  -- Entreprise
  company_name TEXT,
  company_address TEXT,
  website TEXT,
  sector TEXT,

  -- Conception
  products_services TEXT,
  preferred_colors TEXT,
  support_text TEXT,

  -- Commande
  requested_products TEXT[] DEFAULT '{}',
  other_product TEXT,
  quantity TEXT,
  format_dimensions TEXT,
  finish TEXT,
  desired_deadline TEXT,
  delivery_zone TEXT,
  message TEXT,

  -- Suivi commercial
  status TEXT NOT NULL DEFAULT 'nouveau' CHECK (status IN (
    'nouveau', 'devis_envoye', 'en_negociation', 'validation_conception',
    'commande_confirmee', 'en_production', 'livre', 'annule'
  )),
  internal_notes TEXT,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Metadata
  source TEXT NOT NULL DEFAULT 'formulaire' CHECK (source IN ('formulaire', 'whatsapp', 'telephone', 'terrain', 'autre')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_prospects_status ON prospects(status);
CREATE INDEX idx_prospects_whatsapp ON prospects(whatsapp);
CREATE INDEX idx_prospects_created_at ON prospects(created_at DESC);
CREATE INDEX idx_prospects_reference ON prospects(reference);

CREATE TRIGGER trg_prospects_updated_at BEFORE UPDATE ON prospects FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ───────────────────────────────────────────────────────────────
-- FICHIERS PROSPECTS (logo, documents)
-- ───────────────────────────────────────────────────────────────

CREATE TABLE prospect_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id UUID NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
  file_type TEXT NOT NULL DEFAULT 'document' CHECK (file_type IN ('logo', 'document', 'image', 'autre')),
  file_url TEXT NOT NULL,
  file_name TEXT,
  file_size INT,
  uploaded_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_prospect_files_prospect ON prospect_files(prospect_id);

-- ───────────────────────────────────────────────────────────────
-- MESSAGES WHATSAPP (préparation API Meta future)
-- ───────────────────────────────────────────────────────────────

CREATE TABLE whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id UUID REFERENCES prospects(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  whatsapp_message_id TEXT,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'document', 'template', 'interactive')),
  content TEXT,
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read', 'failed')),
  metadata JSONB DEFAULT '{}'::jsonb,
  sent_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_wa_messages_prospect ON whatsapp_messages(prospect_id);
CREATE INDEX idx_wa_messages_customer ON whatsapp_messages(customer_id);
CREATE INDEX idx_wa_messages_wa_id ON whatsapp_messages(whatsapp_message_id);

-- ───────────────────────────────────────────────────────────────
-- STORAGE BUCKET : prospect-files
-- ───────────────────────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'prospect-files',
  'prospect-files',
  false,
  20971520, -- 20 MB
  ARRAY['application/pdf', 'image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- Lecture réservée aux admins
CREATE POLICY "prospect_files_admin_read" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'prospect-files'
    AND EXISTS (SELECT 1 FROM public.admin_profiles WHERE user_id = auth.uid() AND is_active = true)
  );

-- Upload public (formulaire prospect) + admin
CREATE POLICY "prospect_files_public_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'prospect-files'
  );

-- Suppression réservée aux admins
CREATE POLICY "prospect_files_admin_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'prospect-files'
    AND EXISTS (SELECT 1 FROM public.admin_profiles WHERE user_id = auth.uid() AND is_active = true)
  );

-- ───────────────────────────────────────────────────────────────
-- RLS POLICIES : prospects table
-- ───────────────────────────────────────────────────────────────

ALTER TABLE prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospect_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;

-- Admins : accès complet aux prospects
CREATE POLICY "prospects_admin_all" ON prospects
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.admin_profiles WHERE user_id = auth.uid() AND is_active = true)
  );

-- Public : insertion seulement (formulaire)
CREATE POLICY "prospects_public_insert" ON prospects
  FOR INSERT WITH CHECK (true);

-- Admins : accès complet aux fichiers
CREATE POLICY "prospect_files_admin_all" ON prospect_files
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.admin_profiles WHERE user_id = auth.uid() AND is_active = true)
  );

-- Public : insertion fichiers (formulaire)
CREATE POLICY "prospect_files_public_insert" ON prospect_files
  FOR INSERT WITH CHECK (true);

-- Admins : accès complet aux messages
CREATE POLICY "wa_messages_admin_all" ON whatsapp_messages
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.admin_profiles WHERE user_id = auth.uid() AND is_active = true)
  );
