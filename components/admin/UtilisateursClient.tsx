"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  UserCog,
  Plus,
  Pencil,
  PowerOff,
  Power,
  ShieldAlert,
} from "lucide-react";
import type { AdminProfile } from "@/lib/types/domain";
import { formatDateShort } from "@/lib/utils/format";
import { toggleAdminUserAction } from "@/lib/actions/admin-users";
import { AdminUserForm } from "@/components/admin/AdminUserForm";

interface UtilisateursClientProps {
  profiles: AdminProfile[];
  currentAdminId: string;
}

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  patron:       { label: "Patron",       color: "bg-amber-100 text-amber-700" },
  admin:        { label: "Admin",        color: "bg-purple-100 text-purple-700" },
  commercial:   { label: "Commercial",   color: "bg-blue-100 text-blue-700" },
  production:   { label: "Production",   color: "bg-cyan-100 text-cyan-700" },
  infographiste:{ label: "Infographiste",color: "bg-pink-100 text-pink-700" },
};

export function UtilisateursClient({
  profiles,
  currentAdminId,
}: UtilisateursClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingProfile, setEditingProfile] = useState<AdminProfile | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [toggleError, setToggleError] = useState<string | null>(null);
  const [confirmToggle, setConfirmToggle] = useState<AdminProfile | null>(null);

  const activePatrons = profiles.filter((p) => p.role === "patron" && p.isActive);

  function handleToggle(profile: AdminProfile) {
    if (profile.isActive) {
      setConfirmToggle(profile);
    } else {
      doToggle(profile.id, true);
    }
  }

  function doToggle(id: string, isActive: boolean) {
    setToggleError(null);
    startTransition(async () => {
      const result = await toggleAdminUserAction(id, isActive);
      if (!result.data) {
        setToggleError(result.error ?? "Erreur lors de la modification");
      } else {
        router.refresh();
      }
      setConfirmToggle(null);
    });
  }

  return (
    <>
      {/* Modale création */}
      {showCreateForm && (
        <AdminUserForm
          mode="create"
          onClose={() => setShowCreateForm(false)}
          onSuccess={() => { setShowCreateForm(false); router.refresh(); }}
        />
      )}

      {/* Modale édition */}
      {editingProfile && (
        <AdminUserForm
          mode="edit"
          profile={editingProfile}
          currentAdminId={currentAdminId}
          activePatronCount={activePatrons.length}
          onClose={() => setEditingProfile(null)}
          onSuccess={() => { setEditingProfile(null); router.refresh(); }}
        />
      )}

      {/* Modale confirmation désactivation */}
      {confirmToggle && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-black text-slate-800 text-sm">Désactiver l&apos;accès</h3>
                <p className="text-xs text-slate-400 mt-0.5">{confirmToggle.fullName}</p>
              </div>
            </div>
            <p className="text-sm text-slate-600">
              Cet utilisateur ne pourra plus se connecter au dashboard. Vous pourrez réactiver son accès à tout moment.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmToggle(null)}
                className="flex-1 h-11 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => doToggle(confirmToggle.id, false)}
                disabled={isPending}
                className="flex-1 h-11 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors disabled:opacity-60"
              >
                {isPending ? "…" : "Désactiver"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-800 font-heading tracking-tight">
              Gestion des utilisateurs
            </h2>
            <p className="text-sm text-slate-400 font-medium mt-1">
              {profiles.length} compte{profiles.length > 1 ? "s" : ""} —{" "}
              {profiles.filter((p) => p.isActive).length} actif{profiles.filter((p) => p.isActive).length > 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="h-10 px-4 sm:px-5 rounded-xl bg-brand-primary text-white text-sm font-bold flex items-center gap-2 hover:bg-brand-primary-dark transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Ajouter</span>
          </button>
        </div>

        {toggleError && (
          <p className="text-sm font-semibold text-red-600 bg-red-50 px-4 py-3 rounded-xl">
            {toggleError}
          </p>
        )}

        {profiles.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 px-6 py-12 text-center">
            <UserCog className="w-8 h-8 text-slate-200 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-300">Aucun utilisateur</p>
          </div>
        ) : (
          <>
            {/* ── Vue mobile : cards ── */}
            <div className="sm:hidden space-y-3">
              {profiles.map((profile) => {
                const roleInfo = ROLE_LABELS[profile.role] ?? { label: profile.role, color: "bg-slate-100 text-slate-600" };
                const isSelf = profile.id === currentAdminId;
                const isLastPatron = profile.role === "patron" && activePatrons.length <= 1 && profile.isActive;

                return (
                  <div key={profile.id} className={`bg-white rounded-2xl border p-4 space-y-3 ${profile.isActive ? "border-slate-100" : "border-slate-100 opacity-70"}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-black text-slate-800 text-sm">{profile.fullName}</p>
                          {isSelf && <span className="text-[10px] text-brand-primary font-bold">Vous</span>}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 truncate">{profile.email}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{formatDateShort(profile.createdAt)}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${roleInfo.color}`}>
                          {roleInfo.label}
                        </span>
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${profile.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"}`}>
                          {profile.isActive ? "Actif" : "Désactivé"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-50">
                      <button
                        onClick={() => setEditingProfile(profile)}
                        className="flex-1 h-10 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" /> Modifier
                      </button>
                      {!isLastPatron && !isSelf && (
                        <button
                          onClick={() => handleToggle(profile)}
                          disabled={isPending}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors disabled:opacity-40 shrink-0 ${
                            profile.isActive
                              ? "bg-red-100 text-red-500 hover:bg-red-200"
                              : "bg-emerald-100 text-emerald-600 hover:bg-emerald-200"
                          }`}
                          title={profile.isActive ? "Désactiver" : "Réactiver"}
                        >
                          {profile.isActive ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                        </button>
                      )}
                      {isLastPatron && (
                        <span className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0" title="Dernier patron actif">
                          <ShieldAlert className="w-4 h-4 text-amber-400" />
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Vue desktop : tableau ── */}
            <div className="hidden sm:block bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Utilisateur</th>
                    <th className="text-left px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Email</th>
                    <th className="text-center px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Rôle</th>
                    <th className="text-center px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Statut</th>
                    <th className="text-left px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Créé le</th>
                    <th className="text-center px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {profiles.map((profile) => {
                    const roleInfo = ROLE_LABELS[profile.role] ?? { label: profile.role, color: "bg-slate-100 text-slate-600" };
                    const isSelf = profile.id === currentAdminId;
                    const isLastPatron = profile.role === "patron" && activePatrons.length <= 1 && profile.isActive;

                    return (
                      <tr key={profile.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-700">{profile.fullName}</p>
                          {isSelf && (
                            <p className="text-[10px] text-brand-primary font-semibold mt-0.5">Vous</p>
                          )}
                        </td>
                        <td className="px-6 py-4 text-slate-500 text-xs">{profile.email}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${roleInfo.color}`}>
                            {roleInfo.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${profile.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"}`}>
                            {profile.isActive ? "Actif" : "Désactivé"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500 text-xs">
                          {formatDateShort(profile.createdAt)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setEditingProfile(profile)}
                              title="Modifier"
                              className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            {!isLastPatron && !isSelf && (
                              <button
                                onClick={() => handleToggle(profile)}
                                disabled={isPending}
                                title={profile.isActive ? "Désactiver" : "Réactiver"}
                                className={`inline-flex items-center justify-center w-8 h-8 rounded-lg transition-colors disabled:opacity-40 ${
                                  profile.isActive
                                    ? "bg-red-100 text-red-500 hover:bg-red-200"
                                    : "bg-emerald-100 text-emerald-600 hover:bg-emerald-200"
                                }`}
                              >
                                {profile.isActive ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                              </button>
                            )}
                            {isLastPatron && (
                              <span title="Dernier patron actif — ne peut pas être désactivé" className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-amber-50">
                                <ShieldAlert className="w-4 h-4 text-amber-400" />
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </>
  );
}
