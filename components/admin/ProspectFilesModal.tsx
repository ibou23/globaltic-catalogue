"use client";

import { useState, useEffect, useCallback } from "react";
import {
  X,
  Download,
  Eye,
  FileText,
  Image as ImageIcon,
  File,
  Loader2,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import { getProspectFilesAction, getProspectFileUrlAction, getProspectFileDownloadUrlAction } from "@/lib/actions/prospects";
import type { ProspectFile, ProspectFileType } from "@/lib/types/domain";

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatBytes(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

function isImage(file: ProspectFile): boolean {
  const ext = file.fileName?.split(".").pop()?.toLowerCase() ?? "";
  return (
    file.fileType === "logo" ||
    file.fileType === "image" ||
    ["jpg", "jpeg", "png", "webp", "gif", "svg"].includes(ext)
  );
}

function isPdf(file: ProspectFile): boolean {
  const ext = file.fileName?.split(".").pop()?.toLowerCase() ?? "";
  return file.fileType === "document" && ext === "pdf";
}

function FileTypeIcon({ file, size = 16 }: { file: ProspectFile; size?: number }) {
  const cls = `shrink-0`;
  if (isImage(file)) return <ImageIcon className={cls} style={{ width: size, height: size }} />;
  if (isPdf(file))   return <FileText  className={cls} style={{ width: size, height: size }} />;
  return                    <File      className={cls} style={{ width: size, height: size }} />;
}

function fileTypeLabel(fileType: ProspectFileType): string {
  switch (fileType) {
    case "logo":     return "Logo";
    case "image":    return "Image";
    case "document": return "Document";
    default:         return "Fichier";
  }
}

// ─── Sub-components ──────────────────────────────────────────────────────────

interface PreviewPanelProps {
  file: ProspectFile;
  signedUrl: string;
  onDownload: (file: ProspectFile) => void;
  downloading: string | null;
}

function PreviewPanel({ file, signedUrl, onDownload, downloading }: PreviewPanelProps) {
  if (isImage(file)) {
    return (
      <div className="flex flex-col items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={signedUrl}
          alt={file.fileName ?? "Aperçu"}
          className="max-w-full max-h-[55vh] rounded-xl border border-slate-100 object-contain bg-slate-50"
        />
        <button
          onClick={() => onDownload(file)}
          disabled={downloading === file.id}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-primary text-white text-sm font-bold hover:bg-brand-primary/90 transition-colors disabled:opacity-60"
        >
          {downloading === file.id
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <Download className="w-4 h-4" />}
          Télécharger
        </button>
      </div>
    );
  }

  if (isPdf(file)) {
    return (
      <div className="flex flex-col gap-3">
        <iframe
          src={`${signedUrl}#toolbar=1`}
          title={file.fileName ?? "PDF"}
          className="w-full rounded-xl border border-slate-100"
          style={{ height: "55vh" }}
        />
        <div className="flex gap-2">
          <button
            onClick={() => onDownload(file)}
            disabled={downloading === file.id}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-primary text-white text-sm font-bold hover:bg-brand-primary/90 transition-colors disabled:opacity-60"
          >
            {downloading === file.id
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Download className="w-4 h-4" />}
            Télécharger
          </button>
          <a
            href={signedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:border-slate-300 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Ouvrir dans un onglet
          </a>
        </div>
      </div>
    );
  }

  // Fichier non prévisualisable
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-10 text-slate-500">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
        <File className="w-8 h-8 text-slate-400" />
      </div>
      <div className="text-center">
        <p className="font-bold text-slate-700">{file.fileName ?? "Fichier"}</p>
        {file.fileSize && <p className="text-sm text-slate-400 mt-1">{formatBytes(file.fileSize)}</p>}
        <p className="text-xs text-slate-400 mt-1">{fileTypeLabel(file.fileType)}</p>
      </div>
      <button
        onClick={() => onDownload(file)}
        disabled={downloading === file.id}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-primary text-white text-sm font-bold hover:bg-brand-primary/90 transition-colors disabled:opacity-60"
      >
        {downloading === file.id
          ? <Loader2 className="w-4 h-4 animate-spin" />
          : <Download className="w-4 h-4" />}
        Télécharger
      </button>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

interface ProspectFilesModalProps {
  prospectId: string;
  prospectName: string;
  onClose: () => void;
}

export function ProspectFilesModal({ prospectId, prospectName, onClose }: ProspectFilesModalProps) {
  const [files, setFiles] = useState<ProspectFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<ProspectFile | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);

  // Chargement de la liste des fichiers
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getProspectFilesAction(prospectId).then((result) => {
      if (cancelled) return;
      if (result.error) {
        setError(result.error);
      } else {
        setFiles(result.data ?? []);
      }
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [prospectId]);

  // Aperçu d'un fichier
  const handlePreview = useCallback(async (file: ProspectFile) => {
    setSelectedFile(file);
    setPreviewUrl(null);
    setPreviewLoading(true);
    const result = await getProspectFileUrlAction(file.fileUrl);
    setPreviewLoading(false);
    if (result.data) setPreviewUrl(result.data);
    else setError(result.error ?? "Impossible de charger l'aperçu");
  }, []);

  // Téléchargement forcé
  const handleDownload = useCallback(async (file: ProspectFile) => {
    setDownloading(file.id);
    const result = await getProspectFileDownloadUrlAction(file.fileUrl, file.fileName);
    setDownloading(null);
    if (result.error) { setError(result.error); return; }
    const a = document.createElement("a");
    a.href = result.data!;
    a.download = file.fileName ?? "fichier";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, []);

  // Fermer avec Echap
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* En-tête */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="font-black text-slate-800">Fichiers joints</h2>
            <p className="text-sm text-slate-400 mt-0.5">{prospectName}</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Corps */}
        <div className="flex flex-1 overflow-hidden min-h-0">
          {/* Colonne gauche — liste des fichiers */}
          <div className="w-64 shrink-0 border-r border-slate-100 overflow-y-auto">
            {loading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 text-slate-300 animate-spin" />
              </div>
            )}
            {error && (
              <div className="p-4 text-sm text-red-600 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                {error}
              </div>
            )}
            {!loading && !error && files.length === 0 && (
              <p className="p-5 text-sm text-slate-400 text-center">Aucun fichier</p>
            )}
            {files.map((file) => (
              <button
                key={file.id}
                onClick={() => handlePreview(file)}
                className={`w-full text-left px-4 py-3 border-b border-slate-50 flex items-start gap-3 transition-colors hover:bg-slate-50 ${
                  selectedFile?.id === file.id ? "bg-brand-primary/5 border-l-2 border-l-brand-primary" : ""
                }`}
              >
                <div className={`mt-0.5 ${selectedFile?.id === file.id ? "text-brand-primary" : "text-slate-400"}`}>
                  <FileTypeIcon file={file} size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-700 truncate">
                    {file.fileName ?? "Sans nom"}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                    <span>{fileTypeLabel(file.fileType)}</span>
                    {file.fileSize && <span>· {formatBytes(file.fileSize)}</span>}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Colonne droite — aperçu */}
          <div className="flex-1 overflow-y-auto p-5">
            {!selectedFile && !loading && (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
                <Eye className="w-10 h-10 text-slate-200" />
                <p className="text-sm">Sélectionne un fichier pour le prévisualiser</p>
              </div>
            )}

            {selectedFile && previewLoading && (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 text-slate-300 animate-spin" />
              </div>
            )}

            {selectedFile && !previewLoading && previewUrl && (
              <PreviewPanel
                file={selectedFile}
                signedUrl={previewUrl}
                onDownload={handleDownload}
                downloading={downloading}
              />
            )}
          </div>
        </div>

        {/* Pied — nombre de fichiers */}
        {!loading && files.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 shrink-0">
            <p className="text-xs text-slate-400">
              {files.length} fichier{files.length > 1 ? "s" : ""} joint{files.length > 1 ? "s" : ""}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
