"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CheckSquare, Plus, MessageCircle, Pencil, Trash2,
  CheckCircle2, Clock, AlertTriangle, Calendar, Filter,
} from "lucide-react";
import type { TaskEnriched, AdminProfile, AdminRole, Customer } from "@/lib/types/domain";
import { formatDateShort } from "@/lib/utils/format";
import { canPerform } from "@/lib/auth/permissions";
import { updateTaskStatusAction, deleteTaskAction } from "@/lib/actions/tasks";
import { TaskForm } from "@/components/admin/TaskForm";
import { siteConfig } from "@/lib/config/site";
import { cn } from "@/lib/utils/cn";

// ─── Labels ──────────────────────────────────────────────────────────────────

const TASK_TYPE_LABELS: Record<string, string> = {
  relancer_devis:      "Relancer devis",
  relancer_paiement:   "Relancer paiement",
  envoyer_bat:         "Envoyer BAT",
  verifier_production: "Vérifier production",
  confirmer_livraison: "Confirmer livraison",
  appeler_client:      "Appeler client",
  autre:               "Autre",
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  basse:   { label: "Basse",   color: "bg-slate-100 text-slate-500",   dot: "bg-slate-400" },
  normale: { label: "Normale", color: "bg-blue-100 text-blue-600",     dot: "bg-blue-500" },
  haute:   { label: "Haute",   color: "bg-amber-100 text-amber-700",   dot: "bg-amber-500" },
  urgente: { label: "Urgente", color: "bg-red-100 text-red-600",       dot: "bg-red-500" },
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  a_faire:  { label: "À faire",   color: "bg-slate-100 text-slate-600" },
  en_cours: { label: "En cours",  color: "bg-blue-100 text-blue-600" },
  terminee: { label: "Terminée",  color: "bg-green-100 text-green-600" },
  annulee:  { label: "Annulée",   color: "bg-slate-100 text-slate-400" },
};

// ─── Filter logic ─────────────────────────────────────────────────────────────

type FilterKey = "actives" | "retard" | "aujourd_hui" | "semaine" | "terminees";

function isOverdue(task: TaskEnriched): boolean {
  if (!task.dueDate) return false;
  if (["terminee", "annulee"].includes(task.status)) return false;
  return task.dueDate < new Date().toISOString().slice(0, 10);
}

function isDueToday(task: TaskEnriched): boolean {
  if (!task.dueDate) return false;
  return task.dueDate === new Date().toISOString().slice(0, 10);
}

function isDueThisWeek(task: TaskEnriched): boolean {
  if (!task.dueDate) return false;
  const today = new Date();
  const endOfWeek = new Date(today);
  endOfWeek.setDate(today.getDate() + (7 - today.getDay()));
  return task.dueDate >= today.toISOString().slice(0, 10) && task.dueDate <= endOfWeek.toISOString().slice(0, 10);
}

function applyFilter(tasks: TaskEnriched[], filter: FilterKey, role: AdminRole): TaskEnriched[] {
  let filtered = tasks;

  // Filtrage rôle : production/infographiste ne voient que les tâches qui les concernent
  if (role === "production") {
    filtered = filtered.filter((t) =>
      ["envoyer_bat", "verifier_production", "confirmer_livraison", "autre"].includes(t.taskType)
    );
  } else if (role === "infographiste") {
    filtered = filtered.filter((t) =>
      ["envoyer_bat", "autre"].includes(t.taskType)
    );
  }

  switch (filter) {
    case "actives":
      return filtered.filter((t) => !["terminee", "annulee"].includes(t.status));
    case "retard":
      return filtered.filter(isOverdue);
    case "aujourd_hui":
      return filtered.filter((t) => isDueToday(t) && !["terminee", "annulee"].includes(t.status));
    case "semaine":
      return filtered.filter((t) => isDueThisWeek(t) && !["terminee", "annulee"].includes(t.status));
    case "terminees":
      return filtered.filter((t) => t.status === "terminee");
    default:
      return filtered;
  }
}

// ─── WhatsApp builder ─────────────────────────────────────────────────────────

