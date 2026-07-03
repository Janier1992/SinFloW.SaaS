import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Server-side Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

function getSupabase() {
  if (!supabaseUrl || !supabaseKey) return null;
  return createClient(supabaseUrl, supabaseKey);
}

// Helper to return consistent error responses
const err = (msg: string, status = 400) =>
  NextResponse.json({ error: msg }, { status });

// Row mappers
const leadToDb = (d: Record<string, unknown>) => ({
  name: d.name,
  email: d.email,
  phone: d.phone,
  company: d.company || null,
  service: d.service,
  description: d.description,
  status: (d.status as string) || "Nuevo",
  rating: d.rating != null ? Number(d.rating) : null,
});

const quoteToDb = (d: Record<string, unknown>) => ({
  lead_id: d.leadId || d.lead_id || null,
  client: d.client,
  services: d.services,
  hours_engineering: Number(d.hoursEngineering ?? d.hours_engineering ?? 0),
  hours_architecture: Number(d.hoursArchitecture ?? d.hours_architecture ?? 0),
  hours_development: Number(d.hoursDevelopment ?? d.hours_development ?? 0),
  rate_engineering: Number(d.rateEngineering ?? d.rate_engineering ?? 0),
  rate_architecture: Number(d.rateArchitecture ?? d.rate_architecture ?? 0),
  rate_development: Number(d.rateDevelopment ?? d.rate_development ?? 0),
  subtotal: Number(d.subtotal ?? 0),
  tax: Number(d.tax ?? 19),
  total: Number(d.total ?? 0),
  status: (d.status as string) || "Pendiente",
});

