import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Server-side Supabase client — uses env vars directly (no NEXT_PUBLIC_ prefix issues)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const getSupabase = () => {
  if (!supabaseUrl || !supabaseKey) return null;
  return createClient(supabaseUrl, supabaseKey);
};

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action, data } = body;

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase no configurado" }, { status: 500 });
  }

  try {
    switch (action) {
      // ── LEADS ──────────────────────────────────────────────────
      case "add_lead": {
        const { error, data: inserted } = await supabase
          .from("leads")
          .insert([{
            name: data.name,
            email: data.email,
            phone: data.phone,
            company: data.company || null,
            service: data.service,
            description: data.description,
            status: "Nuevo",
            rating: 5,
          }])
          .select()
          .single();
        if (error) {
          console.error("[CRM API] Error al insertar lead:", error);
          return NextResponse.json({ error: error.message, code: error.code }, { status: 400 });
        }
        return NextResponse.json({ success: true, data: inserted });
      }

      case "get_leads": {
        const { data: leads, error } = await supabase
          .from("leads")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
        return NextResponse.json({ success: true, data: leads });
      }

      case "update_lead": {
        const { error } = await supabase
          .from("leads")
          .update({
            name: data.name,
            email: data.email,
            phone: data.phone,
            company: data.company || null,
            service: data.service,
            description: data.description,
            status: data.status,
            rating: data.rating || null,
          })
          .eq("id", data.id);
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
        return NextResponse.json({ success: true });
      }

      case "delete_lead": {
        const { error } = await supabase.from("leads").delete().eq("id", data.id);
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
        return NextResponse.json({ success: true });
      }

      // ── QUOTES ─────────────────────────────────────────────────
      case "add_quote": {
        const { error, data: inserted } = await supabase
          .from("quotes")
          .insert([{
            lead_id: data.leadId || null,
            client: data.client,
            services: data.services,
            hours_engineering: data.hoursEngineering,
            hours_architecture: data.hoursArchitecture,
            hours_development: data.hoursDevelopment,
            rate_engineering: data.rateEngineering,
            rate_architecture: data.rateArchitecture,
            rate_development: data.rateDevelopment,
            subtotal: data.subtotal,
            tax: data.tax,
            total: data.total,
            status: data.status || "Pendiente",
          }])
          .select()
          .single();
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
        return NextResponse.json({ success: true, data: inserted });
      }

      case "get_quotes": {
        const { data: quotes, error } = await supabase
          .from("quotes")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
        return NextResponse.json({ success: true, data: quotes });
      }

      case "update_quote": {
        const { error } = await supabase
          .from("quotes")
          .update({
            client: data.client,
            services: data.services,
            hours_engineering: data.hoursEngineering,
            hours_architecture: data.hoursArchitecture,
            hours_development: data.hoursDevelopment,
            rate_engineering: data.rateEngineering,
            rate_architecture: data.rateArchitecture,
            rate_development: data.rateDevelopment,
            subtotal: data.subtotal,
            tax: data.tax,
            total: data.total,
            status: data.status,
          })
          .eq("id", data.id);
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
        return NextResponse.json({ success: true });
      }

      case "delete_quote": {
        const { error } = await supabase.from("quotes").delete().eq("id", data.id);
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
        return NextResponse.json({ success: true });
      }

      // ── TESTIMONIALS ────────────────────────────────────────────
      case "add_testimonial": {
        const { error, data: inserted } = await supabase
          .from("testimonials")
          .insert([{
            author: data.author,
            role: data.role || "Cliente",
            content: data.content,
            image: data.image || "https://randomuser.me/api/portraits/men/1.jpg",
            approved: false, // Requires admin approval
            rating: data.rating || 5,
            service: data.service || "Otro / Contacto General",
          }])
          .select()
          .single();
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
        return NextResponse.json({ success: true, data: inserted });
      }

      case "get_testimonials": {
        const { data: testimonials, error } = await supabase
          .from("testimonials")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
        return NextResponse.json({ success: true, data: testimonials });
      }

      case "toggle_testimonial": {
        const { data: current, error: fetchErr } = await supabase
          .from("testimonials")
          .select("approved")
          .eq("id", data.id)
          .single();
        if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 400 });
        const { error } = await supabase
          .from("testimonials")
          .update({ approved: !current.approved })
          .eq("id", data.id);
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
        return NextResponse.json({ success: true });
      }

      case "delete_testimonial": {
        const { error } = await supabase.from("testimonials").delete().eq("id", data.id);
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
        return NextResponse.json({ success: true });
      }

      // ── ADMIN USERS ─────────────────────────────────────────────
      case "register_admin": {
        const { error } = await supabase
          .from("admin_users")
          .insert([{ name: data.name, email: data.email, password: data.password }]);
        if (error) return NextResponse.json({ error: error.message, code: error.code }, { status: 400 });
        return NextResponse.json({ success: true });
      }

      case "verify_admin": {
        const { data: user, error } = await supabase
          .from("admin_users")
          .select("id")
          .eq("email", data.email)
          .eq("password", data.password)
          .maybeSingle();
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
        return NextResponse.json({ success: !!user });
      }

      default:
        return NextResponse.json({ error: "Acción no reconocida" }, { status: 400 });
    }
  } catch (err) {
    console.error("[CRM API] Error inesperado:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
