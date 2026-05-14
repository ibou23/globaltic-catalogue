import { ShieldOff } from "lucide-react";
import Link from "next/link";

interface AccessDeniedProps {
  message?: string;
}

export function AccessDenied({ message }: AccessDeniedProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center gap-4">
      <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
        <ShieldOff className="w-8 h-8 text-red-400" />
      </div>
      <div>
        <h2 className="text-xl font-black text-slate-800">Accès non autorisé</h2>
        <p className="text-sm text-slate-400 mt-1 max-w-sm">
          {message ?? "Vous n'avez pas les droits nécessaires pour accéder à cette section."}
        </p>
      </div>
      <Link
        href="/admin"
        className="mt-2 px-4 py-2 rounded-xl bg-brand-primary text-white text-sm font-bold hover:bg-brand-primary-dark transition-colors"
      >
        Retour au dashboard
      </Link>
    </div>
  );
}
