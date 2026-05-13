-- ═══════════════════════════════════════════════════════════════
-- GLOBAL TIC PrintTech — Création du profil admin
-- ═══════════════════════════════════════════════════════════════
--
-- ÉTAPES PRÉALABLES (dans le Dashboard Supabase) :
--
--   1. Aller dans Authentication → Users → Add user
--   2. Remplir :
--      • Email : rahimpresidiop@gmail.com
--      • Password : (votre mot de passe sécurisé)
--      • Cocher "Auto Confirm User" pour activer le compte
--   3. Cliquer "Create User"
--   4. Une fois créé, cliquer sur l'utilisateur dans la liste
--   5. Copier le champ "User UID" (format UUID)
--   6. Remplacer 'VOTRE_USER_ID_ICI' ci-dessous par cet UUID
--
-- ═══════════════════════════════════════════════════════════════


-- ───────────────────────────────────────────────────────────────
-- 1. INSERTION DU PROFIL ADMIN
-- Idempotent : ON CONFLICT met à jour si l'entrée existe déjà
-- ⚠️ Remplacez VOTRE_USER_ID_ICI par l'UUID copié depuis le Dashboard
-- ───────────────────────────────────────────────────────────────

INSERT INTO admin_profiles (user_id, email, full_name, role, is_active)
VALUES (
  'VOTRE_USER_ID_ICI',           -- ← Remplacez par le vrai UUID
  'rahimpresidiop@gmail.com',
  'Ibrahima DIOP',
  'patron',
  true
)
ON CONFLICT (user_id) DO UPDATE SET
  email     = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role      = EXCLUDED.role,
  is_active = EXCLUDED.is_active;


-- ───────────────────────────────────────────────────────────────
-- 2. VÉRIFICATION — Confirmer que le profil admin existe
-- ───────────────────────────────────────────────────────────────

SELECT
  id,
  user_id,
  email,
  full_name,
  role,
  is_active,
  created_at
FROM admin_profiles
WHERE email = 'rahimpresidiop@gmail.com';


-- ───────────────────────────────────────────────────────────────
-- 3. OPTIONNEL — Modifier le rôle plus tard
-- Décommentez et exécutez si nécessaire
-- ───────────────────────────────────────────────────────────────

-- UPDATE admin_profiles
-- SET role = 'admin'  -- Valeurs possibles : patron, admin, commercial, production, infographiste
-- WHERE email = 'rahimpresidiop@gmail.com';


-- ───────────────────────────────────────────────────────────────
-- 4. OPTIONNEL — Désactiver un admin (sans supprimer)
-- ───────────────────────────────────────────────────────────────

-- UPDATE admin_profiles
-- SET is_active = false
-- WHERE email = 'rahimpresidiop@gmail.com';
