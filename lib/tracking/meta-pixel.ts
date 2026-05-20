type MetaPixelParams = Record<string, string | number | boolean | string[] | undefined>;

export interface ViewContentPayload {
  content_name: string;
  content_category: string;
  content_ids: string[];
  content_type?: string;
  currency?: string;
  value?: number;
}

export interface ContactPayload {
  content_name: string;
  content_category: string;
  source: string;
}

export interface LeadPayload {
  content_name: string;
  content_category: string;
  source: string;
}

function callFbq(event: string, name: string, params?: MetaPixelParams): void {
  if (typeof window === "undefined") return;
  if (!window.fbq) return;

  try {
    if (params) {
      window.fbq(event, name, params);
    } else {
      window.fbq(event, name);
    }
  } catch {
    // Pixel bloqué par le navigateur — silencieux
  }

  if (process.env.NODE_ENV === "development") {
    console.log(`[Meta Pixel] ${event}: ${name}`, params ?? "");
  }
}

const firedEvents = new Set<string>();

function dedupeKey(name: string, id?: string): string {
  return `${name}:${id ?? ""}`;
}

export function trackViewContent(payload: ViewContentPayload): void {
  const key = dedupeKey("ViewContent", payload.content_ids[0]);
  if (firedEvents.has(key)) return;
  firedEvents.add(key);

  callFbq("track", "ViewContent", {
    content_name: payload.content_name,
    content_category: payload.content_category,
    content_type: payload.content_type ?? "product",
    content_ids: payload.content_ids,
    ...(payload.currency && { currency: payload.currency }),
    ...(payload.value != null && { value: payload.value }),
  });
}

export function trackContact(payload: ContactPayload): void {
  callFbq("track", "Contact", {
    content_name: payload.content_name,
    content_category: payload.content_category,
    source: payload.source,
  });
}

export function trackLead(payload: LeadPayload): void {
  callFbq("track", "Lead", {
    content_name: payload.content_name,
    content_category: payload.content_category,
    source: payload.source,
  });
}

export function trackCustomEvent(name: string, params?: MetaPixelParams): void {
  callFbq("trackCustom", name, params);
}
