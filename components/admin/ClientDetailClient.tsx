"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  MessageCircle,
  Copy,
  Check,
  FileText,
  ShoppingCart,
  Pencil,
  StickyNote,
  Save,
  X,
  Building2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  TrendingUp,
  CreditCard,
  AlertCircle,
  PackageCheck,
  Clock,
  Star,
  CheckSquare,
  Plus,
  Smile,
  Meh,
  Frown,
  AlertTriangle,
  Trash2,
  FilePlus,
} from "lucide-react";
import { DevisClientForm } from "@/components/admin/DevisClientForm";
import type { Customer, QuoteEnriched, OrderEnriched, AdminRole, TaskEnriched, AdminProfile } from "@/lib/types/domain";
import { formatPrice, formatDate, formatDateShort } from "@/lib/utils/format";
import { canPerform } from "@/lib/auth/permissions";
import { updateCustomerNotesAction, deleteCustomerAction, getCustomerLinkedCountAction } from "@/lib/actions/customers";
import { updateTaskStatusAction } from "@/lib/actions/tasks";
import { TaskForm } from "@/components/admin/TaskForm";
import { ConfirmWithWord } from "@/components/admin/ConfirmWithWord";
import { siteConfig } from "@/lib/config/site";

// ─── Labels ─────────────────────────────────────────────────────────────────

const TIER_LABELS: Record<string, { label: string; color: string }> = {
  nouveau:  { label: "Nouveau",  color: "bg-slate-100 text-slate-600" },
  regulier: { label: "Régulier", color: "bg-blue-100 text-blue-600" },
  vip:      { label: "VIP",      color: "bg-amber-100 text-amber-600" },
  premium:  { label: "Premium",  color: "bg-purple-100 text-purple-600" },
};

const CUSTOMER_TYPE_LABELS: Record<string, string> = {
  particulier: "Particulier",
  entreprise:  "Entreprise",
  revendeur:   "Revendeur",
};

const SOURCE_LABELS: Record<string, string> = {
  site:       "Site web",
  whatsapp:   "WhatsApp",
  terrain:    "Terrain",
  parrainage: "Parrainage",
  autre:      "Autre",
};

const QUOTE_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  brouillon: { label: "Brouillon",  color: "bg-slate-100 text-slate-500" },
  envoye:    { label: "Envoyé",     color: "bg-blue-100 text-blue-600" },
  accepte:   { label: "Accepté",    color: "bg-green-100 text-green-600" },
  refuse:    { label: "Refusé",     color: "bg-red-100 text-red-600" },
  expire:    { label: "Expiré",     color: "bg-slate-100 text-slate-400" },
};

const ORDER_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  en_attente:       { label: "En attente",       color: "bg-slate-100 text-slate-600" },
  confirmee:        { label: "Confirmée",         color: "bg-blue-100 text-blue-600" },
  bat_en_cours:     { label: "BAT en cours",      color: "bg-purple-100 text-purple-600" },
  bat_valide:       { label: "BAT validé",        color: "bg-indigo-100 text-indigo-600" },
  en_production:    { label: "En production",     color: "bg-amber-100 text-amber-600" },
  controle_qualite: { label: "Contrôle qualité",  color: "bg-cyan-100 text-cyan-600" },
  pret:             { label: "Prête",             color: "bg-emerald-100 text-emerald-600" },
  en_livraison:     { label: "En livraison",      color: "bg-teal-100 text-teal-600" },
  livre:            { label: "Livrée",            color: "bg-green-100 text-green-600" },
  annulee:          { label: "Annulée",           color: "bg-red-100 text-red-600" },
};

const PAYMENT_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  non_paye:  { label: "Non payé",   color: "bg-red-100 text-red-600" },
  acompte:   { label: "Acompte",    color: "bg-amber-100 text-amber-600" },
  paye:      { label: "Payé",       color: "bg-green-100 text-green-600" },
  rembourse: { label: "Remboursé",  color: "bg-slate-100 text-slate-500" },
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  wave:         "Wave",
  orange_money: "Orange Money",
  especes:      "Espèces",
  virement:     "Virement",
  cheque:       "Chèque",
};

