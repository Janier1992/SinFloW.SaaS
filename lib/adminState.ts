// CRM State Manager — SynFlow IA
// Architecture: Client → /api/crm (Next.js Server Route) → Supabase
// All Supabase operations run server-side to bypass RLS and auth issues.
// NO mock/seed data. When tables are empty, the admin manages real data.

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  service: string;
  description: string;
  status: "Nuevo" | "Contactado" | "Cotizado" | "Descartado";
  createdAt: string;
  rating?: number;
}

export interface Quote {
  id: string;
  leadId?: string;
  client: string;
  services: string;
  hoursEngineering: number;
  hoursArchitecture: number;
  hoursDevelopment: number;
  rateEngineering: number;
  rateArchitecture: number;
  rateDevelopment: number;
  subtotal: number;
  tax: number;
  taxAmount: number;
  total: number;
  status: "Pendiente" | "Proceso" | "Completado";
  createdAt: string;
}

export interface Testimonial {
  id: string;
  author: string;
  role: string;
  content: string;
  image: string;
  approved: boolean;
  rating: number;
  service: string;
}

export interface CRMConfig {
  rateEngineering: number;
  rateArchitecture: number;
  rateDevelopment: number;
  tax: number;
  notificationEmail: string;
  emailActive: boolean;
}

// ─────────────────────────────────────────────────────
// Defaults (config only — no mock lead/quote/testimonial data)
// ─────────────────────────────────────────────────────

const DEFAULT_CONFIG: CRMConfig = {
  rateEngineering: 150000,
  rateArchitecture: 120000,
  rateDevelopment: 90000,
  tax: 19,
  notificationEmail: "synflow.ia@gmail.com",
  emailActive: true,
};

// ─────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────

const isBrowser = () => typeof window !== "undefined";

export const clearLocalCRMCache = () => {
  if (!isBrowser()) return;
  ["synflow_crm_leads", "synflow_crm_quotes", "synflow_crm_testimonials", "synflow_crm_config"].forEach((k) =>
    localStorage.removeItem(k)
  );
};

// Fetch wrapper for the /api/crm server route
const crmFetch = async (action: string, data?: unknown) => {
  try {
    const res = await fetch("/api/crm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, data: data || {} }),
    });
    const json = await res.json();
    if (!res.ok || json.error) {
      console.error(`[CRM] Error en '${action}':`, json.error || `HTTP ${res.status}`);
      return null;
    }
    return json.data !== undefined ? json.data : json;
  } catch (err) {
    console.error(`[CRM] Error de red en '${action}':`, err);
    return null;
  }
};

// Row mappers DB → TypeScript interfaces

const mapDbLead = (db: Record<string, unknown>): Lead => ({
  id: db.id as string,
  name: db.name as string,
  email: db.email as string,
  phone: db.phone as string,
  company: (db.company as string) || undefined,
  service: db.service as string,
  description: db.description as string,
  status: db.status as Lead["status"],
  createdAt: (db.created_at || db.createdAt) as string,
  rating: db.rating != null ? Number(db.rating) : undefined,
});

const mapDbQuote = (db: Record<string, unknown>): Quote => {
  const subtotal = Number(db.subtotal);
  const total = Number(db.total);
  return {
    id: db.id as string,
    leadId: (db.lead_id as string) || undefined,
    client: db.client as string,
    services: db.services as string,
    hoursEngineering: Number(db.hours_engineering),
    hoursArchitecture: Number(db.hours_architecture),
    hoursDevelopment: Number(db.hours_development),
    rateEngineering: Number(db.rate_engineering),
    rateArchitecture: Number(db.rate_architecture),
    rateDevelopment: Number(db.rate_development),
    subtotal,
    tax: Number(db.tax),
    taxAmount: total - subtotal,
    total,
    status: db.status as Quote["status"],
    createdAt: (db.created_at || db.createdAt) as string,
  };
};

const mapDbTestimonial = (db: Record<string, unknown>): Testimonial => ({
  id: db.id as string,
  author: db.author as string,
  role: db.role as string,
  content: db.content as string,
  image: db.image as string,
  approved: db.approved as boolean,
  rating: Number(db.rating),
  service: db.service as string,
});

// ─────────────────────────────────────────────────────
// CRM CONFIG
// ─────────────────────────────────────────────────────

export const getCRMConfig = async (): Promise<CRMConfig> => {
  if (isBrowser()) {
    const stored = localStorage.getItem("synflow_crm_config");
    if (stored) {
      try { return JSON.parse(stored) as CRMConfig; } catch { /* ignore */ }
    }
  }
  return DEFAULT_CONFIG;
};

