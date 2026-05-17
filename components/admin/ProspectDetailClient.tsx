"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  MessageCircle,
  Building2,
  Globe,
  Mail,
  Phone,
  Palette,
  FileText,
  Package,
  MapPin,
  Clock,
  Trash2,
  Download,
  UserCheck,
  ClipboardList,
  Flame,
  Zap,
  Snowflake,
  HelpCircle,
  XCircle,
  Pencil,
  FilePlus,
} from "lucide-react";
import { DevisProspectForm } from "@/components/admin/DevisProspectForm";
import {
  updateProspectAction,
  deleteProspectAction,
  getProspectFileUrlAction,
  markProspectContactedAction,
  convertProspectToCustomerAction,
  createProspectTaskAction,
  getProspectLinkedEntitiesAction,
} from "@/lib/actions/prospects";
import { ConfirmWithWord } from "@/components/admin/ConfirmWithWord";
import { PROSPECT_STATUSES, PROSPECT_PRIORITIES } from "@/lib/validators/prospect";
import {
  PROSPECT_MESSAGE_LABELS,
  getProspectWhatsAppUrl,
  type ProspectMessageType,
} from "@/lib/whatsapp/prospect-messages";
import { siteConfig } from "@/lib/config/site";
import type { Prospect, ProspectFile, ProspectStatus, ProspectPriority } from "@/lib/types/domain";