function buildWaLink(task: TaskEnriched): string {
  if (!task.customer?.whatsapp) return "#";
  const number = task.customer.whatsapp.replace(/[^0-9]/g, "") || siteConfig.whatsapp;
  const lines: string[] = [];

  if (task.taskType === "relancer_devis" && task.quote) {
    lines.push(`Bonjour *${task.customer.contactName}* 👋`);
    lines.push(``);
    lines.push(`Nous avons un devis *${task.quote.reference}* en attente de votre confirmation.`);
    lines.push(``);
    lines.push(`N'hésitez pas à nous contacter pour toute question. — *GLOBAL TIC*`);
  } else if (task.taskType === "relancer_paiement" && task.order) {
    lines.push(`Bonjour *${task.customer.contactName}*,`);
    lines.push(``);
    lines.push(`Un rappel concernant votre commande *${task.order.reference}* : un solde est en attente de règlement.`);
    lines.push(``);
    lines.push(`Merci de régulariser votre paiement. — *GLOBAL TIC*`);
  } else if (task.taskType === "confirmer_livraison" && task.order) {
    lines.push(`Bonjour *${task.customer.contactName}* 🎉`);
    lines.push(``);
    lines.push(`Votre commande *${task.order.reference}* est prête à être livrée.`);
    lines.push(``);
    lines.push(`Veuillez confirmer votre disponibilité. — *GLOBAL TIC*`);
  } else {
    lines.push(`Bonjour *${task.customer.contactName}*,`);
    lines.push(``);
    lines.push(`${task.title}`);
    lines.push(``);
    lines.push(`— *GLOBAL TIC*`);
  }

  return `https://wa.me/${number}?text=${encodeURIComponent(lines.join("\n"))}`;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface TachesClientProps {
  tasks: TaskEnriched[];
  adminProfiles: AdminProfile[];
  customers: Customer[];
  role: AdminRole;
  overdueCount: number;
  todayCount: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TachesClient({
  tasks,
  adminProfiles,
  customers,
  role,
  overdueCount,
  todayCount,
}: TachesClientProps) {
  const router = useRouter();
  const [filter, setFilter] = useState<FilterKey>("actives");
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskEnriched | null>(null);
  const [isPending, startTransition] = useTransition();

  const canCreate = canPerform(role, "task:create");
  const canDelete = canPerform(role, "task:delete");

  const filtered = applyFilter(tasks, filter, role);

  function handleStatusChange(task: TaskEnriched, newStatus: string) {
    startTransition(async () => {
      await updateTaskStatusAction({ id: task.id, status: newStatus });
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Supprimer cette tâche définitivement ?")) return;
    startTransition(async () => {
      await deleteTaskAction(id);
      router.refresh();
    });
  }

  const FILTERS: { key: FilterKey; label: string; count?: number }[] = [
    { key: "actives",      label: "Actives" },
    { key: "retard",       label: "En retard", count: overdueCount },
    { key: "aujourd_hui",  label: "Aujourd'hui", count: todayCount },
    { key: "semaine",      label: "Cette semaine" },
    { key: "terminees",    label: "Terminées" },
  ];

  return (
    <>
      {(showForm || editingTask) && (
        <TaskForm
          task={editingTask ?? undefined}
          adminProfiles={adminProfiles}
          customers={customers}
          onClose={() => { setShowForm(false); setEditingTask(null); }}
        />
      )}

      <div className="space-y-4 sm:space-y-6">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-800 font-heading tracking-tight">
              Tâches &amp; Relances
            </h2>
            <p className="text-sm text-slate-400 font-medium mt-1">
              {filtered.length} tâche{filtered.length > 1 ? "s" : ""}
              {overdueCount > 0 && (
                <span className="ml-2 text-red-500 font-bold">· {overdueCount} en retard</span>
              )}
            </p>
          </div>
          {canCreate && (
            <button
              onClick={() => setShowForm(true)}
              className="h-10 px-4 sm:px-5 rounded-xl bg-brand-primary text-white text-sm font-bold flex items-center gap-2 hover:bg-brand-primary-dark transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nouvelle tâche</span>
            </button>
          )}
        </div>

        {/* Alertes */}
        {overdueCount > 0 && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
            <p className="text-sm font-semibold text-red-700">
              {overdueCount} tâche{overdueCount > 1 ? "s" : ""} en retard — à traiter en priorité.
            </p>
            <button onClick={() => setFilter("retard")} className="ml-auto text-xs font-bold text-red-600 hover:text-red-800 underline underline-offset-2">
              Voir
            </button>
          </div>
        )}

        {/* Filtres */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <Filter className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "h-8 px-3 rounded-lg text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1",
                filter === f.key
                  ? "bg-brand-primary text-white"
                  : "bg-white border border-slate-200 text-slate-500 hover:border-brand-primary/40 hover:text-brand-primary"
              )}
            >
              {f.label}
              {f.count !== undefined && f.count > 0 && (
                <span className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded-full font-bold",
                  filter === f.key ? "bg-white/20 text-white" : "bg-red-100 text-red-600"
                )}>
                  {f.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Liste */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 px-6 py-12 text-center">
            <CheckSquare className="w-8 h-8 text-slate-200 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-300">Aucune tâche dans ce filtre</p>
          </div>
        ) : (
          <>
            {/* Mobile */}
            <div className="sm:hidden space-y-3">
              {filtered.map((task) => <TaskCard key={task.id} task={task} role={role} canDelete={canDelete} isPending={isPending} onStatus={handleStatusChange} onEdit={() => setEditingTask(task)} onDelete={() => handleDelete(task.id)} />)}
            </div>

            {/* Desktop */}
            <div className="hidden sm:block bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left px-5 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tâche</th>
                    <th className="text-left px-5 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Client</th>
                    <th className="text-center px-4 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Priorité</th>
                    <th className="text-center px-4 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Échéance</th>
                    <th className="text-center px-4 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Statut</th>
                    <th className="text-center px-4 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map((task) => {
                    const prio     = PRIORITY_CONFIG[task.priority] ?? PRIORITY_CONFIG.normale;
                    const st       = STATUS_CONFIG[task.status] ?? STATUS_CONFIG.a_faire;
                    const overdue  = isOverdue(task);
                    const waLink   = task.customer ? buildWaLink(task) : null;

                    return (
                      <tr key={task.id} className={cn("hover:bg-slate-50/50 transition-colors", overdue && "bg-red-50/30")}>
                        <td className="px-5 py-3.5 max-w-[260px]">
                          <div className="flex items-start gap-2">
                            <div className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0", prio.dot)} />
                            <div className="min-w-0">
                              <p className={cn("font-bold text-slate-700 truncate", overdue && "text-red-700")}>{task.title}</p>
                              <p className="text-[11px] text-slate-400 mt-0.5">{TASK_TYPE_LABELS[task.taskType] ?? task.taskType}</p>
                              {task.assignedAdmin && (
                                <p className="text-[10px] text-slate-400">→ {task.assignedAdmin.fullName}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          {task.customer ? (
                            <div>
                              <p className="font-semibold text-slate-700 text-xs">{task.customer.contactName}</p>
                              {task.quote && <p className="text-[10px] text-slate-400">Devis {task.quote.reference}</p>}
                              {task.order && <p className="text-[10px] text-slate-400">Cmd {task.order.reference}</p>}
                            </div>
                          ) : (
                            <span className="text-slate-300 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${prio.color}`}>{prio.label}</span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          {task.dueDate ? (
                            <span className={cn("text-xs font-semibold", overdue ? "text-red-600" : "text-slate-600")}>
                              {overdue && <AlertTriangle className="w-3 h-3 inline mr-1 -mt-0.5" />}
                              {formatDateShort(task.dueDate)}
                            </span>
                          ) : (
                            <span className="text-slate-300 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <select
                            value={task.status}
                            onChange={(e) => handleStatusChange(task, e.target.value)}
                            disabled={isPending}
                            className={`text-[10px] font-bold uppercase px-2 py-1 rounded-lg border-0 cursor-pointer focus:outline-none focus:ring-1 focus:ring-brand-primary/30 ${st.color}`}
                          >
                            <option value="a_faire">À faire</option>
                            <option value="en_cours">En cours</option>
                            <option value="terminee">Terminée</option>
                            <option value="annulee">Annulée</option>
                          </select>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center justify-center gap-1.5">
                            {task.status !== "terminee" && (
                              <button
                                onClick={() => handleStatusChange(task, "terminee")}
                                disabled={isPending}
                                title="Marquer terminée"
                                className="w-8 h-8 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 flex items-center justify-center transition-colors"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                            )}
                            {waLink && (
                              <a
                                href={waLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Envoyer WhatsApp"
                                className="w-8 h-8 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 flex items-center justify-center transition-colors"
                              >
                                <MessageCircle className="w-4 h-4" />
                              </a>
                            )}
                            <button
                              onClick={() => setEditingTask(task)}
                              title="Modifier"
                              className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            {canDelete && (
                              <button
                                onClick={() => handleDelete(task.id)}
                                disabled={isPending}
                                title="Supprimer"
                                className="w-8 h-8 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 flex items-center justify-center transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
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

// ─── Mobile card ──────────────────────────────────────────────────────────────

function TaskCard({
  task, role: _role, canDelete, isPending, onStatus, onEdit, onDelete,
}: {
  task: TaskEnriched;
  role: AdminRole;
  canDelete: boolean;
  isPending: boolean;
  onStatus: (t: TaskEnriched, s: string) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const prio    = PRIORITY_CONFIG[task.priority] ?? PRIORITY_CONFIG.normale;
  const st      = STATUS_CONFIG[task.status] ?? STATUS_CONFIG.a_faire;
  const overdue = isOverdue(task);
  const waLink  = task.customer ? buildWaLink(task) : null;

  return (
    <div className={cn("bg-white rounded-2xl border border-slate-100 p-4 space-y-3", overdue && "border-red-200 bg-red-50/20")}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className={cn("font-black text-sm", overdue ? "text-red-700" : "text-slate-800")}>{task.title}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">{TASK_TYPE_LABELS[task.taskType] ?? task.taskType}</p>
          {task.customer && (
            <p className="text-xs text-slate-500 mt-0.5">{task.customer.contactName}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase ${prio.color}`}>{prio.label}</span>
          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase ${st.color}`}>{st.label}</span>
        </div>
      </div>

      {task.dueDate && (
        <div className={cn("flex items-center gap-1.5 text-xs font-semibold", overdue ? "text-red-600" : "text-slate-500")}>
          {overdue ? <AlertTriangle className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
          Échéance : {formatDateShort(task.dueDate)}
        </div>
      )}

      <div className="flex items-center gap-2 pt-1">
        {task.status !== "terminee" && (
          <button
            onClick={() => onStatus(task, "terminee")}
            disabled={isPending}
            className="flex-1 h-9 rounded-xl bg-green-100 text-green-700 hover:bg-green-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Terminée
          </button>
        )}
        {task.status === "a_faire" && (
          <button
            onClick={() => onStatus(task, "en_cours")}
            disabled={isPending}
            className="flex-1 h-9 rounded-xl bg-blue-100 text-blue-700 hover:bg-blue-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Clock className="w-3.5 h-3.5" /> En cours
          </button>
        )}
        {waLink && (
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-xl bg-green-100 text-green-600 hover:bg-green-200 flex items-center justify-center transition-colors shrink-0"
            title="WhatsApp"
          >
            <MessageCircle className="w-4 h-4" />
          </a>
        )}
        <button
          onClick={onEdit}
          className="w-9 h-9 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors shrink-0"
          title="Modifier"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        {canDelete && (
          <button
            onClick={onDelete}
            disabled={isPending}
            className="w-9 h-9 rounded-xl bg-red-50 text-red-400 hover:bg-red-100 flex items-center justify-center transition-colors shrink-0"
            title="Supprimer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
