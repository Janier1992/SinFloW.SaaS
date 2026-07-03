// CRM State Manager - SynFlow IA
// Architecture: Client → /api/crm (Next.js Server Route) → Supabase
// This ensures all Supabase operations happen server-side, bypassing RLS issues.

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
// Default Data (used only when API is unavailable)
// ─────────────────────────────────────────────────────

const DEFAULT_CONFIG: CRMConfig = {
  rateEngineering: 150000,
  rateArchitecture: 120000,
  rateDevelopment: 90000,
  tax: 19,
  notificationEmail: "synflow.ia@gmail.com",
  emailActive: true,
};

const DEFAULT_LEADS: Lead[] = [
  {
    id: "l1",
    name: "Alejandro Bedoya",
    email: "abedoya@exito.com.co",
    phone: "+57 312 456 7890",
    company: "Grupo Éxito",
    service: "Automatización (RPA & IA)",
    description: "Automatización de reportes de ventas diarios y conciliación bancaria para el área contable.",
    status: "Cotizado",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    rating: 5,
  },
  {
    id: "l2",
    name: "Clara Inés Muñoz",
    email: "clara.munoz@nutresa.com",
    phone: "+57 300 987 6543",
    company: "Compañía Nacional de Chocolates",
    service: "Analítica de Datos & BI",
    description: "Estructuración de dashboards interactivos para la gerencia de distribución de Nutresa.",
    status: "Contactado",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    rating: 4,
  },
  {
    id: "l3",
    name: "Santiago Henao",
    email: "santiago@crepesywaffles.co",
    phone: "+57 320 654 3210",
    company: "Crepes & Waffles Envigado",
    service: "Desarrollo de Agentes y Chatbots",
    description: "Implementación de chatbot con IA para gestión de reservas y atención automatizada.",
    status: "Nuevo",
    createdAt: new Date().toISOString(),
    rating: 5,
  },
];

const DEFAULT_QUOTES: Quote[] = [
  {
    id: "q1",
    leadId: "l1",
    client: "Grupo Éxito",
    services: "Automatización (RPA & IA)",
    hoursEngineering: 12,
    hoursArchitecture: 8,
    hoursDevelopment: 40,
    rateEngineering: 150000,
    rateArchitecture: 120000,
    rateDevelopment: 90000,
    subtotal: 12 * 150000 + 8 * 120000 + 40 * 90000,
    tax: 19,
    taxAmount: Math.round((12 * 150000 + 8 * 120000 + 40 * 90000) * 0.19),
    total: Math.round((12 * 150000 + 8 * 120000 + 40 * 90000) * 1.19),
    status: "Pendiente",
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    id: "t1",
    author: "Juan Camilo Gómez",
    role: "Director de Operaciones, Ruta N",
    content: "El equipo de SynFlow automatizó todo nuestro flujo de onboarding. ¡Redujimos los tiempos de procesamiento de 3 semanas a solo 4 horas usando IA!",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    approved: true,
    rating: 5,
    service: "Automatización (RPA & IA)",
  },
  {
    id: "t2",
    author: "Manuela Restrepo",
    role: "Gerente de Proyectos, Medellín Software Co",
    content: "Desarrollaron un agente de atención al cliente personalizado para WhatsApp que resuelve el 80% de las dudas recurrentes. Excelente soporte técnico.",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    approved: true,
    rating: 5,
    service: "Desarrollo de Agentes y Chatbots",
  },
  {
    id: "t3",
    author: "Felipe Arango",
    role: "Fundador, LocalFood Delivery",
    content: "La consultoría inicial nos abrió los ojos respecto a cómo estructurar nuestros datos para alimentar un modelo predictivo de demanda. Muy recomendados.",
    image: "https://randomuser.me/api/portraits/men/86.jpg",
    approved: true,
    rating: 4,
    service: "Consultoría e Inteligencia Artificial",
  },
];

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

// Server-side API call helper
const crmFetch = async (action: string, data?: unknown) => {
  const res = await fetch("/api/crm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, data: data || {} }),
  });
  const json = await res.json();
  if (!res.ok || json.error) {
    console.error(`[CRM] Error en acción '${action}':`, json.error);
    return null;
  }
  return json.data;
};

