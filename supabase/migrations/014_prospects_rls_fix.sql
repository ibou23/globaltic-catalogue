-- ═══════════════════════════════════════════════════════════════
-- Migration 014 — Sécurisation RLS prospects
-- Retrait des policies INSERT publiques (l'insertion passe
-- désormais par service_role via Server Action sécurisée)
-- ═══════════════════════════════════════════════════════════════

-- Retirer l'INSERT public sur prospects (plus nécessaire)
DROP POLICY IF EXISTS "prospects_public_insert" ON prospects;

-- Retirer l'INSERT public sur prospect_files (plus nécessaire)
DROP POLICY IF EXISTS "prospect_files_public_insert" ON prospect_files;

-- Retirer l'INSERT public sur storage.objects pour prospect-files
DROP POLICY IF EXISTS "prospect_files_public_insert" ON storage.objects;
