"use client";

import { useState, Fragment } from "react";
import {
  Shield,
  GripVertical,
  RotateCcw,
  Save,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  Check,
} from "lucide-react";
import {
  updateMenuOrderAction,
  updateRoleAccessAction,
  resetMenuOrderAction,
  resetRoleAccessAction,
  updateActionPermissionsAction,
  resetActionPermissionsAction,
} from "@/lib/actions/permissions";
import { CRITICAL_MODULES } from "@/lib/auth/permissions";
import type { Module, Action } from "@/lib/auth/permissions";
import type { AdminRole } from "@/lib/types/domain";

interface MenuConfigItem {
  moduleKey: Module;
  label: string;
  sortOrder: number;
  isEnabled: boolean;
  isSystem: boolean;
}

interface RoleModuleAccess {
  role: AdminRole;
  moduleKey: Module;
  canAccess: boolean;
}

interface RoleActionPermission {
  role: AdminRole;
  actionKey: Action;
  canPerform: boolean;
}

interface Props {
  menuConfig: MenuConfigItem[];
  roleAccess: RoleModuleAccess[];
  defaultAccess: Record<string, Record<string, boolean>>;
  roles: AdminRole[];
  actionPermissions?: RoleActionPermission[];
  defaultActions?: Record<string, Record<string, boolean>>;
}

type Tab = "menu" | "access" | "actions" | "critical";

const ACTION_GROUPS: { label: string; actions: string[] }[] = [
  { label: "Prospects", actions: ["prospect:read", "prospect:edit", "prospect:delete"] },
  { label: "Clients", actions: ["client:create", "client:edit", "client:delete"] },
  { label: "Devis", actions: ["devis:create", "devis:edit", "devis:delete", "devis:convert", "devis:force_delete"] },
  { label: "Commandes", actions: ["commande:edit_status", "commande:edit_payment", "commande:force_delete"] },
  { label: "Fichiers / BAT", actions: ["commande:upload_file", "commande:delete_file", "commande:bat"] },
  { label: "Documents", actions: ["facture:generate", "bl:generate", "receipt:generate", "pdf:generate"] },
  { label: "Produits", actions: ["produit:create", "produit:edit", "produit:delete"] },
  { label: "Catégories", actions: ["categorie:create", "categorie:edit", "categorie:delete"] },
  { label: "Réalisations", actions: ["realisation:create", "realisation:edit", "realisation:delete"] },
  { label: "Tâches", actions: ["task:read", "task:create", "task:edit", "task:delete"] },
  { label: "Imports", actions: ["import:produits", "import:categories", "import:prix"] },
  { label: "Administration", actions: ["parametres:read", "parametres:edit", "admin_user:read", "admin_user:create", "admin_user:edit", "admin_user:toggle", "maintenance:read", "notifications:purge"] },
];

const ACTION_LABELS: Record<string, string> = {
  "prospect:read": "Voir", "prospect:edit": "Modifier", "prospect:delete": "Supprimer",
  "client:create": "Créer", "client:edit": "Modifier", "client:delete": "Supprimer",
  "devis:create": "Créer", "devis:edit": "Modifier", "devis:delete": "Supprimer",
  "devis:convert": "Convertir en commande", "devis:force_delete": "Suppression forcée",
  "commande:edit_status": "Modifier statut", "commande:edit_payment": "Gérer paiement",
  "commande:force_delete": "Suppression forcée",
  "commande:upload_file": "Ajouter fichier", "commande:delete_file": "Supprimer fichier",
  "commande:bat": "Gérer BAT",
  "facture:generate": "Générer facture", "bl:generate": "Bon de livraison",
  "receipt:generate": "Reçu de paiement", "pdf:generate": "Générer PDF",
  "produit:create": "Créer", "produit:edit": "Modifier", "produit:delete": "Supprimer",
  "categorie:create": "Créer", "categorie:edit": "Modifier", "categorie:delete": "Supprimer",
  "realisation:create": "Créer", "realisation:edit": "Modifier", "realisation:delete": "Supprimer",
  "task:read": "Voir", "task:create": "Créer", "task:edit": "Modifier", "task:delete": "Supprimer",
  "import:produits": "Importer produits", "import:categories": "Importer catégories", "import:prix": "Importer prix",
  "parametres:read": "Voir paramètres", "parametres:edit": "Modifier paramètres",
  "admin_user:read": "Voir utilisateurs", "admin_user:create": "Créer utilisateur",
  "admin_user:edit": "Modifier utilisateur", "admin_user:toggle": "Activer/Désactiver",
  "maintenance:read": "Accès maintenance", "notifications:purge": "Purger notifications",
};

