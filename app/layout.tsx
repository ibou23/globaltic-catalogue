import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Tracking } from "@/components/analytics/Tracking";
import Script from "next/script";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://imprimerie.globalticgroup.com"),
  title: {
    default: "GLOBAL TIC | Excellence en Impression & Communication Visuelle à Dakar",
    template: "%s | GLOBAL TIC"
  },
  description: "La plateforme d'impression leader au Sénégal. Commandez vos flyers, bâches, packaging et goodies avec un devis instantané et une qualité premium.",
  keywords: ["impression dakar", "imprimerie sénégal", "grand format dakar", "packaging dakar", "vendreplus", "global tic"],
  authors: [{ name: "GLOBAL TIC Group" }],
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
  openGraph: {
    type: "website",
    locale: "fr_SN",
    url: "https://imprimerie.globalticgroup.com",
    siteName: "GLOBAL TIC",
    title: "GLOBAL TIC | Imprimerie Premium à Dakar",
    description: "De l'offset au grand format, la solution d'impression la plus rapide et qualitative du Sénégal.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "GLOBAL TIC Imprimerie Premium",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GLOBAL TIC | Imprimerie Premium à Dakar",
    description: "Devis instantané et impression haute qualité à Dakar.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="scroll-smooth">
      <head>
        <Script 
          src="https://t.contentsquare.net/uxa/c3950e13d7005.js" 
          strategy="afterInteractive" 
        />
      </head>
      <body className={`${inter.variable} ${plusJakartaSans.variable} font-sans antialiased min-h-screen bg-slate-50 selection:bg-brand-primary/20 selection:text-brand-secondary`}>
        <Tracking />
        {children}
      </body>
    </html>
  );
}
