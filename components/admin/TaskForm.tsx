"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { X, Loader2, Save } from "lucide-react";
import { createTaskAction, updateTaskAction } from "@/lib/actions/tasks";
import type { TaskEnriched, TaskType, TaskPriority, TaskStatus, AdminProfile, Customer } from "@/lib/types/domain";

const inputClass =
  "w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-brand-primary/50 focus:ring-1 focus:ring-brand-primary/30 transition-all bg-white";
const labelClass = "block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5";

const TASK_TYPE_OPTIONS = [
  { value: "relancer_devis",       label: "Relancer devis" },
  { value: "relancer_paiement",    label: "Relancer paiement / solde" },
  { value: "envoyer_bat",          label: "Envoyer BAT" },
  { value: "verifier_production",  label: "Vérifier production" },
  { value: "confirmer_livraison",  label: "Confirmer livraison" },
  { value: "appeler_client",       label: "Appeler client" },
  { value: "autre",                label: "Autre" },
];

const PRIORITY_OPTIONS = [
  { value: "basse",    label: "Basse",    color: "text-slate-500" },
  { value: "normale",  label: "Normale",  color: "text-blue-600" },
  { value: "haute",    label: "Haute",    color: "text-amber-600" },
  { value: "urgente",  label: "Urgente",  color: "text-red-600" },
];

interface TaskFormProps {
  task?: TaskEnriched;
  adminProfiles: AdminProfile[];
  customers?: Customer[];
  prefill?: {
    customerId?: string;
    quoteId?: string;
    orderId?: string;
    taskType?: string;
    title?: string;
  };
  onClose: () => void;
}

export function TaskForm({ task, adminProfiles, customers = [], prefill, onClose }: TaskFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle]           = useState(task?.title ?? prefill?.title ?? "");
  const [description, setDesc]      = useState(task?.description ?? "");
  const [taskType, setTaskType]     = useState<TaskType>((task?.taskType ?? prefill?.taskType ?? "autre") as TaskType);
  const [priority, setPriority]     = useState<TaskPriority>(task?.priority ?? "normale");
  const [status, setStatus]         = useState<TaskStatus>(task?.status ?? "a_faire");
  const [dueDate, setDueDate]       = useState(task?.dueDate ?? "");
  const [customerId, setCustomerId] = useState(task?.customerId ?? prefill?.customerId ?? "");
  const [quoteId, setQuoteId]       = useState(task?.quoteId ?? prefill?.quoteId ?? "");
  const [orderId, setOrderId]       = useState(task?.orderId ?? prefill?.orderId ?? "");
  const [assignedTo, setAssignedTo] = useState(task?.assignedTo ?? "");

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const payload = {
        title:       title.trim(),
        description: description.trim() || null,
        task_type:   taskType as TaskEnriched["taskType"],
        priority:    priority as TaskEnriched["priority"],
        status:      status as TaskEnriched["status"],
        due_date:    dueDate || null,
        customer_id: customerId || null,
        quote_id:    quoteId || null,
        order_id:    orderId || null,
        assigned_to: assignedTo || null,
      };

      const result = task
        ? await updateTaskAction(task.id, payload)
        : await createTaskAction(payload);

      if (result.error) {
        setError(result.error);
      } else {
        onClose();
        router.refresh();
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h2 className="text-base font-black text-slate-800">
            {task ? "Modifier la tâche" : "Nouvelle tâche"}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">

          {/* Titre */}
          <div>
            <label className={labelClass}>Titre *</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} placeholder="Ex : Relancer client pour solde commande" />
          </div>

          {/* Type + Priorité */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Type</label>
              <select value={taskType} onChange={(e) => setTaskType(e.target.value as TaskType)} className={inputClass}>
                {TASK_TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Priorité</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)} className={inputClass}>
                {PRIORITY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Statut + Échéance */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Statut</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)} className={inputClass}>
                <option value="a_faire">À faire</option>
                <option value="en_cours">En cours</option>
                <option value="terminee">Terminée</option>
                <option value="annulee">Annulée</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Échéance</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={inputClass} />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className={labelClass}>Description</label>
            <textarea value={description} onChange={(e) => setDesc(e.target.value)} rows={3} maxLength={2000} className={`${inputClass} resize-none`} placeholder="Détails supplémentaires…" />
          </div>

          {/* Client */}
          {customers.length > 0 && (
            <div>
              <label className={labelClass}>Client lié</label>
              <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} className={inputClass}>
                <option value="">— Aucun client —</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.contactName}{c.companyName ? ` (${c.companyName})` : ""}</option>
                ))}
              </select>
            </div>
          )}

          {/* Assigné à */}
          {adminProfiles.length > 0 && (
            <div>
              <label className={labelClass}>Assigné à</label>
              <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} className={inputClass}>
                <option value="">— Non assigné —</option>
                {adminProfiles.map((p) => (
                  <option key={p.userId} value={p.userId}>{p.fullName} ({p.role})</option>
                ))}
              </select>
            </div>
          )}

          {error && (
            <p className="text-xs text-red-500 font-semibold bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-2 sticky bottom-0 bg-white">
          <button onClick={onClose} className="h-10 px-4 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 text-sm font-bold transition-colors">
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending || !title.trim()}
            className="h-10 px-5 rounded-xl bg-brand-primary text-white hover:bg-brand-primary-dark text-sm font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {task ? "Enregistrer" : "Créer la tâche"}
          </button>
        </div>
      </div>
    </div>
  );
}
