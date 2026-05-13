"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Lock, Mail, Loader2, ArrowRight, Printer } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Identifiants invalides. Veuillez réessayer.");
      setLoading(false);
    } else {
      router.push("/admin");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-brand-secondary flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-15%] w-[50%] h-[50%] bg-brand-primary/15 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[-15%] w-[50%] h-[50%] bg-brand-primary/10 rounded-full blur-[150px]" />
        <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-brand-primary/5 rounded-full blur-[200px]" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-[420px] relative z-10"
      >
        {/* Logo + Branding */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-primary-dark flex items-center justify-center mx-auto shadow-2xl shadow-brand-primary/30 mb-5">
              <Printer className="w-8 h-8 text-white" />
            </div>
          </Link>
          <h1 className="text-2xl font-black text-white font-heading tracking-tight">
            Espace Administration
          </h1>
          <p className="text-sm font-medium text-white/40 mt-2">
            GLOBAL TIC PrintTech — Back-office
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/[0.06] backdrop-blur-xl rounded-3xl border border-white/10 p-8 sm:p-10 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-[11px] font-bold text-white/30 uppercase tracking-[0.15em] mb-2.5 ml-1">
                Adresse email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/20 group-focus-within:text-brand-primary transition-colors">
                  <Mail className="h-4.5 w-4.5" />
                </div>
                <input
                  id="login-email"
                  type="email"
                  required
                  className="block w-full pl-12 pr-4 py-3.5 bg-white/[0.06] border border-white/10 rounded-xl text-sm font-semibold text-white placeholder:text-white/20 focus:outline-none focus:bg-white/[0.1] focus:border-brand-primary/50 focus:ring-1 focus:ring-brand-primary/30 transition-all"
                  placeholder="admin@globaltic.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-white/30 uppercase tracking-[0.15em] mb-2.5 ml-1">
                Mot de passe
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/20 group-focus-within:text-brand-primary transition-colors">
                  <Lock className="h-4.5 w-4.5" />
                </div>
                <input
                  id="login-password"
                  type="password"
                  required
                  className="block w-full pl-12 pr-4 py-3.5 bg-white/[0.06] border border-white/10 rounded-xl text-sm font-semibold text-white placeholder:text-white/20 focus:outline-none focus:bg-white/[0.1] focus:border-brand-primary/50 focus:ring-1 focus:ring-brand-primary/30 transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-red-500/10 text-red-400 p-3.5 rounded-xl text-xs font-bold flex items-center gap-2.5 border border-red-500/20"
              >
                <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse shrink-0" />
                {error}
              </motion.div>
            )}

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-brand-primary to-brand-primary-dark text-white text-sm font-black flex items-center justify-center gap-2 shadow-xl shadow-brand-primary/25 hover:shadow-2xl hover:shadow-brand-primary/35 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none disabled:translate-y-0"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Se connecter <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-[11px] font-bold text-white/20 hover:text-white/40 transition-colors inline-flex items-center gap-2"
          >
            <span>←</span> Retour au site public
          </Link>
        </div>

        <div className="mt-6 text-center">
          <p className="text-[9px] font-black uppercase tracking-[0.25em] text-white/10">
            © 2026 GLOBAL TIC GROUP
          </p>
        </div>
      </motion.div>
    </div>
  );
}
