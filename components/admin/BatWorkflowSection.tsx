"use client";

import { CheckCircle2, Clock, Send, XCircle, Zap, AlertTriangle } from "lucide-react";
import type { OrderEnriched } from "@/lib/types/domain";

type OrderStatus =
  | "en_attente" | "confirmee" | "bat_en_cours" | "bat_valide"
  | "en_production" | "controle_qualite" | "pret" | "en_livraison"
  | "livre" | "annulee";

// Dériver la phase BAT depuis le statut commande
type BatPhase = "non_prepare" | "en_cours" | "valide" | "production_ou_apres";

function getBatPhase(status: OrderStatus): BatPhase {
  if (status === "bat_en_cours") return "en_cours";
  if (status === "bat_valide") return "valide";
  if (["en_production", "controle_qualite", "pret", "en_livraison", "livre"].includes(status))
    return "production_ou_apres";
  return "non_prepare";
}

// Générateurs de liens WhatsApp BAT
function buildWaBatEnvoye(order: OrderEnriched): string | null {
  const whatsapp = order.customer?.whatsapp?.replace(/[^0-9]/g, "");
  if (!whatsapp) return null;
  const client = order.customer?.contactName ?? "client";
  const ref = order.reference;
  const lines = [
    `Bonjour *${client}*,`,
    ``,
    `Le *BAT* (Bon À Tirer) de votre commande *${ref}* est prêt pour validation.`,
    ``,
    `Merci de bien vouloir le vérifier attentivement et nous confirmer votre accord avant le lancement en production.`,
    ``,
    `*GLOBAL TIC*`,
  ];
  return `https://wa.me/${whatsapp}?text=${encodeURIComponent(lines.join("\n"))}`;
}

function buildWaBatValide(order: OrderEnriched): string | null {
  const whatsapp = order.customer?.whatsapp?.replace(/[^0-9]/g, "");
  if (!whatsapp) return null;
  const client = order.customer?.contactName ?? "client";
  const ref = order.reference;
  const lines = [
    `Bonjour *${client}*,`,
    ``,
    `Nous vous confirmons la validation du *BAT* pour votre commande *${ref}*.`,
    ``,
    `Votre commande peut maintenant passer en production.`,
    ``,
    `*GLOBAL TIC*`,
  ];
  return `https://wa.me/${whatsapp}?text=${encodeURIComponent(lines.join("\n"))}`;
}

function buildWaBatCorrections(order: OrderEnriched): string | null {
  const whatsapp = order.customer?.whatsapp?.replace(/[^0-9]/g, "");
  if (!whatsapp) return null;
  const client = order.customer?.contactName ?? "client";
  const ref = order.reference;
  const lines = [
    `Bonjour *${client}*,`,
    ``,
    `Nous avons bien pris note de vos corrections sur le BAT de la commande *${ref}*.`,
    ``,
    `Notre équipe va préparer une nouvelle version et vous la soumettre prochainement.`,
    ``,
    `*GLOBAL TIC*`,
  ];
  return `https://wa.me/${whatsapp}?text=${encodeURIComponent(lines.join("\n"))}`;
}

interface BatWorkflowSectionProps {
  order: OrderEnriched;
  currentStatus: OrderStatus;
  onStatusChange: (status: OrderStatus) => void;
}