const CRITICAL_ACTIONS = [
  "admin_user:create", "admin_user:edit", "admin_user:toggle",
  "parametres:edit", "maintenance:read", "notifications:purge",
  "commande:edit_payment", "commande:force_delete", "devis:force_delete",
  "client:delete", "prospect:delete",
];

const ROLE_LABELS: Record<AdminRole, string> = {
  patron: "Patron",
  admin: "Admin",
  commercial: "Commercial",
  production: "Production",
  infographiste: "Infographiste",
};

export function PermissionsClient({ menuConfig, roleAccess, defaultAccess, roles, actionPermissions = [], defaultActions = {} }: Props) {
  const [tab, setTab] = useState<Tab>("menu");
  const [menuItems, setMenuItems] = useState<MenuConfigItem[]>(menuConfig);
  const [access, setAccess] = useState<Record<string, Record<string, boolean>>>(() => {
    const state = structuredClone(defaultAccess);
    for (const entry of roleAccess) {
      if (state[entry.moduleKey]) {
        state[entry.moduleKey][entry.role] = entry.canAccess;
      }
    }
    return state;
  });
  const [actions, setActions] = useState<Record<string, Record<string, boolean>>>(() => {
    const state = structuredClone(defaultActions);
    for (const entry of actionPermissions) {
      if (state[entry.actionKey]) {
        state[entry.actionKey][entry.role] = entry.canPerform;
      }
    }
    return state;
  });
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  function showFeedback(type: "success" | "error", message: string) {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  }

  function moveItem(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= menuItems.length) return;
    const updated = [...menuItems];
    [updated[index], updated[target]] = [updated[target], updated[index]];
    setMenuItems(updated.map((item, i) => ({ ...item, sortOrder: i + 1 })));
  }

  function toggleAccess(module: string, role: string) {
    if (role === "patron") return;
    setAccess((prev) => ({
      ...prev,
      [module]: {
        ...prev[module],
        [role]: !prev[module][role],
      },
    }));
  }

  async function handleSaveMenu() {
    setSaving(true);
    const items = menuItems.map((item) => ({
      moduleKey: item.moduleKey,
      sortOrder: item.sortOrder,
    }));
    const result = await updateMenuOrderAction(items);
    if (result.error) {
      showFeedback("error", result.error);
    } else {
      showFeedback("success", "Ordre du menu enregistré");
    }
    setSaving(false);
  }

  async function handleSaveAccess() {
    setSaving(true);
    const entries: { role: string; moduleKey: string; canAccess: boolean }[] = [];
    for (const [module, rolesMap] of Object.entries(access)) {
      for (const [role, canAccess] of Object.entries(rolesMap)) {
        if (role === "patron") continue;
        const defaultValue = defaultAccess[module]?.[role] ?? false;
        if (canAccess !== defaultValue) {
          entries.push({ role, moduleKey: module, canAccess });
        }
      }
    }
    if (entries.length === 0) {
      showFeedback("success", "Aucune modification à enregistrer");
      setSaving(false);
      return;
    }
    const result = await updateRoleAccessAction(entries);
    if (result.error) {
      showFeedback("error", result.error);
    } else {
      showFeedback("success", `${entries.length} permission(s) mise(s) à jour`);
    }
    setSaving(false);
  }

  async function handleResetMenu() {
    setSaving(true);
    const result = await resetMenuOrderAction();
    if (result.error) {
      showFeedback("error", result.error);
    } else {
      const sorted = [...menuItems].sort((a, b) => {
        const defaults: Record<string, number> = {
          dashboard: 1, prospects: 2, whatsapp: 3, clients: 4, devis: 5,
          commandes: 6, planning: 7, taches: 8, impayes: 9, factures: 10,
          rapports: 11, produits: 12, categories: 13, realisations: 14,
          imports: 15, parametres: 16, utilisateurs: 17, maintenance: 18, aide: 19,
        };
        return (defaults[a.moduleKey] ?? 99) - (defaults[b.moduleKey] ?? 99);
      });
      setMenuItems(sorted.map((item, i) => ({ ...item, sortOrder: i + 1 })));
      showFeedback("success", "Ordre par défaut restauré");
    }
    setSaving(false);
  }

  async function handleResetAccess() {
    setSaving(true);
    const result = await resetRoleAccessAction();
    if (result.error) {
      showFeedback("error", result.error);
    } else {
      setAccess(structuredClone(defaultAccess));
      showFeedback("success", "Permissions par défaut restaurées");
    }
    setSaving(false);
  }

  function toggleAction(action: string, role: string) {
    if (role === "patron") return;
    setActions((prev) => ({
      ...prev,
      [action]: {
        ...prev[action],
        [role]: !prev[action]?.[role],
      },
    }));
  }

  async function handleSaveActions() {
    setSaving(true);
    const entries: { role: string; actionKey: string; canPerform: boolean }[] = [];
    for (const [action, rolesMap] of Object.entries(actions)) {
      for (const [role, allowed] of Object.entries(rolesMap)) {
        if (role === "patron") continue;
        const defaultValue = defaultActions[action]?.[role] ?? false;
        if (allowed !== defaultValue) {
          entries.push({ role, actionKey: action, canPerform: allowed });
        }
      }
    }
    if (entries.length === 0) {
      showFeedback("success", "Aucune modification à enregistrer");
      setSaving(false);
      return;
    }
    const result = await updateActionPermissionsAction(entries);
    if (result.error) {
      showFeedback("error", result.error);
    } else {
      showFeedback("success", `${entries.length} permission(s) action mise(s) à jour`);
    }
    setSaving(false);
  }

  async function handleResetActions() {
    setSaving(true);
    const result = await resetActionPermissionsAction();
    if (result.error) {
      showFeedback("error", result.error);
    } else {
      setActions(structuredClone(defaultActions));
      showFeedback("success", "Permissions actions par défaut restaurées");
    }
    setSaving(false);
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "menu", label: "Ordre du menu" },
    { key: "access", label: "Accès par rôle" },
    { key: "actions", label: "Actions par rôle" },
    { key: "critical", label: "Permissions sensibles" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-800 font-heading tracking-tight">
          Permissions & Menu
        </h2>
        <p className="text-sm text-slate-400 font-medium mt-1">
          Gérer l&apos;ordre du menu et les accès modules par rôle
        </p>
      </div>

      {/* Feedback */}
      {feedback && (
        <div className={`px-4 py-3 rounded-xl text-sm font-semibold border ${
          feedback.type === "success"
            ? "bg-green-50 text-green-700 border-green-200"
            : "bg-red-50 text-red-700 border-red-200"
        }`}>
          {feedback.message}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-100 pb-0">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-bold rounded-t-lg transition-colors ${
              tab === t.key
                ? "bg-white border border-b-0 border-slate-200 text-slate-800 -mb-px"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Ordre du menu */}
      {tab === "menu" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="divide-y divide-slate-50">
              {menuItems.map((item, index) => (
                <div
                  key={item.moduleKey}
                  className="px-5 py-3 flex items-center gap-3 hover:bg-slate-50/50 transition-colors"
                >
                  <GripVertical className="w-4 h-4 text-slate-300 shrink-0" />
                  <span className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0">
                    {index + 1}
                  </span>
                  <span className="flex-1 text-sm font-semibold text-slate-700">
                    {item.label}
                  </span>
                  {item.isSystem && (
                    <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                      Système
                    </span>
                  )}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => moveItem(index, -1)}
                      disabled={index === 0}
                      className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors disabled:opacity-30"
                    >
                      <ArrowUp className="w-3.5 h-3.5 text-slate-600" />
                    </button>
                    <button
                      onClick={() => moveItem(index, 1)}
                      disabled={index === menuItems.length - 1}
                      className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors disabled:opacity-30"
                    >
                      <ArrowDown className="w-3.5 h-3.5 text-slate-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveMenu}
              disabled={saving}
              className="h-10 px-5 rounded-xl bg-brand-primary text-white text-sm font-bold flex items-center gap-2 hover:bg-brand-primary-dark transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> Enregistrer
            </button>
            <button
              onClick={handleResetMenu}
              disabled={saving}
              className="h-10 px-5 rounded-xl bg-slate-100 text-slate-600 text-sm font-bold flex items-center gap-2 hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              <RotateCcw className="w-4 h-4" /> Restaurer par défaut
            </button>
          </div>
        </div>
      )}

      {/* Tab: Accès par rôle */}
      {tab === "access" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-5 py-3 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">
                    Module
                  </th>
                  {roles.map((role) => (
                    <th
                      key={role}
                      className="px-3 py-3 text-center text-[11px] font-black text-slate-400 uppercase tracking-widest"
                    >
                      {ROLE_LABELS[role]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {menuItems.map((item) => (
                  <tr key={item.moduleKey} className="hover:bg-slate-50/50">
                    <td className="px-5 py-2.5 font-semibold text-slate-700 whitespace-nowrap">
                      {item.label}
                      {CRITICAL_MODULES.includes(item.moduleKey) && (
                        <Shield className="inline w-3.5 h-3.5 text-amber-500 ml-1.5" />
                      )}
                    </td>
                    {roles.map((role) => {
                      const checked = access[item.moduleKey]?.[role] ?? false;
                      const isPatron = role === "patron";
                      return (
                        <td key={role} className="px-3 py-2.5 text-center">
                          {isPatron ? (
                            <Check className="w-4 h-4 text-green-500 mx-auto" />
                          ) : (
                            <button
                              onClick={() => toggleAccess(item.moduleKey, role)}
                              className={`w-8 h-5 rounded-full transition-colors relative ${
                                checked ? "bg-brand-primary" : "bg-slate-200"
                              }`}
                            >
                              <span
                                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                                  checked ? "left-3.5" : "left-0.5"
                                }`}
                              />
                            </button>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveAccess}
              disabled={saving}
              className="h-10 px-5 rounded-xl bg-brand-primary text-white text-sm font-bold flex items-center gap-2 hover:bg-brand-primary-dark transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> Enregistrer
            </button>
            <button
              onClick={handleResetAccess}
              disabled={saving}
              className="h-10 px-5 rounded-xl bg-slate-100 text-slate-600 text-sm font-bold flex items-center gap-2 hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              <RotateCcw className="w-4 h-4" /> Restaurer par défaut
            </button>
          </div>
        </div>
      )}

      {/* Tab: Actions par rôle */}
      {tab === "actions" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-5 py-3 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">
                    Action
                  </th>
                  {roles.filter((r) => r !== "patron").map((role) => (
                    <th
                      key={role}
                      className="px-3 py-3 text-center text-[11px] font-black text-slate-400 uppercase tracking-widest"
                    >
                      {ROLE_LABELS[role]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ACTION_GROUPS.map((group) => (
                  <Fragment key={group.label}>
                    <tr className="bg-slate-50/80">
                      <td
                        colSpan={roles.length}
                        className="px-5 py-2 text-[11px] font-black text-slate-500 uppercase tracking-widest"
                      >
                        {group.label}
                      </td>
                    </tr>
                    {group.actions
                      .filter((a) => actions[a] !== undefined)
                      .map((action) => (
                      <tr key={action} className="border-t border-slate-50 hover:bg-slate-50/50">
                        <td className="px-5 py-2 text-slate-600 font-medium whitespace-nowrap">
                          {ACTION_LABELS[action] ?? action}
                          {CRITICAL_ACTIONS.includes(action) && (
                            <Shield className="inline w-3 h-3 text-amber-500 ml-1" />
                          )}
                        </td>
                        {roles.filter((r) => r !== "patron").map((role) => {
                          const checked = actions[action]?.[role] ?? false;
                          return (
                            <td key={role} className="px-3 py-2 text-center">
                              <button
                                onClick={() => toggleAction(action, role)}
                                className={`w-8 h-5 rounded-full transition-colors relative ${
                                  checked ? "bg-brand-primary" : "bg-slate-200"
                                }`}
                              >
                                <span
                                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                                    checked ? "left-3.5" : "left-0.5"
                                  }`}
                                />
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveActions}
              disabled={saving}
              className="h-10 px-5 rounded-xl bg-brand-primary text-white text-sm font-bold flex items-center gap-2 hover:bg-brand-primary-dark transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> Enregistrer
            </button>
            <button
              onClick={handleResetActions}
              disabled={saving}
              className="h-10 px-5 rounded-xl bg-slate-100 text-slate-600 text-sm font-bold flex items-center gap-2 hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              <RotateCcw className="w-4 h-4" /> Restaurer par défaut
            </button>
          </div>
        </div>
      )}

      {/* Tab: Permissions sensibles */}
      {tab === "critical" && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-amber-800">Modules critiques</p>
                <p className="text-xs text-amber-600 mt-1">
                  Ces modules contiennent des données sensibles ou des fonctions d&apos;administration.
                  Seul le patron peut en accorder l&apos;accès à d&apos;autres rôles.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="divide-y divide-slate-50">
              {CRITICAL_MODULES.map((moduleKey) => {
                const item = menuItems.find((m) => m.moduleKey === moduleKey);
                const label = item?.label ?? moduleKey;
                return (
                  <div key={moduleKey} className="px-5 py-3.5">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-4 h-4 text-amber-500" />
                      <span className="text-sm font-bold text-slate-700">{label}</span>
                    </div>
                    <div className="flex items-center gap-4 ml-6">
                      {roles.filter((r) => r !== "patron").map((role) => {
                        const checked = access[moduleKey]?.[role] ?? false;
                        return (
                          <label key={role} className="flex items-center gap-2 cursor-pointer">
                            <button
                              onClick={() => toggleAccess(moduleKey, role)}
                              className={`w-8 h-5 rounded-full transition-colors relative ${
                                checked ? "bg-brand-primary" : "bg-slate-200"
                              }`}
                            >
                              <span
                                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                                  checked ? "left-3.5" : "left-0.5"
                                }`}
                              />
                            </button>
                            <span className="text-xs font-semibold text-slate-500">
                              {ROLE_LABELS[role]}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveAccess}
              disabled={saving}
              className="h-10 px-5 rounded-xl bg-brand-primary text-white text-sm font-bold flex items-center gap-2 hover:bg-brand-primary-dark transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> Enregistrer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
