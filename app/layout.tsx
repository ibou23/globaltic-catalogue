import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Tracking } from "@/components/analytics/Tracking";
import { StickyWhatsApp } from "@/components/ui/StickyWhatsApp";
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
      <body className={`${inter.variable} ${plusJakartaSans.variable} font-sans antialiased min-h-screen flex flex-col bg-slate-50 selection:bg-brand-primary/20 selection:text-brand-secondary`}>
        <Tracking />
        {/* Schema.org JSON-LD for LocalBusiness SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "name": "GLOBAL TIC",
              "image": "https://imprimerie.globalticgroup.com/og-image.png",
              "@id": "https://imprimerie.globalticgroup.com",
              "url": "https://imprimerie.globalticgroup.com",
              "telephone": "+221776190419",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Dakar, Sénégal",
                "addressLocality": "Dakar",
                "addressCountry": "SN"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": 14.7167,
                "longitude": -17.4677
              },
              "openingHoursSpecification": {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": [
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday"
                ],
                "opens": "08:30",
                "closes": "18:00"
              },
              "sameAs": [
                "https://www.facebook.com/globalticgroup",
                "https://www.instagram.com/globalticgroup"
              ]
            })
          }}
        />
        <Header />
        <main className="flex-grow flex flex-col relative">
          {children}
        </main>
        <Footer />
        <StickyWhatsApp />
      </body>
    </html>
  );
}
