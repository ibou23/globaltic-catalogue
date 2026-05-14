"use client";

import { useState, useTransition, useRef } from "react";
import { Upload, Trash2, ExternalLink, Loader2, FileText, Image as ImageIcon } from "lucide-react";
import {
  uploadOrderFileAction,
  deleteOrderFileAction,
  getSignedUrlAction,
} from "@/lib/actions/order-files";
import type { OrderFile, FileType } from "@/lib/types/domain";

const FILE_TYPE_OPTIONS: { value: FileType; label: string }[] = [
  { value: "fichier_client", label: "Fichier client" },
  { value: "maquette",       label: "Maquette" },
  { value: "bat_client",     label: "BAT client" },
  { value: "bat_valide",     label: "BAT validé" },
  { value: "bon_livraison",  label: "Bon de livraison" },
  { value: "facture",        label: "Facture" },
  { value: "recu",           label: "Reçu de paiement" },
  { value: "autre",          label: "Autre" },
];

const STATUS_STYLES: Record<string, string> = {
  en_attente: "bg-amber-100 text-amber-700",
  valide:     "bg-green-100 text-green-700",
  refuse:     "bg-red-100 text-red-700",
};

const STATUS_LABELS: Record<string, string> = {
  en_attente: "En attente",
  valide:     "Validé",
  refuse:     "Refusé",
};

function fileIcon(fileName: string | null) {
  if (!fileName) return <FileText className="w-4 h-4 text-slate-400" />;
  const ext = fileName.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return <FileText className="w-4 h-4 text-red-400" />;
  if (["png", "jpg", "jpeg", "webp"].includes(ext ?? ""))
    return <ImageIcon className="w-4 h-4 text-blue-400" />;
  return <FileText className="w-4 h-4 text-slate-400" />;
}

function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-SN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

interface OrderFilesSectionProps {
  orderId: string;
  initialFiles: OrderFile[];
}

export function OrderFilesSection({ orderId, initialFiles }: OrderFilesSectionProps) {
  const [files, setFiles] = useState<OrderFile[]>(initialFiles);
  const [selectedType, setSelectedType] = useState<FileType>("fichier_client");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [openingId, setOpeningId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);

    const formData = new FormData();
    formData.append("file", file);

    startTransition(async () => {
      const result = await uploadOrderFileAction(orderId, selectedType, formData);
      if (!result.data) {
        setUploadError(result.error ?? "Erreur lors de l'upload.");
      } else {
        setFiles((prev) => [result.data!, ...prev]);
      }
      // Réinitialiser l'input pour permettre un re-upload du même fichier
      if (fileInputRef.current) fileInputRef.current.value = "";
    });
  }

  function handleDelete(fileId: string) {
    setDeletingId(fileId);
    startTransition(async () => {
      const result = await deleteOrderFileAction(fileId);
      if (result.data) {
        setFiles((prev) => prev.filter((f) => f.id !== fileId));
      } else {
        setUploadError(result.error ?? "Erreur lors de la suppression.");
      }
      setDeletingId(null);
    });
  }

  function handleOpen(file: OrderFile) {
    setOpeningId(file.id);
    startTransition(async () => {
      const result = await getSignedUrlAction(file.fileUrl);
      if (result.data) {
        window.open(result.data, "_blank", "noopener,noreferrer");
      } else {
        setUploadError(result.error ?? "Impossible d'ouvrir le fichier.");
      }
      setOpeningId(null);
    });
  }

  return (
    <div>
      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
        Fichiers
      </h3>

      {/* Zone d'upload */}
      <div className="flex gap-3 mb-4">
        <select
          className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-brand-primary/50 focus:ring-1 focus:ring-brand-primary/30 transition-all bg-white"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value as FileType)}
          disabled={isPending}
        >
          {FILE_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        <label className={`shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold cursor-pointer transition-colors ${
          isPending
            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
            : "bg-brand-primary text-white hover:bg-brand-primary-dark"
        }`}>
          {isPending
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <Upload className="w-4 h-4" />}
          {isPending ? "Upload…" : "Ajouter"}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.webp"
            className="sr-only"
            disabled={isPending}
            onChange={handleFileChange}
          />
        </label>
      </div>

      <p className="text-[10px] text-slate-400 mb-4">
        PDF, PNG, JPG, WEBP — 20 Mo max
      </p>

      {uploadError && (
        <p className="text-sm font-semibold text-red-600 bg-red-50 px-4 py-3 rounded-xl mb-4">
          {uploadError}
        </p>
      )}

      {/* Liste des fichiers */}
      {files.length === 0 ? (
        <div className="text-center py-8 bg-slate-50 rounded-xl border border-slate-100">
          <FileText className="w-8 h-8 text-slate-200 mx-auto mb-2" />
          <p className="text-xs font-bold text-slate-300">Aucun fichier joint</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-3 px-4 py-3 bg-white hover:bg-slate-50/50 transition-colors"
            >
              <span className="shrink-0">{fileIcon(file.fileName)}</span>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-700 truncate">
                  {file.fileName ?? "Fichier sans nom"}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-slate-400">
                    {FILE_TYPE_OPTIONS.find((o) => o.value === file.fileType)?.label ?? file.fileType}
                  </span>
                  <span className="text-[10px] text-slate-300">·</span>
                  <span className="text-[10px] text-slate-400">
                    {formatDateShort(file.createdAt)}
                  </span>
                </div>
              </div>

              <span className={`shrink-0 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${STATUS_STYLES[file.status] ?? "bg-slate-100 text-slate-500"}`}>
                {STATUS_LABELS[file.status] ?? file.status}
              </span>

              <button
                onClick={() => handleOpen(file)}
                disabled={openingId === file.id}
                title="Voir / télécharger"
                className="shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 text-slate-500 hover:bg-blue-100 hover:text-blue-600 transition-colors disabled:opacity-40"
              >
                {openingId === file.id
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : <ExternalLink className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => handleDelete(file.id)}
                disabled={deletingId === file.id || isPending}
                title="Supprimer"
                className="shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 text-slate-500 hover:bg-red-100 hover:text-red-600 transition-colors disabled:opacity-40"
              >
                {deletingId === file.id
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : <Trash2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
