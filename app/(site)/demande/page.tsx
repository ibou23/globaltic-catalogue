import Image from "next/image";
import { DemandeForm } from "@/components/site/DemandeForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Formulaire de commande | GLOBAL TIC",
  description: "Remplissez ce formulaire pour nous transmettre les informations nécessaires à votre commande.",
};

export default function DemandePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <Image src="/logo.png" alt="GLOBAL TIC" width={160} height={48} className="h-12 w-auto mx-auto mb-4" />
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800">
            Formulaire de commande
          </h1>
          <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
            Remplissez ce formulaire pour nous transmettre les informations nécessaires au traitement de votre commande.
          </p>
        </div>
        <DemandeForm />
      </div>
    </main>
  );
}