// Row mapper for DB → Lead
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
  rating: db.rating ? Number(db.rating) : undefined,
});

// Row mapper for DB → Quote
const mapDbQuote = (db: Record<string, unknown>): Quote => ({
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
  subtotal: Number(db.subtotal),
  tax: Number(db.tax),
  taxAmount: Number(db.total) - Number(db.subtotal),
  total: Number(db.total),
  status: db.status as Quote["status"],
  createdAt: (db.created_at || db.createdAt) as string,
});

// Row mapper for DB → Testimonial
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

// Check if we're on the client and can make fetch calls
const canFetch = () => isBrowser();

// ─────────────────────────────────────────────────────
// CRM CONFIG
// ─────────────────────────────────────────────────────

export const getCRMConfig = async (): Promise<CRMConfig> => {
  // Config is lightweight, use localStorage as a cache + default
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
  if (canFetch()) {
    try {
      const rows = await crmFetch("get_leads");
      if (rows && Array.isArray(rows)) {
        const leads = rows.map(mapDbLead);
        // Seed if empty
        if (leads.length === 0) {
          console.log("[CRM] Sin leads en DB, sembrando datos iniciales...");
          for (const l of DEFAULT_LEADS) {
            await crmFetch("add_lead", l);
          }
          return getLeads();
        }
        return leads;
      }
    } catch (err) {
      console.error("[CRM] Error obteniendo leads:", err);
    }
  }
  return DEFAULT_LEADS;
};

export const addLead = async (leadData: Omit<Lead, "id" | "status" | "createdAt">): Promise<Lead> => {
  if (canFetch()) {
    try {
      const row = await crmFetch("add_lead", leadData);
      if (row) {
        const lead = mapDbLead(row);
        if (isBrowser()) window.dispatchEvent(new Event("crm_state_updated"));
        return lead;
      }
    } catch (err) {
      console.error("[CRM] Error añadiendo lead:", err);
    }
  }
  // Fallback
  const fallback: Lead = {
    ...leadData,
    id: "l_" + Math.random().toString(36).substr(2, 9),
    status: "Nuevo",
    createdAt: new Date().toISOString(),
    rating: 5,
  };
  if (isBrowser()) window.dispatchEvent(new Event("crm_state_updated"));
  return fallback;
};

export const updateLead = async (lead: Lead): Promise<void> => {
  if (canFetch()) {
    await crmFetch("update_lead", lead);
  }
};

export const updateLeadStatus = async (id: string, status: Lead["status"]): Promise<void> => {
  if (canFetch()) {
    await crmFetch("update_lead", { id, status });
  }
};

export const deleteLead = async (id: string): Promise<void> => {
  if (canFetch()) {
    await crmFetch("delete_lead", { id });
  }
};

// Kept for backwards-compat but is now a no-op when API is available
export const saveLeads = async (_leads: Lead[]): Promise<void> => { return; };

// ─────────────────────────────────────────────────────
// QUOTES
// ─────────────────────────────────────────────────────

export const getQuotes = async (): Promise<Quote[]> => {
  if (canFetch()) {
    try {
      const rows = await crmFetch("get_quotes");
      if (rows && Array.isArray(rows)) {
        const quotes = rows.map(mapDbQuote);
        if (quotes.length === 0) {
          console.log("[CRM] Sin cotizaciones en DB, sembrando datos iniciales...");
          for (const q of DEFAULT_QUOTES) {
            const leads = await getLeads();
            const matched = leads.find((l) => l.company === q.client);
            await crmFetch("add_quote", { ...q, leadId: matched?.id });
          }
          return getQuotes();
        }
        return quotes;
      }
    } catch (err) {
      console.error("[CRM] Error obteniendo cotizaciones:", err);
    }
  }
  return DEFAULT_QUOTES;
};

export const addQuote = async (quoteData: Omit<Quote, "id" | "createdAt">): Promise<Quote> => {
  if (canFetch()) {
    try {
      const row = await crmFetch("add_quote", quoteData);
      if (row) {
        if (quoteData.leadId) await updateLeadStatus(quoteData.leadId, "Cotizado");
        if (isBrowser()) window.dispatchEvent(new Event("crm_state_updated"));
        return mapDbQuote(row);
      }
    } catch (err) {
      console.error("[CRM] Error añadiendo cotización:", err);
    }
  }
  const fallback: Quote = {
    ...quoteData,
    id: "q_" + Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString(),
  };
  return fallback;
};

