"use client";

import { trackEvent, AnalyticsEvents } from "@/lib/analytics";
import { trackContact } from "@/lib/tracking/meta-pixel";

interface WhatsAppLinkProps {
  href: string;
  contentName: string;
  contentCategory: string;
  children: React.ReactNode;
  className?: string;
}

export function WhatsAppLink({ href, contentName, contentCategory, children, className }: WhatsAppLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={() => {
        trackEvent(AnalyticsEvents.WHATSAPP_CLICK, {
          content_name: contentName,
          location: contentCategory,
        });
        trackContact({
          content_name: contentName,
          content_category: contentCategory,
          source: "whatsapp",
        });
      }}
    >
      {children}
    </a>
  );
}
