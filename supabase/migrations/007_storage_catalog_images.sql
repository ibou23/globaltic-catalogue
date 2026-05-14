-- Migration 007 : Bucket Storage catalog-images
-- Images publiques des produits et catégories du catalogue

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'catalog-images',
  'catalog-images',
  true,
  10485760, -- 10 MB
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Lecture publique (images du catalogue visibles par tous)
CREATE POLICY "catalog_images_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'catalog-images');

-- Upload réservé aux admins
CREATE POLICY "catalog_images_admin_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'catalog-images'
    AND (SELECT is_admin() FROM public.admin_profiles WHERE user_id = auth.uid() LIMIT 1)
  );

-- Suppression réservée aux admins
CREATE POLICY "catalog_images_admin_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'catalog-images'
    AND (SELECT is_admin() FROM public.admin_profiles WHERE user_id = auth.uid() LIMIT 1)
  );