const SATISFACTION_LABELS: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  satisfait:   { label: "Satisfait",   color: "bg-green-100 text-green-700",  icon: Smile },
  neutre:      { label: "Neutre",      color: "bg-slate-100 text-slate-600",  icon: Meh },
  insatisfait: { label: "Insatisfait", color: "bg-red-100 text-red-600",      icon: Frown },
};

const CLOSURE_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  non_cloturee: { label: "Active",      color: "bg-blue-100 text-blue-600" },
  cloturee:     { label: "Clôturée",    color: "bg-slate-100 text-slate-500" },
  satisfait:    { label: "Satisfait",   color: "bg-green-100 text-green-700" },
  reclamation:  { label: "Réclamation", color: "bg-red-100 text-red-600" },
};

// ─── WhatsApp message builders ───────────────────────────────────────────────

function buildWaLink(whatsapp: string, text?: string): string {
  const number = whatsapp.replace(/[^0-9]/g, "") || siteConfig.whatsapp;
  const url = `https://wa.me/${number}`;
  if (!text) return url;
  return `${url}?text=${encodeURIComponent(text)}`;
}

function msgDevisEnAttente(customer: Customer, quote: QuoteEnriched): string {
  return [
    `Bonjour *${customer.contactName}* 👋`,
    ``,
    `Nous avons préparé votre devis *${quote.reference}* pour un montant de *${formatPrice(quote.total)}*.`,
    ``,
    `Ce devis est disponible sur simple demande. N'hésitez pas à nous confirmer votre accord pour lancer la production.`,
    ``,
    `— *GLOBAL TIC*`,
  ].join("\n");
}

function msgSoldeRestant(customer: Customer, order: OrderEnriched): string {
  const clientTotal = order.total + (order.deliveryFee ?? 0);
  const balance = clientTotal - order.paidAmount;
  const feeStr = (order.deliveryFee ?? 0) > 0
    ? `\n(dont frais de livraison : *${(order.deliveryFee ?? 0).toLocaleString("fr-SN")} FCFA*)`
    : "";
  return [
    `Bonjour *${customer.contactName}*,`,
    ``,
    `Votre commande *${order.reference}* a un solde restant de *${formatPrice(balance)}*.${feeStr}`,
    ``,
    `Merci de régulariser votre paiement pour que nous puissions finaliser votre commande.`,
    ``,
    `— *GLOBAL TIC*`,
  ].join("\n");
}

function msgCommandePrete(customer: Customer, order: OrderEnriched): string {
  return [
    `Bonjour *${customer.contactName}* 🎉`,
    ``,
    `Bonne nouvelle ! Votre commande *${order.reference}* est prête.`,
    ``,
    `Vous pouvez venir la récupérer ou nous contacter pour organiser la livraison.`,
    ``,
    `— *GLOBAL TIC*`,
  ].join("\n");
}

function msgClientInactif(customer: Customer): string {
  return [
    `Bonjour *${customer.contactName}* 👋`,
    ``,
    `Cela fait un moment que nous n'avons pas eu de nouvelles ! Nous espérons que vous allez bien.`,
    ``,
    `N'hésitez pas à nous contacter pour vos prochains besoins en imprimerie.`,
    ``,
    `— *GLOBAL TIC*`,
  ].join("\n");
}

function msgRemerciement(customer: Customer, order: OrderEnriched): string {
  return [
    `Bonjour *${customer.contactName}* 😊`,
    ``,
    `Merci pour votre confiance ! Votre commande *${order.reference}* a bien été livrée.`,
    ``,
    `Nous espérons que vous êtes satisfait de nos services. À très bientôt !`,
    ``,
    `— *GLOBAL TIC*`,
  ].join("\n");
}

// ─── Props ───────────────────────────────────────────────────────────────────

const TASK_TYPE_LABELS: Record<string, string> = {
  relancer_devis:      "Relancer devis",
  relancer_paiement:   "Relancer paiement",
  envoyer_bat:         "Envoyer BAT",
  verifier_production: "Vérifier production",
  confirmer_livraison: "Confirmer livraison",
  appeler_client:      "Appeler client",
  autre:               "Autre",
};

const TASK_PRIORITY_COLORS: Record<string, string> = {
  basse:   "bg-slate-100 text-slate-500",
  normale: "bg-blue-100 text-blue-600",
  haute:   "bg-amber-100 text-amber-700",
  urgente: "bg-red-100 text-red-600",
};