export const saveCRMConfig = async (config: CRMConfig): Promise<void> => {
  if (isBrowser()) {
    localStorage.setItem("synflow_crm_config", JSON.stringify(config));
    window.dispatchEvent(new Event("crm_state_updated"));
  }
};

// ─────────────────────────────────────────────────────
// LEADS
// ─────────────────────────────────────────────────────

export const getLeads = async (): Promise<Lead[]> => {
  const rows = await crmFetch("get_leads");
  if (Array.isArray(rows)) return rows.map(mapDbLead);
  return [];
};

export const addLead = async (
  leadData: Omit<Lead, "id" | "status" | "createdAt">
): Promise<Lead | null> => {
  const row = await crmFetch("add_lead", leadData);
  if (row) {
    if (isBrowser()) window.dispatchEvent(new Event("crm_state_updated"));
    return mapDbLead(row as Record<string, unknown>);
  }
  return null;
};

export const updateLead = async (lead: Lead): Promise<void> => {
  await crmFetch("update_lead", lead);
};

export const updateLeadStatus = async (id: string, status: Lead["status"]): Promise<void> => {
  await crmFetch("update_lead_status", { id, status });
};

export const deleteLead = async (id: string): Promise<void> => {
  await crmFetch("delete_lead", { id });
};

// Kept for backwards-compat — no-op
export const saveLeads = async (_leads: Lead[]): Promise<void> => { return; };

// ─────────────────────────────────────────────────────
// QUOTES
// ─────────────────────────────────────────────────────

export const getQuotes = async (): Promise<Quote[]> => {
  const rows = await crmFetch("get_quotes");
  if (Array.isArray(rows)) return rows.map(mapDbQuote);
  return [];
};

export const addQuote = async (
  quoteData: Omit<Quote, "id" | "createdAt">
): Promise<Quote | null> => {
  const row = await crmFetch("add_quote", quoteData);
  if (row) {
    if (quoteData.leadId) await updateLeadStatus(quoteData.leadId, "Cotizado");
    if (isBrowser()) window.dispatchEvent(new Event("crm_state_updated"));
    return mapDbQuote(row as Record<string, unknown>);
  }
  return null;
};

export const updateQuote = async (quote: Quote): Promise<void> => {
  await crmFetch("update_quote", quote);
};

export const updateQuoteStatus = async (id: string, status: Quote["status"]): Promise<void> => {
  await crmFetch("update_quote_status", { id, status });
};

export const deleteQuote = async (id: string): Promise<void> => {
  await crmFetch("delete_quote", { id });
};

// Kept for backwards-compat — no-op
export const saveQuotes = async (_quotes: Quote[]): Promise<void> => { return; };

// ─────────────────────────────────────────────────────
// TESTIMONIALS
// ─────────────────────────────────────────────────────

export const getTestimonials = async (): Promise<Testimonial[]> => {
  const rows = await crmFetch("get_testimonials");
  if (Array.isArray(rows)) return rows.map(mapDbTestimonial);
  return [];
};

export const getApprovedTestimonials = async (): Promise<Testimonial[]> => {
  const rows = await crmFetch("get_approved_testimonials");
  if (Array.isArray(rows)) return rows.map(mapDbTestimonial);
  return [];
};

export const addTestimonial = async (
  data: Omit<Testimonial, "id" | "approved">
): Promise<Testimonial | null> => {
  const row = await crmFetch("add_testimonial", data);
  if (row) return mapDbTestimonial(row as Record<string, unknown>);
  return null;
};

export const toggleTestimonialApproval = async (id: string): Promise<void> => {
  await crmFetch("toggle_testimonial", { id });
};

export const deleteTestimonial = async (id: string): Promise<void> => {
  await crmFetch("delete_testimonial", { id });
};

// Kept for backwards-compat — no-op
export const saveTestimonials = async (_testimonials: Testimonial[]): Promise<void> => { return; };

// ─────────────────────────────────────────────────────
// ADMIN USERS
// ─────────────────────────────────────────────────────

export const registerAdminUser = async (
  name: string,
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> => {
  const result = await crmFetch("register_admin", { name, email, password });
  if (result === null) return { success: false, error: "Error al conectar con el servidor." };
  if (result.error) return { success: false, error: result.error };
  return { success: true };
};

export const verifyAdminCredentials = async (
  email: string,
  password: string
): Promise<boolean> => {
  // Default admin account always works
  if (email === "admin@synflow.io" && (password === "admin123" || password === "admin")) return true;

  const result = await crmFetch("verify_admin", { email, password });
  return !!(result && result.success);
};
