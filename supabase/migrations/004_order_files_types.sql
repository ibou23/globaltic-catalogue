-- Migration 004 — Étendre les types de fichiers de commande et créer le bucket Storage

-- Étendre le CHECK constraint sur file_type
ALTER TABLE order_files
  DROP CONSTRAINT IF EXISTS order_files_file_type_check;

ALTER TABLE order_files
  ADD CONSTRAINT order_files_file_type_check
  CHECK (file_type IN (
    'fichier_client',
    'maquette',
    'bat_client',
    'bat_valide',
    'bon_livraison',
    'facture',
    'recu',
    'autre'
  ));

-- Bucket order-files (privé — pas de public access)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'order-files',
  'order-files',
  false,
  20971520, -- 20 MB
  ARRAY[
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/webp'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Policies Storage : admin seulement
CREATE POLICY "order_files_storage_admin_select" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'order-files' AND is_admin()
  );

CREATE POLICY "order_files_storage_admin_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'order-files' AND is_admin()
  );

CREATE POLICY "order_files_storage_admin_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'order-files' AND is_admin()
  );