const TASK_STATUS_COLORS: Record<string, string> = {
  a_faire:  "bg-slate-100 text-slate-600",
  en_cours: "bg-blue-100 text-blue-600",
  terminee: "bg-green-100 text-green-600",
  annulee:  "bg-slate-100 text-slate-400",
};

const TASK_STATUS_LABELS: Record<string, string> = {
  a_faire:  "À faire",
  en_cours: "En cours",
  terminee: "Terminée",
  annulee:  "Annulée",
};

interface ClientDetailClientProps {
  customer: Customer;
  quotes: QuoteEnriched[];
  orders: OrderEnriched[];
  tasks: TaskEnriched[];
  adminProfiles: AdminProfile[];
  role: AdminRole;
  canEdit: boolean;
  canDelete: boolean;
  canSeeFinances: boolean;
  canCreateTask: boolean;
}

// ─── Tabs ────────────────────────────────────────────────────────────────────

type Tab = "resume" | "devis" | "commandes" | "paiements" | "taches" | "notes";

// ─── Component ───────────────────────────────────────────────────────────────

export function ClientDetailClient({
  customer,
  quotes,
  orders,
  tasks,
  adminProfiles,
  role,
  canEdit,
  canDelete,
  canSeeFinances,
  canCreateTask,
}: ClientDetailClientProps) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("resume");
  const [copied, setCopied] = useState(false);
  const [notes, setNotes] = useState(customer.notes ?? "");
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesPending, startNotesTransition] = useTransition();
  const [notesError, setNotesError] = useState<string | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskPending, startTaskTransition] = useTransition();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteWarning, setDeleteWarning] = useState<string | undefined>(undefined);
  const [showDevisForm, setShowDevisForm] = useState(false);

  const tier = TIER_LABELS[customer.loyaltyTier] ?? TIER_LABELS.nouveau;
  const waBase = buildWaLink(customer.whatsapp);

  // Computed stats
  const totalQuotes   = quotes.length;
  const totalOrders   = orders.length;
  const totalSpent    = orders.filter((o) => o.status !== "annulee").reduce((s, o) => s + o.paidAmount, 0);
  const totalBalance  = orders
    .filter((o) => !["annulee", "livre"].includes(o.status))
    .reduce((s, o) => s + Math.max(0, o.total + (o.deliveryFee ?? 0) - o.paidAmount), 0);
  const lastOrder     = orders[0] ?? null;
  const pendingQuotes = quotes.filter((q) => ["brouillon", "envoye"].includes(q.status));
  const activeOrders  = orders.filter((o) => !["livre", "annulee"].includes(o.status));
  const hasReclamation = orders.some((o) => o.closureStatus === "reclamation");
  const hasInsatisfait = orders.some((o) => o.satisfaction === "insatisfait");

  function handleCopy() {
    navigator.clipboard.writeText(customer.whatsapp).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleTaskStatus(taskId: string, status: string) {
    startTaskTransition(async () => {
      await updateTaskStatusAction({ id: taskId, status });
      router.refresh();
    });
  }

  function handleSaveNotes() {
    setNotesError(null);
    startNotesTransition(async () => {
      const result = await updateCustomerNotesAction(customer.id, notes);
      if (result.error) {
        setNotesError(result.error);
      } else {
        setEditingNotes(false);
        router.refresh();
      }
    });
  }

  async function handleDeleteStart() {
    setDeleteWarning(undefined);
    setShowDeleteModal(true);
    const result = await getCustomerLinkedCountAction(customer.id);
    if (result.data) {
      const { quotes: q, orders: o, invoices, tasks: t } = result.data;
      const total = q + o + invoices + t;
      if (total > 0) {
        const parts: string[] = [];
        if (o > 0) parts.push(`${o} commande(s)`);
        if (q > 0) parts.push(`${q} devis`);
        if (invoices > 0) parts.push(`${invoices} facture(s)`);
        if (t > 0) parts.push(`${t} tâche(s)`);
        setDeleteWarning(
          `Ce client possède des données commerciales (${parts.join(", ")}). ` +
          `Vous pouvez corriger ses informations, mais pas le supprimer.`
        );
      }
    }
  }

  async function handleConfirmDelete() {
    const result = await deleteCustomerAction(customer.id);
    if (!result.error) {
      router.push("/admin/clients");
    }
    return result;
  }

  const TABS: { key: Tab; label: string; count?: number }[] = [
    { key: "resume",     label: "Résumé" },
    { key: "devis",      label: "Devis",     count: totalQuotes },
    { key: "commandes",  label: "Commandes", count: totalOrders },
    { key: "paiements",  label: "Paiements", count: orders.filter((o) => o.paidAmount > 0).length },
    { key: "taches",     label: "Tâches",    count: tasks.filter((t) => !["terminee", "annulee"].includes(t.status)).length },
    { key: "notes",      label: "Notes" },
  ];

  return (
    <div className="space-y-6">

      {showDevisForm && (
        <DevisClientForm
          customer={customer}
          onClose={() => setShowDevisForm(false)}
        />
      )}

      {showTaskForm && (
        <TaskForm
          adminProfiles={adminProfiles}
          customers={[customer]}
          prefill={{ customerId: customer.id }}
          onClose={() => { setShowTaskForm(false); router.refresh(); }}
        />
      )}

      {showDeleteModal && (
        <ConfirmWithWord
          title="Supprimer ce client"
          description={`Voulez-vous supprimer définitivement "${customer.contactName}" ?`}
          warning={deleteWarning}
          onConfirm={handleConfirmDelete}
          onClose={() => setShowDeleteModal(false)}
        />
      )}

      {/* Back + en-tête */}
      <div>
        <Link
          href="/admin/clients"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Retour aux clients
        </Link>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            {/* Identité */}
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-brand-primary/10 flex items-center justify-center shrink-0">
                <span className="text-xl font-black text-brand-primary">
                  {customer.contactName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-black text-slate-800 font-heading">{customer.contactName}</h1>
                  <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wide ${tier.color}`}>
                    {tier.label}
                  </span>
                </div>
                {customer.companyName && (
                  <p className="text-sm text-slate-500 font-medium mt-0.5 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5" /> {customer.companyName}
                  </p>
                )}
                <p className="text-xs text-slate-400 mt-1">
                  {CUSTOMER_TYPE_LABELS[customer.customerType] ?? customer.customerType}
                  {" · "}
                  {SOURCE_LABELS[customer.source] ?? customer.source}
                  {" · "}
                  Client depuis {formatDate(customer.createdAt)}
                </p>
              </div>
            </div>

            {/* Actions rapides */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {canEdit && (
                <button
                  onClick={() => setShowDevisForm(true)}
                  className="h-9 px-4 rounded-xl bg-brand-primary text-white hover:bg-brand-primary-dark text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <FilePlus className="w-4 h-4" /> Créer devis
                </button>
              )}
              <a
                href={waBase}
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 px-4 rounded-xl bg-green-100 text-green-700 hover:bg-green-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
                title="Ouvrir WhatsApp"
              >
                <MessageCircle className="w-4 h-4" /> WhatsApp
              </a>
              <button
                onClick={handleCopy}
                className={`h-9 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${copied ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
                title={copied ? "Copié !" : "Copier le numéro"}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copié" : customer.whatsapp}
              </button>
              {canEdit && (
                <Link
                  href={`/admin/clients/${customer.id}/modifier`}
                  className="h-9 px-3 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" /> Modifier
                </Link>
              )}
              {canDelete && (
                <button
                  onClick={handleDeleteStart}
                  className="h-9 px-3 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Supprimer
                </button>
              )}
            </div>
          </div>

          {/* Coordonnées */}
          <div className="mt-4 pt-4 border-t border-slate-50 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {customer.email && (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Mail className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                <span className="truncate">{customer.email}</span>
              </div>
            )}
            {customer.phone && (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Phone className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                <span>{customer.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <MapPin className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              <span>{customer.city}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Calendar className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              <span>{formatDateShort(customer.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      {canSeeFinances && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white rounded-2xl border border-slate-100 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                <FileText className="w-4 h-4 text-blue-500" />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Devis</span>
            </div>
            <p className="text-2xl font-black text-slate-800">{totalQuotes}</p>
            {pendingQuotes.length > 0 && (
              <p className="text-[10px] text-amber-600 font-semibold mt-1">{pendingQuotes.length} en attente</p>
            )}
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center">
                <ShoppingCart className="w-4 h-4 text-purple-500" />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Commandes</span>
            </div>
            <p className="text-2xl font-black text-slate-800">{totalOrders}</p>
            {activeOrders.length > 0 && (
              <p className="text-[10px] text-blue-600 font-semibold mt-1">{activeOrders.length} en cours</p>
            )}
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total dépensé</span>
            </div>
            <p className="text-lg font-black text-slate-800">{formatPrice(totalSpent)}</p>
            {lastOrder && (
              <p className="text-[10px] text-slate-400 font-medium mt-1">
                Dernière : {formatDateShort(lastOrder.createdAt)}
              </p>
            )}
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${totalBalance > 0 ? "bg-amber-50" : "bg-emerald-50"}`}>
                <CreditCard className={`w-4 h-4 ${totalBalance > 0 ? "text-amber-500" : "text-emerald-500"}`} />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Solde restant</span>
            </div>
            <p className={`text-lg font-black ${totalBalance > 0 ? "text-amber-600" : "text-emerald-600"}`}>
              {formatPrice(totalBalance)}
            </p>
            <p className="text-[10px] text-slate-400 font-medium mt-1">
              {totalBalance > 0 ? "À encaisser" : "Tout réglé"}
            </p>
          </div>
        </div>
      )}

      {/* Onglets */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        {/* Tab bar */}
        <div className="flex border-b border-slate-100 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-4 sm:px-5 py-3.5 text-sm font-bold whitespace-nowrap transition-colors border-b-2 -mb-px ${
                tab === t.key
                  ? "border-brand-primary text-brand-primary"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              {t.label}
              {t.count !== undefined && t.count > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${tab === t.key ? "bg-brand-primary/10 text-brand-primary" : "bg-slate-100 text-slate-400"}`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="p-5 sm:p-6">

          {/* ── Résumé ── */}
          {tab === "resume" && (
            <div className="space-y-6">
              {/* Statut global */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Statut global</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeOrders.length > 0 && (
                    <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl">
                      <Clock className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-blue-700">{activeOrders.length} commande{activeOrders.length > 1 ? "s" : ""} en cours</p>
                        <p className="text-[11px] text-blue-500 mt-0.5">
                          {activeOrders.map((o) => o.reference).join(", ")}
                        </p>
                      </div>
                    </div>
                  )}
                  {pendingQuotes.length > 0 && (
                    <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl">
                      <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-amber-700">{pendingQuotes.length} devis en attente</p>
                        <p className="text-[11px] text-amber-500 mt-0.5">
                          {pendingQuotes.map((q) => q.reference).join(", ")}
                        </p>
                      </div>
                    </div>
                  )}
                  {totalBalance > 0 && canSeeFinances && (
                    <div className="flex items-start gap-3 p-3 bg-red-50 rounded-xl">
                      <CreditCard className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-red-700">Solde à encaisser</p>
                        <p className="text-[11px] text-red-500 mt-0.5">{formatPrice(totalBalance)} restants</p>
                      </div>
                    </div>
                  )}
                  {hasReclamation && (
                    <div className="flex items-start gap-3 p-3 bg-red-50 rounded-xl">
                      <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-red-700">Réclamation en cours</p>
                        <p className="text-[11px] text-red-500 mt-0.5">Une réclamation a été enregistrée pour ce client</p>
                      </div>
                    </div>
                  )}
                  {!hasReclamation && hasInsatisfait && (
                    <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl">
                      <Frown className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-amber-700">Client insatisfait</p>
                        <p className="text-[11px] text-amber-500 mt-0.5">Satisfaction négative enregistrée sur une commande</p>
                      </div>
                    </div>
                  )}
                  {totalOrders > 0 && activeOrders.length === 0 && pendingQuotes.length === 0 && totalBalance <= 0 && !hasReclamation && !hasInsatisfait && (
                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded-xl">
                      <PackageCheck className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-green-700">Client à jour</p>
                        <p className="text-[11px] text-green-500 mt-0.5">Aucun impayé ni commande en cours</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Dernière commande */}
              {lastOrder && (
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Dernière commande</h3>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <div>
                      <p className="text-sm font-bold text-slate-700">{lastOrder.reference}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{formatDate(lastOrder.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {canSeeFinances && (
                        <span className="text-sm font-black text-slate-700">{formatPrice(lastOrder.total)}</span>
                      )}
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${ORDER_STATUS_LABELS[lastOrder.status]?.color ?? "bg-slate-100 text-slate-500"}`}>
                        {ORDER_STATUS_LABELS[lastOrder.status]?.label ?? lastOrder.status}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Relances WhatsApp */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Relances WhatsApp</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {pendingQuotes[0] && (
                    <a
                      href={buildWaLink(customer.whatsapp, msgDevisEnAttente(customer, pendingQuotes[0]))}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 rounded-xl border border-slate-100 hover:border-green-200 hover:bg-green-50 transition-colors text-xs font-semibold text-slate-600 hover:text-green-700"
                    >
                      <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                      Relance devis en attente
                    </a>
                  )}
                  {orders.find((o) => o.total + (o.deliveryFee ?? 0) - o.paidAmount > 0 && !["annulee", "livre"].includes(o.status)) && canSeeFinances && (
                    <a
                      href={buildWaLink(customer.whatsapp, msgSoldeRestant(customer, orders.find((o) => o.total + (o.deliveryFee ?? 0) - o.paidAmount > 0 && !["annulee", "livre"].includes(o.status))!))}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 rounded-xl border border-slate-100 hover:border-green-200 hover:bg-green-50 transition-colors text-xs font-semibold text-slate-600 hover:text-green-700"
                    >
                      <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                      Relance solde restant
                    </a>
                  )}
                  {orders.find((o) => o.status === "pret") && (
                    <a
                      href={buildWaLink(customer.whatsapp, msgCommandePrete(customer, orders.find((o) => o.status === "pret")!))}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 rounded-xl border border-slate-100 hover:border-green-200 hover:bg-green-50 transition-colors text-xs font-semibold text-slate-600 hover:text-green-700"
                    >
                      <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                      Commande prête — venir récupérer
                    </a>
                  )}
                  {orders.find((o) => o.status === "livre") && (
                    <a
                      href={buildWaLink(customer.whatsapp, msgRemerciement(customer, orders.find((o) => o.status === "livre")!))}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 rounded-xl border border-slate-100 hover:border-green-200 hover:bg-green-50 transition-colors text-xs font-semibold text-slate-600 hover:text-green-700"
                    >
                      <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                      Remerciement après livraison
                    </a>
                  )}
                  <a
                    href={buildWaLink(customer.whatsapp, msgClientInactif(customer))}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 rounded-xl border border-slate-100 hover:border-green-200 hover:bg-green-50 transition-colors text-xs font-semibold text-slate-600 hover:text-green-700"
                  >
                    <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                    Client inactif — reprendre contact
                  </a>
                  <Link
                    href={`/admin/devis?client=${encodeURIComponent(customer.whatsapp)}`}
                    className="flex items-center gap-2 p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-colors text-xs font-semibold text-slate-600 hover:text-blue-700"
                  >
                    <FileText className="w-3.5 h-3.5 shrink-0" />
                    Voir tous ses devis
                  </Link>
                  <Link
                    href={`/admin/commandes?client=${encodeURIComponent(customer.whatsapp)}`}
                    className="flex items-center gap-2 p-3 rounded-xl border border-slate-100 hover:border-brand-primary/30 hover:bg-brand-primary/5 transition-colors text-xs font-semibold text-slate-600 hover:text-brand-primary"
                  >
                    <ShoppingCart className="w-3.5 h-3.5 shrink-0" />
                    Voir toutes ses commandes
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* ── Devis ── */}
          {tab === "devis" && (
            <div>
              {quotes.length === 0 ? (
                <EmptyState icon={FileText} label="Aucun devis pour ce client" />
              ) : (
                <div className="space-y-2">
                  {quotes.map((q) => {
                    const st = QUOTE_STATUS_LABELS[q.status] ?? { label: q.status, color: "bg-slate-100 text-slate-500" };
                    return (
                      <div key={q.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-700">{q.reference}</span>
                            {q.isUrgent && <span className="text-[9px] px-1.5 py-0.5 bg-red-100 text-red-600 font-bold rounded uppercase">Urgent</span>}
                          </div>
                          {q.firstItem && (
                            <p className="text-xs text-slate-500 mt-0.5 truncate">{q.firstItem.productName}</p>
                          )}
                          <p className="text-[11px] text-slate-400 mt-0.5">{formatDateShort(q.createdAt)}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {canSeeFinances && (
                            <span className="text-sm font-black text-slate-700">{formatPrice(q.total)}</span>
                          )}
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${st.color}`}>{st.label}</span>
                          <a
                            href={buildWaLink(customer.whatsapp, msgDevisEnAttente(customer, q))}
                            target="_blank" rel="noopener noreferrer"
                            className="w-7 h-7 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 flex items-center justify-center transition-colors"
                            title="Envoyer ce devis par WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── Commandes ── */}
          {tab === "commandes" && (
            <div>
              {orders.length === 0 ? (
                <EmptyState icon={ShoppingCart} label="Aucune commande pour ce client" />
              ) : (
                <div className="space-y-2">
                  {orders.map((o) => {
                    const st = ORDER_STATUS_LABELS[o.status] ?? { label: o.status, color: "bg-slate-100 text-slate-500" };
                    const balance = o.total + (o.deliveryFee ?? 0) - o.paidAmount;
                    const satCfg = o.satisfaction ? SATISFACTION_LABELS[o.satisfaction] : null;
                    const SatIcon = satCfg?.icon;
                    const closureCfg = o.closureStatus !== "non_cloturee" ? CLOSURE_STATUS_LABELS[o.closureStatus] : null;
                    return (
                      <div key={o.id} className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors space-y-2">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-bold text-slate-700">{o.reference}</span>
                              {closureCfg && (
                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${closureCfg.color}`}>{closureCfg.label}</span>
                              )}
                              {o.closureStatus === "reclamation" && (
                                <AlertTriangle className="w-3 h-3 text-red-500" />
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5">{formatDateShort(o.createdAt)}</p>
                            {canSeeFinances && balance > 0 && o.status !== "annulee" && (
                              <p className="text-[11px] text-amber-600 font-semibold mt-0.5">Solde : {formatPrice(balance)}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {canSeeFinances && (
                              <span className="text-sm font-black text-slate-700">{formatPrice(o.total)}</span>
                            )}
                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${st.color}`}>{st.label}</span>
                          </div>
                        </div>
                        {satCfg && SatIcon && (
                          <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold ${satCfg.color}`}>
                            <SatIcon className="w-3.5 h-3.5 shrink-0" />
                            {satCfg.label}
                            {o.customerComment && (
                              <span className="ml-1 text-[10px] font-normal opacity-75 truncate max-w-[200px]">— {o.customerComment}</span>
                            )}
                          </div>
                        )}
                        {o.complaint && (
                          <p className="text-[11px] text-red-600 font-medium px-2.5">Réclamation : {o.complaint}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── Paiements ── */}
          {tab === "paiements" && (
            <div>
              {!canSeeFinances ? (
                <div className="py-8 text-center">
                  <CreditCard className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-300">Accès restreint aux informations financières</p>
                </div>
              ) : orders.filter((o) => o.paidAmount > 0).length === 0 ? (
                <EmptyState icon={CreditCard} label="Aucun paiement enregistré" />
              ) : (
                <div className="space-y-2">
                  {orders
                    .filter((o) => o.paidAmount > 0)
                    .map((o) => {
                      const ps = PAYMENT_STATUS_LABELS[o.paymentStatus] ?? { label: o.paymentStatus, color: "bg-slate-100 text-slate-500" };
                      return (
                        <div key={o.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50">
                          <div className="min-w-0">
                            <span className="text-sm font-bold text-slate-700">{o.reference}</span>
                            {o.paymentMethod && (
                              <p className="text-xs text-slate-500 mt-0.5">{PAYMENT_METHOD_LABELS[o.paymentMethod] ?? o.paymentMethod}</p>
                            )}
                            {o.paymentReference && (
                              <p className="text-[11px] text-slate-400 mt-0.5">Réf. : {o.paymentReference}</p>
                            )}
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {formatDateShort(o.lastPaymentAt ?? o.createdAt)}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-black text-green-600">{formatPrice(o.paidAmount)}</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">/ {formatPrice(o.total)}</p>
                            <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${ps.color}`}>{ps.label}</span>
                          </div>
                        </div>
                      );
                    })}
                  {/* Total */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total encaissé</span>
                    <span className="text-base font-black text-slate-800">{formatPrice(totalSpent)}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Tâches ── */}
          {tab === "taches" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5" /> Tâches liées à ce client
                </h3>
                {canCreateTask && (
                  <button
                    onClick={() => setShowTaskForm(true)}
                    className="h-8 px-3 rounded-lg bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3 h-3" /> Nouvelle tâche
                  </button>
                )}
              </div>

              {tasks.length === 0 ? (
                <div className="py-8 text-center bg-slate-50 rounded-xl">
                  <CheckSquare className="w-7 h-7 text-slate-200 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-300">Aucune tâche pour ce client</p>
                  {canCreateTask && (
                    <button onClick={() => setShowTaskForm(true)} className="mt-2 text-xs font-bold text-brand-primary hover:underline">
                      Créer une tâche
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {tasks.map((t) => (
                    <div key={t.id} className="flex items-start justify-between gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-700">{t.title}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{TASK_TYPE_LABELS[t.taskType] ?? t.taskType}</p>
                        {t.dueDate && (
                          <p className="text-[11px] text-slate-400 mt-0.5">Échéance : {formatDateShort(t.dueDate)}</p>
                        )}
                        {t.assignedAdmin && (
                          <p className="text-[10px] text-slate-400 mt-0.5">→ {t.assignedAdmin.fullName}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase ${TASK_PRIORITY_COLORS[t.priority] ?? ""}`}>
                          {t.priority}
                        </span>
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase ${TASK_STATUS_COLORS[t.status] ?? ""}`}>
                          {TASK_STATUS_LABELS[t.status] ?? t.status}
                        </span>
                        {t.status !== "terminee" && (
                          <button
                            onClick={() => handleTaskStatus(t.id, "terminee")}
                            disabled={taskPending}
                            className="w-7 h-7 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 flex items-center justify-center transition-colors"
                            title="Marquer terminée"
                          >
                            <CheckSquare className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Notes ── */}
          {tab === "notes" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <StickyNote className="w-3.5 h-3.5" /> Notes internes
                </h3>
                {canEdit && !editingNotes && (
                  <button
                    onClick={() => setEditingNotes(true)}
                    className="h-8 px-3 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Pencil className="w-3 h-3" /> Modifier
                  </button>
                )}
              </div>

              {editingNotes ? (
                <div className="space-y-3">
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={6}
                    maxLength={2000}
                    placeholder="Notes internes sur ce client…"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-brand-primary/50 focus:ring-1 focus:ring-brand-primary/30 transition-all resize-none"
                  />
                  {notesError && (
                    <p className="text-xs text-red-500 font-semibold">{notesError}</p>
                  )}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSaveNotes}
                      disabled={notesPending}
                      className="h-9 px-4 rounded-xl bg-brand-primary text-white text-xs font-bold flex items-center gap-1.5 hover:bg-brand-primary-dark transition-colors disabled:opacity-50"
                    >
                      <Save className="w-3.5 h-3.5" />
                      {notesPending ? "Sauvegarde…" : "Sauvegarder"}
                    </button>
                    <button
                      onClick={() => { setEditingNotes(false); setNotes(customer.notes ?? ""); setNotesError(null); }}
                      className="h-9 px-3 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" /> Annuler
                    </button>
                    <span className="text-[10px] text-slate-400 ml-auto">{notes.length}/2000</span>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 rounded-xl p-4 min-h-[80px]">
                  {customer.notes ? (
                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{customer.notes}</p>
                  ) : (
                    <p className="text-xs text-slate-300 italic">Aucune note interne pour ce client.</p>
                  )}
                </div>
              )}

              <div className="pt-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5" /> Fidélité &amp; profil
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-slate-50 rounded-xl p-3">
                    <p className="text-slate-400 font-semibold mb-1">Type</p>
                    <p className="font-bold text-slate-700">{CUSTOMER_TYPE_LABELS[customer.customerType] ?? customer.customerType}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3">
                    <p className="text-slate-400 font-semibold mb-1">Source</p>
                    <p className="font-bold text-slate-700">{SOURCE_LABELS[customer.source] ?? customer.source}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3">
                    <p className="text-slate-400 font-semibold mb-1">Fidélité</p>
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase ${tier.color}`}>{tier.label}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Helper ──────────────────────────────────────────────────────────────────

function EmptyState({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="py-10 text-center">
      <Icon className="w-8 h-8 text-slate-200 mx-auto mb-2" />
      <p className="text-xs font-bold text-slate-300">{label}</p>
    </div>
  );
}
