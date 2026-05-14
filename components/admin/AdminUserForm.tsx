"use client";

import { useState, useTransition } from "react";
import { X, Loader2, Save, Eye, EyeOff } from "lucide-react";
import type { AdminProfile, AdminRole } from "@/lib/types/domain";
import { createAdminUserAction, updateAdminUserAction } from "@/lib/actions/admin-users";

const inputClass =
  "w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-brand-primary/50 focus:ring-1 focus:ring-brand-primary/30 transition-all bg-white";
const labelClass =
  "block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5";

const ROLE_OPTIONS: { value: AdminRole; label: string; description: string }[] = [
  { value: "patron",        label: "Patron",        description: "Accès complet, gestion des utilisateurs" },
  { value: "admin",         label: "Admin",         description: "Accès complet sauf utilisateurs et paramètres" },
  { value: "commercial",    label: "Commercial",    description: "Devis, commandes, clients" },
  { value: "production",    label: "Production",    description: "Commandes, BAT, fichiers" },
  { value: "infographiste", label: "Infographiste", description: "Commandes, BAT, fichiers (lecture)" },
];

interface AdminUserFormCreateProps {
  mode: "create";
  profile?: undefined;
  currentAdminId?: string;
  activePatronCount?: number;
  onClose: () => void;
  onSuccess: () => void;
}

interface AdminUserFormEditProps {
  mode: "edit";
  profile: AdminProfile;
  currentAdminId: string;
  activePatronCount: number;
  onClose: () => void;
  onSuccess: () => void;
}

type AdminUserFormProps = AdminUserFormCreateProps | AdminUserFormEditProps;

export function AdminUserForm(props: AdminUserFormProps) {
  const { mode, onClose, onSuccess } = props;
  const profile = mode === "edit" ? props.profile : undefined;

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [fullName, setFullName] = useState(profile?.fullName ?? "");
  const [email, setEmail] = useState(profile?.email ?? "");
  const [role, setRole] = useState<AdminRole>(profile?.role ?? "commercial");
  const [password, setPassword] = useState("");
  const [isActive, setIsActive] = useState(profile?.isActive ?? true);

  const isLastPatron =
    mode === "edit" &&
    profile?.role === "patron" &&
    (props.activePatronCount ?? 1) <= 1 &&
    profile.isActive;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      if (mode === "create") {
        const result = await createAdminUserAction({
          full_name: fullName.trim(),
          email: email.trim().toLowerCase(),
          role,
          password,
          is_active: isActive,
        });
        if (!result.data) {
          setError(result.error ?? "Erreur lors de la création");
          return;
        }
      } else {
        const updates: Record<string, unknown> = {};
        if (fullName.trim() !== profile?.fullName) updates.full_name = fullName.trim();
        if (role !== profile?.role) updates.role = role;
        if (isActive !== profile?.isActive) updates.is_active = isActive;

        if (Object.keys(updates).length === 0) {
          onClose();
          return;
        }

        const result = await updateAdminUserAction(profile!.id, updates);
        if (!result.data) {
          setError(result.error ?? "Erreur lors de la modification");
          return;
        }
      }

      onSuccess();
    });
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-black text-slate-800">
              {mode === "create" ? "Ajouter un utilisateur" : "Modifier l'utilisateur"}
            </h2>
            {mode === "edit" && (
              <p className="text-xs text-slate-400 mt-0.5">{profile?.email}</p>
            )}
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          {/* Nom complet */}
          <div>
            <label className={labelClass}>Nom complet</label>
            <input
              className={inputClass}
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ex : Moussa Diallo"
              required
            />
          </div>

          {/* Email — lecture seule en édition */}
          <div>
            <label className={labelClass}>Email</label>
            {mode === "create" ? (
              <input
                className={inputClass}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ex : moussa@globaltic.sn"
                required
              />
            ) : (
              <p className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-500 font-medium">
                {profile?.email}
              </p>
            )}
          </div>

          {/* Rôle */}
          <div>
            <label className={labelClass}>Rôle</label>
            {isLastPatron ? (
              <div className="px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-sm font-bold text-amber-700">Patron</p>
                <p className="text-xs text-amber-600 mt-0.5">
                  Rôle verrouillé — seul patron actif
                </p>
              </div>
            ) : (
              <select
                className={inputClass}
                value={role}
                onChange={(e) => setRole(e.target.value as AdminRole)}
              >
                {ROLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label} — {opt.description}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Mot de passe temporaire — création uniquement */}
          {mode === "create" && (
            <div>
              <label className={labelClass}>Mot de passe temporaire</label>
              <div className="relative">
                <input
                  className={inputClass}
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 caractères"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                L&apos;utilisateur devra changer ce mot de passe après sa première connexion.
              </p>
            </div>
          )}

          {/* Statut actif — désactivé si dernier patron ou soi-même */}
          {mode === "edit" && (
            <div>
              <label className={labelClass}>Statut</label>
              {isLastPatron ? (
                <div className="px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-xs text-amber-600">
                    Impossible de désactiver — dernier patron actif
                  </p>
                </div>
              ) : profile?.id === props.currentAdminId ? (
                <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <p className="text-xs text-slate-500">
                    Vous ne pouvez pas désactiver votre propre accès
                  </p>
                </div>
              ) : (
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    onClick={() => setIsActive(!isActive)}
                    className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${isActive ? "bg-emerald-500" : "bg-slate-300"}`}
                  >
                    <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${isActive ? "translate-x-5" : "translate-x-0"}`} />
                  </div>
                  <span className="text-sm font-semibold text-slate-700">
                    {isActive ? "Accès actif" : "Accès désactivé"}
                  </span>
                </label>
              )}
            </div>
          )}

          {error && (
            <p className="text-sm font-semibold text-red-600 bg-red-50 px-4 py-3 rounded-xl">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 h-11 rounded-xl bg-brand-primary text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-brand-primary-dark transition-colors disabled:opacity-60"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isPending
                ? mode === "create" ? "Création…" : "Enregistrement…"
                : mode === "create" ? "Créer l'utilisateur" : "Enregistrer"
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