export function BatWorkflowSection({
  order,
  currentStatus,
  onStatusChange,
}: BatWorkflowSectionProps) {
  const phase = getBatPhase(currentStatus);

  const waBatEnvoye     = buildWaBatEnvoye(order);
  const waBatValide     = buildWaBatValide(order);
  const waBatCorrections = buildWaBatCorrections(order);

  function actionBtn(
    label: string,
    icon: React.ReactNode,
    colorClass: string,
    onClick: () => void,
    waUrl?: string | null
  ) {
    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onClick}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${colorClass}`}
        >
          {icon}
          {label}
        </button>
        {waUrl && order.customer && (
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Envoyer message WhatsApp"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-green-100 text-green-700 text-xs font-bold hover:bg-green-200 transition-colors"
          >
            <Send className="w-3 h-3" />
            WA
          </a>
        )}
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
        Workflow BAT
      </h3>

      {/* Bandeau état BAT */}
      <div className={`rounded-xl px-4 py-3 mb-4 flex items-center gap-3 ${
        phase === "non_prepare"       ? "bg-slate-50 border border-slate-200" :
        phase === "en_cours"          ? "bg-amber-50 border border-amber-200" :
        phase === "valide"            ? "bg-blue-50 border border-blue-200" :
                                        "bg-emerald-50 border border-emerald-200"
      }`}>
        {phase === "non_prepare"       && <Clock        className="w-4 h-4 shrink-0 text-slate-400" />}
        {phase === "en_cours"          && <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />}
        {phase === "valide"            && <CheckCircle2  className="w-4 h-4 shrink-0 text-blue-500" />}
        {phase === "production_ou_apres" && <Zap          className="w-4 h-4 shrink-0 text-emerald-500" />}

        <div className="flex-1">
          <p className={`text-xs font-bold ${
            phase === "non_prepare"         ? "text-slate-600" :
            phase === "en_cours"            ? "text-amber-700" :
            phase === "valide"              ? "text-blue-700" :
                                              "text-emerald-700"
          }`}>
            {phase === "non_prepare"         && "BAT non préparé"}
            {phase === "en_cours"            && "BAT en cours — en attente de validation client"}
            {phase === "valide"              && "BAT validé par le client"}
            {phase === "production_ou_apres" && "BAT validé — commande en production ou livrée"}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {phase === "non_prepare"         && "Passez en « BAT en cours » pour commencer la préparation du bon à tirer."}
            {phase === "en_cours"            && "Envoyez le BAT au client, puis attendez sa validation avant de lancer la production."}
            {phase === "valide"              && "Vous pouvez maintenant lancer la production."}
            {phase === "production_ou_apres" && "Le processus BAT est terminé pour cette commande."}
          </p>
        </div>
      </div>

      {/* Actions contextuelles selon la phase */}
      <div className="flex flex-wrap gap-2">

        {/* Phase : non préparé → commencer BAT */}
        {phase === "non_prepare" && (
          actionBtn(
            "Commencer le BAT",
            <Clock className="w-3 h-3" />,
            "bg-amber-100 text-amber-700 hover:bg-amber-200",
            () => onStatusChange("bat_en_cours")
          )
        )}

        {/* Phase : en cours → envoyer / valider / corrections */}
        {phase === "en_cours" && (
          <>
            {actionBtn(
              "Envoyer au client",
              <Send className="w-3 h-3" />,
              "bg-blue-100 text-blue-700 hover:bg-blue-200",
              () => {},
              waBatEnvoye
            )}
            {actionBtn(
              "BAT validé",
              <CheckCircle2 className="w-3 h-3" />,
              "bg-green-100 text-green-700 hover:bg-green-200",
              () => onStatusChange("bat_valide"),
              waBatValide
            )}
            {actionBtn(
              "Corrections demandées",
              <XCircle className="w-3 h-3" />,
              "bg-red-100 text-red-700 hover:bg-red-200",
              () => onStatusChange("bat_en_cours"),
              waBatCorrections
            )}
          </>
        )}

        {/* Phase : validé → lancer production ou annuler validation */}
        {phase === "valide" && (
          <>
            {actionBtn(
              "Lancer en production",
              <Zap className="w-3 h-3" />,
              "bg-emerald-100 text-emerald-700 hover:bg-emerald-200",
              () => onStatusChange("en_production")
            )}
            {actionBtn(
              "Annuler validation",
              <XCircle className="w-3 h-3" />,
              "bg-slate-100 text-slate-600 hover:bg-slate-200",
              () => onStatusChange("bat_en_cours")
            )}
          </>
        )}
      </div>

      {/* Rappel si phase production_ou_apres */}
      {phase === "production_ou_apres" && (
        <p className="text-[10px] text-slate-400 italic">
          Pour modifier le BAT, repassez manuellement le statut commande sur &quot;BAT en cours&quot;.
        </p>
      )}
    </div>
  );
}
