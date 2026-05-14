"use client";

import { useState, useRef, useTransition, useCallback } from "react";
import Papa from "papaparse";
import { Upload, Download, AlertTriangle, CheckCircle2, XCircle, FileText, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import {
  importCategoriesAction,
  importProductsAction,
  importPrixAction,
} from "@/lib/actions/csv-import";
import type { ImportSummary } from "@/lib/db/csv-import";
import { CSV_PRODUCT_HEADERS, CSV_CATEGORY_HEADERS, CSV_PRIX_HEADERS } from "@/lib/validators/csv-import";

// ── Constantes modèles CSV ─────────────────────────────────────────────────

const TEMPLATES = {
  produits: {
    headers: CSV_PRODUCT_HEADERS,
    example: "carte-visite;Cartes de visite;papier-impression;Impression rapide;Cartes de visite professionnelles;;piece;3;100;oui;oui;;Cartes de visite Dakar;Impression cartes visite Dakar;10",
  },
  categories: {
    headers: CSV_CATEGORY_HEADERS,
    example: "papier-impression;Papier & Impression;Impression offset et numérique;;folder;1;oui",
  },
  prix: {
    headers: CSV_PRIX_HEADERS,
    example: "carte-visite;100;499;150;100 à 499 pièces",
  },
};

type ImportType = "produits" | "categories" | "prix";

const TABS: { id: ImportType; label: string; description: string }[] = [
  { id: "categories",  label: "Catégories",  description: "Créer ou mettre à jour des catégories par slug" },
  { id: "produits",    label: "Produits",    description: "Créer ou mettre à jour des produits par slug" },
  { id: "prix",        label: "Prix",        description: "Remplacer les tiers de prix par produit_slug" },
];

type RawRow = Record<string, string>;

interface PreviewState {
  total: number;
  rows: RawRow[];
  errors: { index: number; message: string }[];
  parseError?: string;
}

// ── Utilitaires ───────────────────────────────────────────────────────────

function downloadTemplate(type: ImportType) {
  const t = TEMPLATES[type];
  const content = [t.headers.join(";"), t.example].join("\n");
  const blob = new Blob(["﻿" + content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `modele-${type}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function parseCSV(file: File, expectedHeaders: readonly string[]): Promise<{ rows: RawRow[]; error?: string }> {
  return new Promise((resolve) => {
    if (file.size > 5 * 1024 * 1024) {
      resolve({ rows: [], error: "Fichier trop volumineux (maximum 5 Mo)." });
      return;
    }
    if (!file.name.toLowerCase().endsWith(".csv")) {
      resolve({ rows: [], error: "Seuls les fichiers .csv sont acceptés." });
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      delimiter: "",
      encoding: "UTF-8",
      transformHeader: (h) => h.trim().toLowerCase().replace(/\s+/g, "_"),
      complete: (results) => {
        const data = results.data as RawRow[];
        if (data.length === 0) {
          resolve({ rows: [], error: "Le fichier est vide ou ne contient aucune donnée." });
          return;
        }
        // Vérifier que les colonnes obligatoires sont présentes
        const headers = Object.keys(data[0]);
        const missing = expectedHeaders.slice(0, 3).filter((h) => !headers.includes(h));
        if (missing.length > 0) {
          resolve({ rows: [], error: `Colonnes manquantes : ${missing.join(", ")}. Téléchargez le modèle pour voir le format attendu.` });
          return;
        }
        resolve({ rows: data });
      },
      error: (err) => resolve({ rows: [], error: `Erreur de lecture : ${err.message}` }),
    });
  });
}

// ── Composant aperçu ──────────────────────────────────────────────────────

function PreviewPanel({ preview, type }: { preview: PreviewState; type: ImportType }) {
  const [showErrors, setShowErrors] = useState(false);
  const validCount = preview.total - preview.errors.length;
  const invalidCount = preview.errors.length;

  if (preview.parseError) {
    return (
      <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl p-4">
        <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-red-700">Erreur de lecture</p>
          <p className="text-xs text-red-600 mt-1">{preview.parseError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-50 rounded-xl p-3 text-center">
          <p className="text-2xl font-black text-slate-800">{preview.total}</p>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Lignes</p>
        </div>
        <div className="bg-emerald-50 rounded-xl p-3 text-center">
          <p className="text-2xl font-black text-emerald-700">{validCount}</p>
          <p className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider mt-0.5">Valides</p>
        </div>
        <div className={`rounded-xl p-3 text-center ${invalidCount > 0 ? "bg-red-50" : "bg-slate-50"}`}>
          <p className={`text-2xl font-black ${invalidCount > 0 ? "text-red-700" : "text-slate-400"}`}>{invalidCount}</p>
          <p className={`text-[11px] font-bold uppercase tracking-wider mt-0.5 ${invalidCount > 0 ? "text-red-500" : "text-slate-400"}`}>Erreurs</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-3 text-center">
          <p className="text-2xl font-black text-blue-700">{type === "prix" ? "~" : validCount}</p>
          <p className="text-[11px] font-bold text-blue-500 uppercase tracking-wider mt-0.5">À importer</p>
        </div>
      </div>

      {/* Avertissement si erreurs */}
      {invalidCount > 0 && (
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
            <p className="text-xs font-bold text-amber-700">
              {invalidCount} ligne{invalidCount > 1 ? "s" : ""} ignorée{invalidCount > 1 ? "s" : ""} — seules les lignes valides seront importées
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowErrors(!showErrors)}
            className="text-xs text-amber-600 font-semibold flex items-center gap-1 hover:text-amber-700"
          >
            {showErrors ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {showErrors ? "Masquer les erreurs" : "Voir les erreurs"}
          </button>
          {showErrors && (
            <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
              {preview.errors.map((e) => (
                <p key={e.index} className="text-[11px] text-amber-700 font-mono">
                  Ligne {e.index} : {e.message}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {validCount === 0 && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-3">
          <p className="text-sm font-bold text-red-700">Aucune ligne valide — vérifiez le format du fichier.</p>
        </div>
      )}
    </div>
  );
}

// ── Résumé post-import ────────────────────────────────────────────────────

function SummaryPanel({ summary, onReset }: { summary: ImportSummary; onReset: () => void }) {
  const [showDetails, setShowDetails] = useState(false);
  const total = summary.created + summary.updated + summary.skipped + summary.errors;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <p className="font-black text-slate-800 text-sm">Import terminé</p>
          <p className="text-xs text-slate-400">{total} ligne{total > 1 ? "s" : ""} traitée{total > 1 ? "s" : ""}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-emerald-50 rounded-xl p-3 text-center">
          <p className="text-xl font-black text-emerald-700">{summary.created}</p>
          <p className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider mt-0.5">Créés</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-3 text-center">
          <p className="text-xl font-black text-blue-700">{summary.updated}</p>
          <p className="text-[11px] font-bold text-blue-500 uppercase tracking-wider mt-0.5">Mis à jour</p>
        </div>
        <div className="bg-slate-50 rounded-xl p-3 text-center">
          <p className="text-xl font-black text-slate-500">{summary.skipped}</p>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Ignorés</p>
        </div>
        <div className={`rounded-xl p-3 text-center ${summary.errors > 0 ? "bg-red-50" : "bg-slate-50"}`}>
          <p className={`text-xl font-black ${summary.errors > 0 ? "text-red-700" : "text-slate-400"}`}>{summary.errors}</p>
          <p className={`text-[11px] font-bold uppercase tracking-wider mt-0.5 ${summary.errors > 0 ? "text-red-500" : "text-slate-400"}`}>Erreurs</p>
        </div>
      </div>

      {summary.errors > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-slate-500 font-semibold flex items-center gap-1 hover:text-slate-700"
          >
            {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {showDetails ? "Masquer le détail" : "Voir le détail des erreurs"}
          </button>
          {showDetails && (
            <div className="mt-2 space-y-1 max-h-40 overflow-y-auto bg-red-50 rounded-xl p-3">
              {summary.lines
                .filter((l) => l.action === "error")
                .map((l) => (
                  <p key={l.index} className="text-[11px] text-red-700 font-mono">
                    Ligne {l.index} ({l.slug}) : {l.error}
                  </p>
                ))}
            </div>
          )}
        </div>
      )}

      <button
        onClick={onReset}
        className="h-10 px-5 rounded-xl bg-brand-primary text-white text-sm font-bold hover:bg-brand-primary-dark transition-all"
      >
        Nouvel import
      </button>
    </div>
  );
}

// ── Zone de dépôt fichier ─────────────────────────────────────────────────

function DropZone({ onFile, disabled }: { onFile: (f: File) => void; disabled?: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = (f: File) => {
    if (!disabled) onFile(f);
  };

  return (
    <div
      onClick={() => !disabled && inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const f = e.dataTransfer.files[0];
        if (f) handleFile(f);
      }}
      className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
        disabled
          ? "border-slate-100 bg-slate-50 cursor-not-allowed opacity-60"
          : dragging
          ? "border-brand-primary bg-brand-primary/5"
          : "border-slate-200 hover:border-brand-primary/50 hover:bg-slate-50"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }}
        disabled={disabled}
      />
      <Upload className={`w-8 h-8 mx-auto mb-3 ${dragging ? "text-brand-primary" : "text-slate-300"}`} />
      <p className="text-sm font-bold text-slate-600">
        {dragging ? "Déposez le fichier ici" : "Cliquez ou déposez un fichier CSV"}
      </p>
      <p className="text-xs text-slate-400 mt-1">Format UTF-8, séparateur ; ou , — max 5 Mo</p>
    </div>
  );
}

// ── Onglet d'import ───────────────────────────────────────────────────────

function ImportTab({ type }: { type: ImportType }) {
  const [isPending, startTransition] = useTransition();
  const [fileName, setFileName] = useState<string | null>(null);
  const [preview, setPreview] = useState<PreviewState | null>(null);
  const [rows, setRows] = useState<RawRow[]>([]);
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const expectedHeaders = type === "produits"
    ? CSV_PRODUCT_HEADERS
    : type === "categories"
    ? CSV_CATEGORY_HEADERS
    : CSV_PRIX_HEADERS;

  const handleFile = useCallback(async (file: File) => {
    setFileName(file.name);
    setSummary(null);
    setImportError(null);
    setRows([]);
    setPreview(null);

    const { rows: parsed, error } = await parseCSV(file, expectedHeaders);

    if (error) {
      setPreview({ total: 0, rows: [], errors: [], parseError: error });
      return;
    }

    // Validation ligne par ligne côté client (réutilise les schemas Zod via Server Action)
    startTransition(async () => {
      const { previewCsvAction } = await import("@/lib/actions/csv-import");
      const result = await previewCsvAction(type, parsed);
      if (result.data) {
        setPreview({
          total: parsed.length,
          rows: parsed,
          errors: result.data.errors,
        });
        setRows(parsed);
      } else {
        setPreview({ total: 0, rows: [], errors: [], parseError: result.error ?? "Erreur de validation" });
      }
    });
  }, [type, expectedHeaders]);

  function handleImport() {
    if (rows.length === 0) return;
    setImportError(null);

    startTransition(async () => {
      const actionMap = {
        produits:   importProductsAction,
        categories: importCategoriesAction,
        prix:       importPrixAction,
      };
      const result = await actionMap[type](rows);
      if (result.data) {
        setSummary(result.data);
        setPreview(null);
        setRows([]);
        setFileName(null);
      } else {
        setImportError(result.error ?? "Erreur lors de l'import");
      }
    });
  }

  function reset() {
    setSummary(null);
    setPreview(null);
    setRows([]);
    setFileName(null);
    setImportError(null);
  }

  const validCount = preview ? preview.total - preview.errors.length : 0;
  const canImport = validCount > 0 && !isPending;

  if (summary) {
    return <SummaryPanel summary={summary} onReset={reset} />;
  }

  return (
    <div className="space-y-5">
      {/* Télécharger modèle */}
      <div className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-600">Modèle CSV {type}</span>
        </div>
        <button
          onClick={() => downloadTemplate(type)}
          className="flex items-center gap-1.5 text-xs font-bold text-brand-primary hover:text-brand-primary-dark transition-colors"
        >
          <Download className="w-3.5 h-3.5" /> Télécharger le modèle
        </button>
      </div>

      {/* Colonnes attendues */}
      <ColonnesDoc type={type} />

      {/* Zone dépôt */}
      {!preview && <DropZone onFile={handleFile} disabled={isPending} />}

      {/* Chargement */}
      {isPending && !preview && (
        <div className="flex items-center justify-center gap-2 py-4">
          <Loader2 className="w-4 h-4 animate-spin text-brand-primary" />
          <span className="text-sm text-slate-500">Analyse en cours…</span>
        </div>
      )}

      {/* Aperçu */}
      {preview && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500">
              Fichier : <span className="text-slate-700">{fileName}</span>
            </p>
            <button onClick={reset} className="text-xs text-slate-400 hover:text-slate-600 font-semibold">
              Changer de fichier
            </button>
          </div>

          <PreviewPanel preview={preview} type={type} />

          {importError && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl p-3">
              <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 font-medium">{importError}</p>
            </div>
          )}

          {validCount > 0 && (
            <div className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3">
              <p className="text-sm text-slate-600">
                <span className="font-black text-slate-800">{validCount}</span> ligne{validCount > 1 ? "s" : ""} valide{validCount > 1 ? "s" : ""} prête{validCount > 1 ? "s" : ""} à importer
                {preview.errors.length > 0 && (
                  <span className="text-amber-600"> ({preview.errors.length} ignorée{preview.errors.length > 1 ? "s" : ""})</span>
                )}
              </p>
              <button
                onClick={handleImport}
                disabled={!canImport}
                className="h-10 px-5 rounded-xl bg-brand-primary text-white text-sm font-bold flex items-center gap-2 hover:bg-brand-primary-dark transition-all disabled:opacity-60"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {isPending ? "Import en cours…" : "Confirmer l'import"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Documentation colonnes ────────────────────────────────────────────────

function ColonnesDoc({ type }: { type: ImportType }) {
  const [open, setOpen] = useState(false);

  const DOCS = {
    produits: [
      { col: "slug *",                   desc: "Identifiant unique, lettres minuscules et tirets (ex: carte-visite)" },
      { col: "nom *",                    desc: "Nom du produit" },
      { col: "categorie_slug *",         desc: "Slug de la catégorie parente (doit exister)" },
      { col: "description_courte",       desc: "Résumé court (max 500 car.)" },
      { col: "description",              desc: "Description complète" },
      { col: "image_url",                desc: "URL de l'image principale" },
      { col: "unite",                    desc: "piece | m2 | lot (défaut: piece)" },
      { col: "delai_production_jours",   desc: "Délai en jours (défaut: 3)" },
      { col: "quantite_minimale",        desc: "Quantité minimum de commande (défaut: 1)" },
      { col: "populaire",                desc: "1 / oui / true pour populaire" },
      { col: "actif",                    desc: "1 / oui / true pour actif (défaut: 1)" },
      { col: "tags",                     desc: "Tags séparés par | (ex: impression|papier)" },
      { col: "titre_seo",                desc: "Titre SEO (max 70 car.)" },
      { col: "description_seo",          desc: "Description SEO (max 160 car.)" },
      { col: "ordre_affichage",          desc: "Ordre dans la liste (défaut: 0)" },
    ],
    categories: [
      { col: "slug *",           desc: "Identifiant unique, lettres minuscules et tirets" },
      { col: "nom *",            desc: "Nom de la catégorie" },
      { col: "description",      desc: "Description (max 500 car.)" },
      { col: "image_url",        desc: "URL de l'image de catégorie" },
      { col: "icone",            desc: "Nom d'icône (ex: printer)" },
      { col: "ordre_affichage",  desc: "Ordre dans la liste (défaut: 0)" },
      { col: "actif",            desc: "1 / oui / true pour actif (défaut: 1)" },
    ],
    prix: [
      { col: "produit_slug *",  desc: "Slug du produit concerné (doit exister)" },
      { col: "quantite_min *",  desc: "Quantité minimum du palier" },
      { col: "quantite_max",    desc: "Quantité maximum (laisser vide pour illimité)" },
      { col: "prix_unitaire *", desc: "Prix unitaire en FCFA (entier)" },
      { col: "libelle",         desc: "Label du palier (ex: 100 à 499 pièces)" },
    ],
  };

  return (
    <div className="border border-slate-100 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors"
      >
        <span className="text-xs font-bold text-slate-600">Colonnes attendues (* = obligatoire)</span>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {open && (
        <div className="divide-y divide-slate-50">
          {DOCS[type].map(({ col, desc }) => (
            <div key={col} className="flex items-start gap-3 px-4 py-2.5">
              <code className="text-[11px] font-black text-brand-primary bg-brand-primary/5 px-2 py-0.5 rounded shrink-0 mt-0.5">{col}</code>
              <span className="text-xs text-slate-500">{desc}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Composant principal ────────────────────────────────────────────────────

export function ImportsClient() {
  const [activeTab, setActiveTab] = useState<ImportType>("categories");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-slate-800 font-heading tracking-tight">Import CSV</h2>
        <p className="text-sm text-slate-400 font-medium mt-1">
          Mettez à jour le catalogue en masse depuis un fichier CSV
        </p>
      </div>

      {/* Avertissement */}
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-xl p-4">
        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-700">
          <p className="font-bold mb-0.5">Import par slug — idempotent</p>
          <p>Si un slug existe déjà, la ligne sera <strong>mise à jour</strong>. Sinon, elle sera <strong>créée</strong>. Aucune donnée ne sera supprimée automatiquement. Pour les prix, tous les paliers du produit sont remplacés.</p>
        </div>
      </div>

      {/* Onglets */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-3 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Description onglet */}
      <p className="text-xs text-slate-400 -mt-2">
        {TABS.find((t) => t.id === activeTab)?.description}
      </p>

      {/* Contenu */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-6">
        <ImportTab key={activeTab} type={activeTab} />
      </div>
    </div>
  );
}