const STATUS_CONFIG: Record<ProspectStatus, { label: string; color: string }> = {
  nouveau:              { label: "Nouveau",              color: "bg-blue-100 text-blue-700 border-blue-200" },
  devis_envoye:         { label: "Devis envoyé",        color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  en_negociation:       { label: "En négociation",      color: "bg-amber-100 text-amber-700 border-amber-200" },
  validation_conception:{ label: "Valid. conception",    color: "bg-purple-100 text-purple-700 border-purple-200" },
  commande_confirmee:   { label: "Commande confirmée",  color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  en_production:        { label: "En production",       color: "bg-orange-100 text-orange-700 border-orange-200" },
  livre:                { label: "Livré",               color: "bg-green-100 text-green-700 border-green-200" },
  annule:               { label: "Annulé",              color: "bg-red-100 text-red-700 border-red-200" },
};

const PRIORITY_CONFIG: Record<ProspectPriority, { label: string; color: string; icon: typeof Flame }> = {
  urgent:      { label: "Urgent",      color: "bg-red-100 text-red-700 border-red-200",    icon: Zap },
  chaud:       { label: "Chaud",       color: "bg-orange-100 text-orange-700 border-orange-200", icon: Flame },
  a_qualifier: { label: "À qualifier", color: "bg-slate-100 text-slate-600 border-slate-200", icon: HelpCircle },
  froid:       { label: "Froid",       color: "bg-blue-50 text-blue-500 border-blue-200",   icon: Snowflake },
  perdu:       { label: "Perdu",       color: "bg-gray-100 text-gray-500 border-gray-200",  icon: XCircle },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("fr-SN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface ProspectDetailClientProps {
  prospect: Prospect;
  files: ProspectFile[];
  canEdit: boolean;
  canDelete: boolean;
}

export function ProspectDetailClient({ prospect, files, canEdit, canDelete }: ProspectDetailClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<ProspectStatus>(prospect.status);
  const [priority, setPriority] = useState<ProspectPriority>(prospect.priority);
  const [notes, setNotes] = useState(prospect.internalNotes ?? "");
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [converted, setConverted] = useState(!!prospect.convertedCustomerId);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteWarning, setDeleteWarning] = useState<string | undefined>(undefined);
  const [showDevisForm, setShowDevisForm] = useState(false);

  const waNumber = prospect.whatsapp.replace(/[^0-9]/g, "") || siteConfig.whatsapp;
  const waLink = `https://wa.me/${waNumber}`;

  function handleStatusChange(newStatus: ProspectStatus) {
    setStatus(newStatus);
    startTransition(async () => {
      const result = await updateProspectAction(prospect.id, { status: newStatus });
      if (result.error) {
        setSaveMessage(result.error);
        setStatus(prospect.status);
      } else {
        setSaveMessage("Statut mis à jour");
        setTimeout(() => setSaveMessage(null), 2000);
      }
    });
  }

  function handleSaveNotes() {
    startTransition(async () => {
      const result = await updateProspectAction(prospect.id, { internal_notes: notes || null });
      if (result.error) {
        setSaveMessage(result.error);
      } else {
        setSaveMessage("Notes enregistrées");
        setTimeout(() => setSaveMessage(null), 2000);
      }
    });
  }

  async function handleDeleteStart() {
    setDeleteWarning(undefined);
    setShowDeleteModal(true);
    const result = await getProspectLinkedEntitiesAction(prospect.id);
    if (result.data) {
      const parts: string[] = [];
      if (result.data.convertedCustomerId) parts.push("un client converti (ne sera PAS supprimé)");
      if (result.data.tasks > 0) parts.push(`${result.data.tasks} tâche(s) liée(s)`);
      if (parts.length > 0) setDeleteWarning(`Ce prospect est lié à : ${parts.join(", ")}.`);
    }
  }

  async function handleConfirmDelete() {
    const result = await deleteProspectAction(prospect.id);
    if (!result.error) {
      router.push("/admin/prospects");
    }
    return result;
  }

  function handleOpenFile(file: ProspectFile) {
    startTransition(async () => {
      const result = await getProspectFileUrlAction(file.fileUrl);
      if (result.data) {
        window.open(result.data, "_blank", "noopener,noreferrer");
      }
    });
  }

  function handlePriorityChange(newPriority: ProspectPriority) {
    setPriority(newPriority);
    startTransition(async () => {
      const result = await updateProspectAction(prospect.id, { priority: newPriority });
      if (result.error) {
        setSaveMessage(result.error);
        setPriority(prospect.priority);
      } else {
        setSaveMessage("Priorité mise à jour");
        setTimeout(() => setSaveMessage(null), 2000);
      }
    });
  }

  function handleMarkContacted() {
    startTransition(async () => {
      const result = await markProspectContactedAction(prospect.id);
      if (result.error) {
        setSaveMessage(result.error);
      } else {
        setSaveMessage("Marqué comme contacté");
        setTimeout(() => setSaveMessage(null), 2000);
      }
    });
  }

  function handleConvert() {
    if (!confirm("Créer un client à partir de ce prospect ?")) return;
    startTransition(async () => {
      const result = await convertProspectToCustomerAction(prospect.id);
      if (result.error) {
        setSaveMessage(result.error);
      } else {
        setConverted(true);
        setSaveMessage("Client créé avec succès");
        setTimeout(() => setSaveMessage(null), 3000);
      }
    });
  }

  function handleCreateTask() {
    startTransition(async () => {
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      const result = await createProspectTaskAction(prospect.id, "appeler_client", `Relancer ${prospect.fullName}`, tomorrow);
      if (result.error) {
        setSaveMessage(result.error);
      } else {
        setSaveMessage("Tâche de relance créée");
        setTimeout(() => setSaveMessage(null), 2000);
      }
    });
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/prospects"
            className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-slate-800">{prospect.fullName}</h1>
            <p className="text-xs text-slate-400 font-mono">{prospect.reference}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* WhatsApp dropdown */}
          <div className="relative group">
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="h-10 px-4 rounded-xl bg-green-600 text-white text-sm font-bold hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </a>
            <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl border border-slate-100 shadow-lg py-1 z-50 hidden group-hover:block">
              {(Object.keys(PROSPECT_MESSAGE_LABELS) as ProspectMessageType[]).map(type => (
                <a
                  key={type}
                  href={getProspectWhatsAppUrl(type, prospect)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-4 py-2.5 text-xs text-slate-700 hover:bg-green-50 hover:text-green-700"
                >
                  {PROSPECT_MESSAGE_LABELS[type]}
                </a>
              ))}
            </div>
          </div>
          {canEdit && !prospect.contactedAt && (
            <button
              onClick={handleMarkContacted}
              disabled={isPending}
              className="h-10 px-4 rounded-xl bg-indigo-50 text-indigo-600 text-sm font-bold hover:bg-indigo-100 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Phone className="w-4 h-4" /> Contacté
            </button>
          )}
          {canEdit && (
            <Link
              href={`/admin/prospects/${prospect.id}/modifier`}
              className="h-10 px-4 rounded-xl bg-slate-100 text-slate-600 text-sm font-bold hover:bg-slate-200 transition-colors flex items-center gap-2"
            >
              <Pencil className="w-4 h-4" /> Modifier
            </Link>
          )}
          {canEdit && (
            <button
              onClick={() => setShowDevisForm(true)}
              disabled={isPending}
              className="h-10 px-4 rounded-xl bg-brand-primary text-white text-sm font-bold hover:bg-brand-primary-dark transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <FilePlus className="w-4 h-4" /> Créer devis
            </button>
          )}
          {canEdit && !converted && (
            <button
              onClick={handleConvert}
              disabled={isPending}
              className="h-10 px-4 rounded-xl bg-emerald-50 text-emerald-600 text-sm font-bold hover:bg-emerald-100 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <UserCheck className="w-4 h-4" /> Convertir client
            </button>
          )}
          {canEdit && (
            <button
              onClick={handleCreateTask}
              disabled={isPending}
              className="h-10 px-4 rounded-xl bg-amber-50 text-amber-600 text-sm font-bold hover:bg-amber-100 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <ClipboardList className="w-4 h-4" /> Tâche relance
            </button>
          )}
          {canDelete && (
            <button
              onClick={handleDeleteStart}
              disabled={isPending}
              className="h-10 px-4 rounded-xl bg-red-50 text-red-600 text-sm font-bold hover:bg-red-100 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" /> Supprimer
            </button>
          )}
        </div>
      </div>

      {/* Modale création devis */}
      {showDevisForm && (
        <DevisProspectForm
          prospect={prospect}
          onClose={() => setShowDevisForm(false)}
        />
      )}

      {/* Modal suppression forte */}
      {showDeleteModal && (
        <ConfirmWithWord
          title="Supprimer ce prospect"
          description={`Voulez-vous supprimer définitivement "${prospect.fullName}" ?`}
          warning={deleteWarning}
          onConfirm={handleConfirmDelete}
          onClose={() => setShowDeleteModal(false)}
        />
      )}

      {/* Feedback */}
      {saveMessage && (
        <div className="px-4 py-2 rounded-xl bg-brand-primary/10 text-brand-primary text-sm font-semibold">
          {saveMessage}
        </div>
      )}

      {/* Statut */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <h2 className="text-sm font-bold text-slate-800 mb-4">Statut commercial</h2>
        <div className="flex flex-wrap gap-2">
          {PROSPECT_STATUSES.map((s) => {
            const config = STATUS_CONFIG[s];
            const active = status === s;
            return (
              <button
                key={s}
                onClick={() => canEdit && handleStatusChange(s)}
                disabled={!canEdit || isPending}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all disabled:cursor-not-allowed ${
                  active
                    ? `${config.color} ring-2 ring-offset-1 ring-current`
                    : "bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100"
                }`}
              >
                {config.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Priorité */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <h2 className="text-sm font-bold text-slate-800 mb-4">Priorité commerciale</h2>
        <div className="flex flex-wrap gap-2">
          {PROSPECT_PRIORITIES.map((p) => {
            const config = PRIORITY_CONFIG[p];
            const PIcon = config.icon;
            const active = priority === p;
            return (
              <button
                key={p}
                onClick={() => canEdit && handlePriorityChange(p)}
                disabled={!canEdit || isPending}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all disabled:cursor-not-allowed flex items-center gap-1.5 ${
                  active
                    ? `${config.color} ring-2 ring-offset-1 ring-current`
                    : "bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100"
                }`}
              >
                <PIcon className="w-3.5 h-3.5" />
                {config.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Phone className="w-4 h-4 text-brand-primary" /> Contact
          </h2>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-slate-400 text-xs">Nom complet</dt>
              <dd className="font-semibold text-slate-700">{prospect.fullName}</dd>
            </div>
            <div>
              <dt className="text-slate-400 text-xs">WhatsApp</dt>
              <dd className="font-semibold text-slate-700">{prospect.whatsapp}</dd>
            </div>
            {prospect.phoneSecondary && (
              <div>
                <dt className="text-slate-400 text-xs">Tél. secondaire</dt>
                <dd className="text-slate-700">{prospect.phoneSecondary}</dd>
              </div>
            )}
            {prospect.email && (
              <div>
                <dt className="text-slate-400 text-xs flex items-center gap-1"><Mail className="w-3 h-3" /> Email</dt>
                <dd className="text-slate-700">{prospect.email}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* Entreprise */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-brand-primary" /> Entreprise
          </h2>
          <dl className="space-y-3 text-sm">
            {prospect.companyName && (
              <div>
                <dt className="text-slate-400 text-xs">Nom</dt>
                <dd className="font-semibold text-slate-700">{prospect.companyName}</dd>
              </div>
            )}
            {prospect.companyAddress && (
              <div>
                <dt className="text-slate-400 text-xs flex items-center gap-1"><MapPin className="w-3 h-3" /> Adresse</dt>
                <dd className="text-slate-700">{prospect.companyAddress}</dd>
              </div>
            )}
            {prospect.website && (
              <div>
                <dt className="text-slate-400 text-xs flex items-center gap-1"><Globe className="w-3 h-3" /> Site web</dt>
                <dd className="text-slate-700">
                  <a href={prospect.website} target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline">
                    {prospect.website}
                  </a>
                </dd>
              </div>
            )}
            {prospect.sector && (
              <div>
                <dt className="text-slate-400 text-xs">Secteur</dt>
                <dd className="text-slate-700">{prospect.sector}</dd>
              </div>
            )}
            {!prospect.companyName && !prospect.companyAddress && !prospect.website && !prospect.sector && (
              <p className="text-slate-300 text-xs">Aucune information entreprise</p>
            )}
          </dl>
        </div>

        {/* Conception */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Palette className="w-4 h-4 text-brand-primary" /> Conception
          </h2>
          <dl className="space-y-3 text-sm">
            {prospect.productsServices && (
              <div>
                <dt className="text-slate-400 text-xs">Produits/services de l'entreprise</dt>
                <dd className="text-slate-700 whitespace-pre-wrap">{prospect.productsServices}</dd>
              </div>
            )}
            {prospect.preferredColors && (
              <div>
                <dt className="text-slate-400 text-xs">Couleurs préférées</dt>
                <dd className="text-slate-700">{prospect.preferredColors}</dd>
              </div>
            )}
            {prospect.supportText && (
              <div>
                <dt className="text-slate-400 text-xs">Texte à mettre sur le support</dt>
                <dd className="text-slate-700 whitespace-pre-wrap">{prospect.supportText}</dd>
              </div>
            )}
            {!prospect.productsServices && !prospect.preferredColors && !prospect.supportText && (
              <p className="text-slate-300 text-xs">Aucune information conception</p>
            )}
          </dl>
        </div>

        {/* Commande */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Package className="w-4 h-4 text-brand-primary" /> Commande
          </h2>
          <dl className="space-y-3 text-sm">
            {prospect.requestedProducts.length > 0 && (
              <div>
                <dt className="text-slate-400 text-xs">Produits demandés</dt>
                <dd className="flex flex-wrap gap-1.5 mt-1">
                  {prospect.requestedProducts.map((prod) => (
                    <span key={prod} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
                      {prod}
                    </span>
                  ))}
                </dd>
              </div>
            )}
            {prospect.otherProduct && (
              <div>
                <dt className="text-slate-400 text-xs">Autre produit</dt>
                <dd className="text-slate-700">{prospect.otherProduct}</dd>
              </div>
            )}
            {prospect.quantity && (
              <div>
                <dt className="text-slate-400 text-xs">Quantité</dt>
                <dd className="text-slate-700">{prospect.quantity}</dd>
              </div>
            )}
            {prospect.formatDimensions && (
              <div>
                <dt className="text-slate-400 text-xs">Format / Dimensions</dt>
                <dd className="text-slate-700">{prospect.formatDimensions}</dd>
              </div>
            )}
            {prospect.finish && (
              <div>
                <dt className="text-slate-400 text-xs">Finition</dt>
                <dd className="text-slate-700">{prospect.finish}</dd>
              </div>
            )}
            {prospect.desiredDeadline && (
              <div>
                <dt className="text-slate-400 text-xs flex items-center gap-1"><Clock className="w-3 h-3" /> Délai souhaité</dt>
                <dd className="text-slate-700">{prospect.desiredDeadline}</dd>
              </div>
            )}
            {prospect.deliveryZone && (
              <div>
                <dt className="text-slate-400 text-xs flex items-center gap-1"><MapPin className="w-3 h-3" /> Zone de livraison</dt>
                <dd className="text-slate-700">{prospect.deliveryZone}</dd>
              </div>
            )}
            {prospect.productDetails && prospect.productDetails.length > 0 && (
              <div>
                <dt className="text-slate-400 text-xs mb-2">Détails par produit</dt>
                <dd className="space-y-2">
                  {prospect.productDetails.map((d, i) => (
                    <div key={i} className="bg-slate-50 rounded-xl p-3 text-xs space-y-1">
                      <p className="font-bold text-slate-700">{d.product}</p>
                      {d.quantity && <p className="text-slate-500">Quantité : <span className="text-slate-700">{d.quantity}</span></p>}
                      {d.format && <p className="text-slate-500">Format : <span className="text-slate-700">{d.format}</span></p>}
                      {d.dimensions && <p className="text-slate-500">Dimensions : <span className="text-slate-700">{d.dimensions}</span></p>}
                      {d.finish && <p className="text-slate-500">Finition : <span className="text-slate-700">{d.finish}</span></p>}
                      {d.colors && <p className="text-slate-500">Couleurs : <span className="text-slate-700">{d.colors}</span></p>}
                      {d.sizes && <p className="text-slate-500">Tailles : <span className="text-slate-700">{d.sizes}</span></p>}
                      {d.markingPosition && <p className="text-slate-500">Position marquage : <span className="text-slate-700">{d.markingPosition}</span></p>}
                      {d.text && <p className="text-slate-500">Texte : <span className="text-slate-700 whitespace-pre-wrap">{d.text}</span></p>}
                      {d.fileProvided && <p className="text-green-600 font-semibold">✓ Fichier fourni</p>}
                      {d.notes && <p className="text-slate-500">Notes : <span className="text-slate-700">{d.notes}</span></p>}
                    </div>
                  ))}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* Message */}
      {prospect.message && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h2 className="text-sm font-bold text-slate-800 mb-3">Message complémentaire</h2>
          <p className="text-sm text-slate-700 whitespace-pre-wrap bg-slate-50 rounded-xl p-4">
            {prospect.message}
          </p>
        </div>
      )}

      {/* Fichiers */}
      {files.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-brand-primary" /> Fichiers ({files.length})
          </h2>
          <div className="space-y-2">
            {files.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{file.fileName ?? "Fichier"}</p>
                    <p className="text-[10px] text-slate-400">
                      {file.fileType} · {file.fileSize ? `${(file.fileSize / 1024).toFixed(0)} Ko` : ""}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleOpenFile(file)}
                  disabled={isPending}
                  className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-brand-primary hover:border-brand-primary transition-colors disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes internes */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <h2 className="text-sm font-bold text-slate-800 mb-3">Notes internes</h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={!canEdit}
          placeholder="Ajouter des notes internes sur ce prospect..."
          className="w-full h-32 rounded-xl border border-slate-200 p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary disabled:bg-slate-50"
        />
        {canEdit && (
          <button
            onClick={handleSaveNotes}
            disabled={isPending}
            className="mt-3 h-9 px-4 rounded-xl bg-brand-primary text-white text-xs font-bold hover:bg-brand-primary-dark transition-colors disabled:opacity-50"
          >
            Enregistrer les notes
          </button>
        )}
      </div>

      {/* Metadata */}
      <div className="bg-slate-50 rounded-2xl p-4 text-xs text-slate-400 flex flex-wrap gap-6">
        <span>Créé le {formatDate(prospect.createdAt)}</span>
        <span>Mis à jour le {formatDate(prospect.updatedAt)}</span>
        <span>Source : {prospect.source}</span>
      </div>
    </div>
  );
}