export async function POST(req: NextRequest) {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase no configurado. Verifica NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY." },
      { status: 500 }
    );
  }

  let body: { action: string; data: Record<string, unknown> };
  try {
    body = await req.json();
  } catch {
    return err("JSON inválido en el cuerpo de la petición", 400);
  }

  const { action, data = {} } = body;

  try {
    switch (action) {
      // ══════════════════════════════════════
      // LEADS
      // ══════════════════════════════════════

      case "get_leads": {
        const { data: rows, error } = await supabase
          .from("leads")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) return err(error.message);
        return NextResponse.json({ data: rows ?? [] });
      }

      case "add_lead": {
        const { data: inserted, error } = await supabase
          .from("leads")
          .insert([leadToDb(data)])
          .select()
          .single();
        if (error) {
          console.error("[CRM add_lead]", error);
          return err(error.message);
        }
        return NextResponse.json({ data: inserted });
      }

      case "update_lead": {
        const { error } = await supabase
          .from("leads")
          .update(leadToDb(data))
          .eq("id", data.id as string);
        if (error) return err(error.message);
        return NextResponse.json({ success: true });
      }

      case "update_lead_status": {
        const { error } = await supabase
          .from("leads")
          .update({ status: data.status })
          .eq("id", data.id as string);
        if (error) return err(error.message);
        return NextResponse.json({ success: true });
      }

      case "delete_lead": {
        const { error } = await supabase
          .from("leads")
          .delete()
          .eq("id", data.id as string);
        if (error) return err(error.message);
        return NextResponse.json({ success: true });
      }

      // ══════════════════════════════════════
      // QUOTES
      // ══════════════════════════════════════

      case "get_quotes": {
        const { data: rows, error } = await supabase
          .from("quotes")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) return err(error.message);
        return NextResponse.json({ data: rows ?? [] });
      }

      case "add_quote": {
        const { data: inserted, error } = await supabase
          .from("quotes")
          .insert([quoteToDb(data)])
          .select()
          .single();
        if (error) {
          console.error("[CRM add_quote]", error);
          return err(error.message);
        }
        // Update lead status to Cotizado if leadId is provided
        if (data.leadId || data.lead_id) {
          const leadId = (data.leadId || data.lead_id) as string;
          await supabase.from("leads").update({ status: "Cotizado" }).eq("id", leadId);
        }
        return NextResponse.json({ data: inserted });
      }

      case "update_quote": {
        const { error } = await supabase
          .from("quotes")
          .update(quoteToDb(data))
          .eq("id", data.id as string);
        if (error) return err(error.message);
        return NextResponse.json({ success: true });
      }

      case "update_quote_status": {
        const { error } = await supabase
          .from("quotes")
          .update({ status: data.status })
          .eq("id", data.id as string);
        if (error) return err(error.message);
        return NextResponse.json({ success: true });
      }

      case "delete_quote": {
        const { error } = await supabase
          .from("quotes")
          .delete()
          .eq("id", data.id as string);
        if (error) return err(error.message);
        return NextResponse.json({ success: true });
      }

      // ══════════════════════════════════════
      // TESTIMONIALS
      // ══════════════════════════════════════

      case "get_testimonials": {
        const { data: rows, error } = await supabase
          .from("testimonials")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) return err(error.message);
        return NextResponse.json({ data: rows ?? [] });
      }

      case "get_approved_testimonials": {
        const { data: rows, error } = await supabase
          .from("testimonials")
          .select("*")
          .eq("approved", true)
          .order("created_at", { ascending: false });
        if (error) return err(error.message);
        return NextResponse.json({ data: rows ?? [] });
      }

      case "add_testimonial": {
        const { data: inserted, error } = await supabase
          .from("testimonials")
          .insert([{
            author: data.author,
            role: data.role || "Cliente",
            content: data.content,
            image: data.image || "https://randomuser.me/api/portraits/men/1.jpg",
            approved: false,
            rating: Number(data.rating) || 5,
            service: data.service || "Otro / Contacto General",
          }])
          .select()
          .single();
        if (error) return err(error.message);
        return NextResponse.json({ data: inserted });
      }

      case "toggle_testimonial": {
        // Fetch current state then flip it
        const { data: current, error: fetchErr } = await supabase
          .from("testimonials")
          .select("approved")
          .eq("id", data.id as string)
          .single();
        if (fetchErr) return err(fetchErr.message);
        const { error } = await supabase
          .from("testimonials")
          .update({ approved: !current.approved })
          .eq("id", data.id as string);
        if (error) return err(error.message);
        return NextResponse.json({ success: true, approved: !current.approved });
      }

      case "delete_testimonial": {
        const { error } = await supabase
          .from("testimonials")
          .delete()
          .eq("id", data.id as string);
        if (error) return err(error.message);
        return NextResponse.json({ success: true });
      }

      // ══════════════════════════════════════
      // ADMIN USERS
      // ══════════════════════════════════════

      case "register_admin": {
        const { data: authData, error } = await supabase.auth.signUp({
          email: data.email as string,
          password: data.password as string,
          options: {
            data: {
              name: data.name as string,
            },
            emailRedirectTo: "https://synflow-ia.vercel.app/?admin=open",
          },
        });
        if (error) {
          return err(error.message);
        }
        return NextResponse.json({ success: true, user: authData.user });
      }

      case "verify_admin": {
        const { data: authData, error } = await supabase.auth.signInWithPassword({
          email: data.email as string,
          password: data.password as string,
        });
        if (error) {
          return err(error.message);
        }
        return NextResponse.json({ success: !!authData.user, user: authData.user });
      }

      // ══════════════════════════════════════
      // QUOTE EMAIL (server-side send for admin portal)
      // ══════════════════════════════════════

      case "get_lead_email": {
        const { data: lead, error } = await supabase
          .from("leads")
          .select("email, name")
          .eq("id", data.leadId as string)
          .maybeSingle();
        if (error) return err(error.message);
        return NextResponse.json({ data: lead });
      }

      default:
        return NextResponse.json({ error: `Acción desconocida: '${action}'` }, { status: 400 });
    }
  } catch (unexpected) {
    console.error("[CRM API] Error inesperado:", unexpected);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