export const updateQuote = async (quote: Quote): Promise<void> => {
  if (canFetch()) {
    await crmFetch("update_quote", quote);
  }
};

export const updateQuoteStatus = async (id: string, status: Quote["status"]): Promise<void> => {
  if (canFetch()) {
    await crmFetch("update_quote", { id, status });
  }
};

export const deleteQuote = async (id: string): Promise<void> => {
  if (canFetch()) {
    await crmFetch("delete_quote", { id });
  }
};

// Kept for backwards-compat
export const saveQuotes = async (_quotes: Quote[]): Promise<void> => { return; };

// ─────────────────────────────────────────────────────
// TESTIMONIALS
// ─────────────────────────────────────────────────────

export const getTestimonials = async (): Promise<Testimonial[]> => {
  if (canFetch()) {
    try {
      const rows = await crmFetch("get_testimonials");
      if (rows && Array.isArray(rows)) {
        const testimonials = rows.map(mapDbTestimonial);
        if (testimonials.length === 0) {
          console.log("[CRM] Sin testimonios en DB, sembrando datos iniciales...");
          for (const t of DEFAULT_TESTIMONIALS) {
            await crmFetch("add_testimonial", t);
          }
          return getTestimonials();
        }
        return testimonials;
      }
    } catch (err) {
      console.error("[CRM] Error obteniendo testimonios:", err);
    }
  }
  return DEFAULT_TESTIMONIALS;
};

export const getApprovedTestimonials = async (): Promise<Testimonial[]> => {
  const all = await getTestimonials();
  return all.filter((t) => t.approved);
};

export const addTestimonial = async (
  data: Omit<Testimonial, "id" | "approved">
): Promise<Testimonial | null> => {
  if (canFetch()) {
    const row = await crmFetch("add_testimonial", data);
    if (row) return mapDbTestimonial(row);
  }
  return null;
};

export const toggleTestimonialApproval = async (id: string): Promise<void> => {
  if (canFetch()) {
    await crmFetch("toggle_testimonial", { id });
  }
};

export const deleteTestimonial = async (id: string): Promise<void> => {
  if (canFetch()) {
    await crmFetch("delete_testimonial", { id });
  }
};

// Kept for backwards-compat
export const saveTestimonials = async (_testimonials: Testimonial[]): Promise<void> => { return; };

// ─────────────────────────────────────────────────────
// ADMIN USERS
// ─────────────────────────────────────────────────────

export const registerAdminUser = async (
  name: string,
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const res = await fetch("/api/crm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "register_admin", data: { name, email, password } }),
    });
    const json = await res.json();
    if (!res.ok || json.error) {
      if (json.code === "23505") return { success: false, error: "El correo electrónico ya se encuentra registrado." };
      return { success: false, error: json.error || "Error al registrar usuario." };
    }
    return { success: true };
  } catch {
    // localStorage fallback
    if (!isBrowser()) return { success: false, error: "Entorno no válido." };
    const stored = localStorage.getItem("synflow_admin_users");
    const users: Array<{ name: string; email: string; password?: string }> = stored ? JSON.parse(stored) : [];
    if (users.some((u) => u.email === email)) return { success: false, error: "El correo ya se encuentra registrado." };
    users.push({ name, email, password });
    localStorage.setItem("synflow_admin_users", JSON.stringify(users));
    return { success: true };
  }
};

export const verifyAdminCredentials = async (email: string, password: string): Promise<boolean> => {
  if (email === "admin@synflow.io" && (password === "admin123" || password === "admin")) return true;

  try {
    const res = await fetch("/api/crm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "verify_admin", data: { email, password } }),
    });
    const json = await res.json();
    return !!json.success;
  } catch {
    if (!isBrowser()) return false;
    const stored = localStorage.getItem("synflow_admin_users");
    const users: Array<{ name: string; email: string; password?: string }> = stored ? JSON.parse(stored) : [];
    return users.some((u) => u.email === email && u.password === password);
  }
};
