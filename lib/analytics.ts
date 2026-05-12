"use client";

// Déclarations pour TypeScript
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

/**
 * Envoie un événement de tracking à GA4 et Meta Pixel
 */
export function trackEvent(eventName: string, params: Record<string, any> = {}) {
  // 1. Google Analytics
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, params);
  }

  // 2. Meta Pixel
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("trackCustom", eventName, params);
  }

  // 3. Console log en dev pour vérification
  if (process.env.NODE_ENV === "development") {
    console.log(`[Analytics] Event: ${eventName}`, params);
  }
}

/**
 * Événements spécifiques pré-définis
 */
export const AnalyticsEvents = {
  WHATSAPP_CLICK: "whatsapp_conversion",
  PRODUCT_VIEW: "view_item",
  CALCULATION_DONE: "calculator_usage",
};
