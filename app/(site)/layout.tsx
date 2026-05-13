import { ReactNode } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { StickyWhatsApp } from "@/components/ui/StickyWhatsApp";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
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
    </>
  );
}
