"use client";

import { useState } from "react";
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
} from "@/lib/actions/permissions";
import { CRITICAL_MODULES } from "@/lib/auth/permissions";
import type { Module } from "@/lib/auth/permissions";
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

interface Props {
  menuConfig: MenuConfigItem[];
  roleAccess: RoleModuleAccess[];
  defaultAccess: Record<string, Record<string, boolean>>;
  roles: AdminRole[];
}

type Tab = "menu" | "access" | "critical";

const ROLE_LABELS: Record<AdminRole, string> = {
  patron: "Patron",
  admin: "Admin",
  commercial: "Commercial",
  production: "Production",
  infographiste: "Infographiste",
};

export function PermissionsClient({ menuConfig, roleAccess, defaultAccess, roles }: Props) {
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

  const tabs: { key: Tab; label: string }[] = [
    { key: "menu", label: "Ordre du menu" },
    { key: "access", label: "Accès par rôle" },
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
