"use client";

import { useEffect, useState } from "react";
import { 
  X, Users, DollarSign, Star, FileText, Settings, Plus, 
  Trash2, Edit2, Mail, Eye, 
  Activity, Printer, AlertCircle, LogOut, CornerUpLeft 
} from "lucide-react";
import { 
  getLeads, getQuotes, getTestimonials, 
  getCRMConfig, saveCRMConfig, Lead, Quote, 
  Testimonial, CRMConfig, addQuote, deleteLead, deleteQuote, 
  toggleTestimonialApproval, deleteTestimonial, registerAdminUser, verifyAdminCredentials,
  updateLead, updateQuote, updateLeadStatus, updateQuoteStatus, clearLocalCRMCache
} from "@/lib/adminState";
import Image from "next/image";

export function AdminPortal() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"dashboard" | "quotes" | "testimonials" | "config">("dashboard");
  
  // Local states linked to state manager using async loading
  const [leads, setLeads] = useState<Lead[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [config, setConfig] = useState<CRMConfig>({
    rateEngineering: 120000,
    rateArchitecture: 140000,
    rateDevelopment: 90000,
    tax: 19,
    notificationEmail: "synflow.ia@gmail.com",
    emailActive: true
  });

  // Modal / Form states
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [selectedLeadForQuote, setSelectedLeadForQuote] = useState<string>("");
  const [previewingQuote, setPreviewingQuote] = useState<Quote | null>(null);

  // New quote form state
  const [quoteForm, setQuoteForm] = useState({
    client: "",
    services: "Consultoría e Inteligencia Artificial",
    hoursEngineering: 0,
    hoursArchitecture: 0,
    hoursDevelopment: 0,
    status: "Pendiente" as Quote["status"]
  });

  // Authentication states
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("synflow_admin_auth") === "true";
    }
    return false;
  });
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [registerName, setRegisterName] = useState("");
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingAuth(true);
    setLoginError("");
    try {
      const isValid = await verifyAdminCredentials(loginEmail, loginPassword);
      if (isValid) {
        setIsLoggedIn(true);
        if (typeof window !== "undefined") {
          sessionStorage.setItem("synflow_admin_auth", "true");
        }
        setLoginError("");
      } else {
        setLoginError("Credenciales incorrectas. Por favor, intenta de nuevo.");
      }
    } catch (err) {
      console.error(err);
      setLoginError("Ocurrió un error inesperado al iniciar sesión.");
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerName || !loginEmail || !loginPassword) {
      setLoginError("Por favor, completa todos los campos.");
      return;
    }
    setIsSubmittingAuth(true);
    setLoginError("");
    try {
      const res = await registerAdminUser(registerName, loginEmail, loginPassword);
      if (res.success) {
        // Enviar el correo de confirmación de registro de administrador
        try {
          await fetch("/api/send-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "admin_register",
              to: loginEmail,
              data: {
                name: registerName,
                email: loginEmail
              }
            })
          });
        } catch (emailErr) {
          console.error("Error al enviar correo de confirmación:", emailErr);
        }

        alert("¡Cuenta creada con éxito! Se ha enviado una confirmación a tu correo. Ya puedes iniciar sesión con tus credenciales.");
        setAuthMode("login");
        setLoginPassword("");
        setRegisterName("");
        setLoginError("");
      } else {
        setLoginError(res.error || "El correo electrónico ya se encuentra registrado.");
      }
    } catch (err) {
      console.error(err);
      setLoginError("Ocurrió un error al crear la cuenta.");
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsOpen(false); // Close the portal completely — return to landing page
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("synflow_admin_auth");
      // Scroll back to top of landing page
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Load state function
  const reloadCRMState = async () => {
    try {
      const [fetchedLeads, fetchedQuotes, fetchedTestimonials, fetchedConfig] = await Promise.all([
        getLeads(),
        getQuotes(),
        getTestimonials(),
        getCRMConfig()
      ]);
      setLeads(fetchedLeads);
      setQuotes(fetchedQuotes);
      setTestimonials(fetchedTestimonials);
      setConfig(fetchedConfig);
    } catch (err) {
      console.error("Error al cargar estado del CRM:", err);
    }
  };

  // Load initially on mount or when admin panel is opened/logged in
  useEffect(() => {
    if (isOpen) {
      // Purge any stale localStorage cache so Supabase is always the source of truth
      clearLocalCRMCache();
      const timer = setTimeout(() => {
        reloadCRMState();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Keyboard shortcut Ctrl + Q listener & custom open event listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === "q") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    const handleOpenPortal = () => {
      setIsOpen(true);
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("open_admin_portal", handleOpenPortal);
    
    // Event listener for state changes from other components (like CTA form submissions)
    const handleUpdate = () => {
      reloadCRMState();
    };
    window.addEventListener("crm_state_updated", handleUpdate);

    // Auto-open portal if URL contains ?admin=open (e.g. from confirmation email button)
    const params = new URLSearchParams(window.location.search);
    if (params.get("admin") === "open") {
      setIsOpen(true);
      // Clean up the URL parameter without reloading the page
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, "", cleanUrl);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("open_admin_portal", handleOpenPortal);
      window.removeEventListener("crm_state_updated", handleUpdate);
    };
  }, []);

  // Format COP Currency
  const formatCOP = (val: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0
    }).format(val);
  };

  // Metrics calculations
  const totalLeads = leads.length;
  const newLeadsCount = leads.filter(l => l.status === "Nuevo").length;
  const totalQuotedAmount = quotes.reduce((acc, q) => acc + q.total, 0);
  
  const approvedTestimonials = testimonials.filter(t => t.approved);
  const averageRating = approvedTestimonials.length > 0 
    ? (approvedTestimonials.reduce((acc, t) => acc + t.rating, 0) / approvedTestimonials.length).toFixed(1)
    : "0.0";

  // Handle lead update
  const handleSaveLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLead) return;
    await updateLead(editingLead);
    setEditingLead(null);
    await reloadCRMState();
  };

  // Handle lead deletion
  const handleDeleteLead = async (id: string) => {
    if (confirm("¿Estás seguro de eliminar este lead?")) {
      await deleteLead(id);
      await reloadCRMState();
    }
  };

  // Handle quote creation/update
  const handleSaveQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const subtotal = 
      (quoteForm.hoursEngineering * config.rateEngineering) + 
      (quoteForm.hoursArchitecture * config.rateArchitecture) + 
      (quoteForm.hoursDevelopment * config.rateDevelopment);
    const taxAmount = Math.round(subtotal * (config.tax / 100));
    const total = subtotal + taxAmount;

    if (editingQuote) {
      // Edit existing quote
      const updatedQuote: Quote = {
        ...editingQuote,
        client: quoteForm.client,
        services: quoteForm.services,
        hoursEngineering: quoteForm.hoursEngineering,
        hoursArchitecture: quoteForm.hoursArchitecture,
        hoursDevelopment: quoteForm.hoursDevelopment,
        subtotal,
        taxAmount,
        total,
        status: quoteForm.status
      };
      await updateQuote(updatedQuote);
      setEditingQuote(null);
    } else {
      // Add new quote
      await addQuote({
        leadId: selectedLeadForQuote || undefined,
        client: quoteForm.client,
        services: quoteForm.services,
        hoursEngineering: quoteForm.hoursEngineering,
        hoursArchitecture: quoteForm.hoursArchitecture,
        hoursDevelopment: quoteForm.hoursDevelopment,
        rateEngineering: config.rateEngineering,
        rateArchitecture: config.rateArchitecture,
        rateDevelopment: config.rateDevelopment,
        subtotal,
        tax: config.tax,
        taxAmount,
        total,
        status: quoteForm.status
      });
    }

    setIsQuoteModalOpen(false);
    setSelectedLeadForQuote("");
    setQuoteForm({
      client: "",
      services: "Consultoría e Inteligencia Artificial",
      hoursEngineering: 0,
      hoursArchitecture: 0,
      hoursDevelopment: 0,
      status: "Pendiente"
    });
    await reloadCRMState();
  };

  // Trigger editing a quote
  const handleStartEditQuote = (q: Quote) => {
    setEditingQuote(q);
    setQuoteForm({
      client: q.client,
      services: q.services,
      hoursEngineering: q.hoursEngineering,
      hoursArchitecture: q.hoursArchitecture,
      hoursDevelopment: q.hoursDevelopment,
      status: q.status
    });
    setIsQuoteModalOpen(true);
  };

  // Trigger creating a quote directly from a lead
  const handleCreateQuoteFromLead = (l: Lead) => {
    setSelectedLeadForQuote(l.id);
    setQuoteForm({
      client: l.company || l.name,
      services: l.service,
      hoursEngineering: 0,
      hoursArchitecture: 0,
      hoursDevelopment: 0,
      status: "Pendiente"
    });
    setIsQuoteModalOpen(true);
  };

  // Handle quote deletion
  const handleDeleteQuote = async (id: string) => {
    if (confirm("¿Estás seguro de eliminar esta cotización?")) {
      await deleteQuote(id);
      await reloadCRMState();
    }
  };

  // Handle testimonial approval toggle
  const handleToggleTestimonial = async (id: string) => {
    await toggleTestimonialApproval(id);
    await reloadCRMState();
  };

  // Handle testimonial deletion
  const handleDeleteTestimonial = async (id: string) => {
    if (confirm("¿Estás seguro de eliminar esta opinión?")) {
      await deleteTestimonial(id);
      await reloadCRMState();
    }
  };

  // Handle quote email notification via API
  const handleSendEmailSimulation = async (q: Quote) => {
    // Try to find the client email from local leads first
    let clientEmail = "";
    let clientName = q.client;

    const associatedLead = leads.find(
      (l) => l.id === q.leadId || l.name === q.client || l.company === q.client
    );

    if (associatedLead) {
      clientEmail = associatedLead.email;
      clientName = associatedLead.name;
    } else if (q.leadId) {
      // Fallback: query the server for the lead email
      try {
        const res = await fetch("/api/crm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "get_lead_email", data: { leadId: q.leadId } }),
        });
        const json = await res.json();
        if (json.data) {
          clientEmail = json.data.email;
          clientName = json.data.name || q.client;
        }
      } catch { /* ignore */ }
    }

    if (!clientEmail) {
      alert("No se encontró el correo del cliente asociado a esta cotización.\nEdita el lead y verifica que tenga un correo registrado.");
      return;
    }

    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "quote_approved",
          to: clientEmail,
          data: {
            client: clientName,
            services: q.services,
            total: q.total,
          },
        }),
      });

      const resData = await response.json();
      if (response.ok) {
        alert(
          `✅ Cotización enviada a ${clientName} (${clientEmail}).\n` +
          (resData.simulated ? "[Simulado] Verifica los logs del servidor." : "[Enviado] Correo entregado correctamente.")
        );
        // Mark quote as Proceso after sending
        await updateQuoteStatus(q.id, "Proceso");
        await reloadCRMState();
      } else {
        alert(`❌ Error al enviar: ${resData.error || "Error desconocido"}`);
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión al enviar el correo.");
    }
  };

  // Handle lead email confirmation or quotation via API
  const handleSendLeadEmail = async (lead: Lead) => {
    const associatedQuote = quotes.find(q => q.leadId === lead.id || q.client === lead.company || q.client === lead.name);
    
    if (associatedQuote) {
      await handleSendEmailSimulation(associatedQuote);
    } else {
      try {
        const response = await fetch("/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "client_confirm",
            to: lead.email,
            data: {
              name: lead.name,
              service: lead.service
            }
          })
        });

        const resData = await response.json();
        
        if (response.ok) {
          alert(`Correo de confirmación enviado a ${lead.name} (${lead.email}).\n${resData.simulated || resData.mocked ? "[Simulado] Detalles impresos en logs del servidor." : "[Enviado] Correo entregado."}`);
          
          // Update lead status to Contactado in Supabase
          await updateLead({ ...lead, status: "Contactado" as const });
          await reloadCRMState();
        } else {
          alert(`Error al enviar correo: ${resData.error || "Error desconocido"}`);
        }
      } catch (err) {
        console.error(err);
        alert("Error de conexión al enviar el correo.");
      }
    }
  };

  // Handle config save
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveCRMConfig(config);
    alert("Configuración comercial actualizada correctamente.");
  };

  if (!isOpen) return null;

  if (!isLoggedIn) {
    return (
      <div className="fixed inset-0 z-[9999] bg-[#0A0F1C]/98 backdrop-blur-lg text-sinflow-text-light flex items-center justify-center font-sans overflow-hidden">
        {/* Sleek background design */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]" />
        <div className="absolute top-[20%] -left-[10%] w-[40%] h-[40%] bg-sinflow-secondary/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[20%] -right-[10%] w-[40%] h-[40%] bg-sinflow-accent/15 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-md w-full mx-4 bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-md shadow-2xl space-y-6">
          <div className="text-center">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sinflow-secondary to-sinflow-accent flex items-center justify-center mx-auto mb-4 shadow-lg shadow-sinflow-secondary/20">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {authMode === "login" ? "Acceso Administrativo" : "Crear Cuenta"}
            </h2>
            <p className="text-xs text-gray-400 mt-1.5">
              {authMode === "login" 
                ? "Ingresa tus credenciales para administrar SynFlow IA CRM" 
                : "Regístrate con tu correo para acceder al portal comercial"}
            </p>
          </div>

          {authMode === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">Correo Electrónico</label>
                <input 
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  placeholder="admin@synflow.io"
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-sinflow-secondary/50 transition-all text-sm font-sans"
                  disabled={isSubmittingAuth}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">Contraseña</label>
                <input 
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-sinflow-secondary/50 transition-all text-sm font-sans"
                  disabled={isSubmittingAuth}
                />
              </div>

              {loginError && (
                <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmittingAuth}
                className="w-full py-3.5 bg-gradient-to-r from-sinflow-secondary to-sinflow-accent text-white font-bold rounded-xl hover:opacity-95 transition-all text-sm shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmittingAuth ? "Iniciando Sesión..." : "Iniciar Sesión"}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("register");
                    setLoginError("");
                  }}
                  className="text-xs text-gray-400 hover:text-sinflow-secondary transition-all"
                >
                  ¿No tienes cuenta? <span className="text-sinflow-secondary font-semibold hover:underline">Crear Cuenta</span>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">Nombre Completo</label>
                <input 
                  type="text"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  required
                  placeholder="Juan Pérez"
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-sinflow-secondary/50 transition-all text-sm font-sans"
                  disabled={isSubmittingAuth}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">Correo Electrónico</label>
                <input 
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  placeholder="juan@ejemplo.com"
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-sinflow-secondary/50 transition-all text-sm font-sans"
                  disabled={isSubmittingAuth}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">Contraseña</label>
                <input 
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-sinflow-secondary/50 transition-all text-sm font-sans"
                  disabled={isSubmittingAuth}
                />
              </div>

              {loginError && (
                <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmittingAuth}
                className="w-full py-3.5 bg-gradient-to-r from-sinflow-secondary to-sinflow-accent text-white font-bold rounded-xl hover:opacity-95 transition-all text-sm shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmittingAuth ? "Creando Cuenta..." : "Crear Cuenta"}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("login");
                    setLoginError("");
                  }}
                  className="text-xs text-gray-400 hover:text-sinflow-secondary transition-all"
                >
                  ¿Ya tienes cuenta? <span className="text-sinflow-secondary font-semibold hover:underline">Iniciar Sesión</span>
                </button>
              </div>
            </form>
          )}

          <div className="flex justify-between items-center text-[10px] text-gray-500 pt-4 border-t border-white/5">
            <span>SynFlow IA v1.0</span>
            <button 
              onClick={() => {
                setIsOpen(false);
                setAuthMode("login");
              }}
              className="text-sinflow-secondary hover:underline"
            >
              Cerrar Panel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-[#0A0F1C]/98 backdrop-blur-lg text-sinflow-text-light flex flex-col font-sans overflow-hidden">
      
      {/* Top Header Panel */}
      <header className="border-b border-white/10 px-4 md:px-6 py-4 flex justify-between items-center bg-gray-950/50">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-gradient-to-br from-sinflow-secondary to-sinflow-accent flex items-center justify-center shadow-lg shadow-sinflow-secondary/20">
            <Settings className="w-4 h-4 md:w-5 md:h-5 text-white" />
          </div>
          <div>
            <h1 className="text-md md:text-xl font-bold tracking-tight text-white flex items-center gap-2">
              SynFlow IA <span className="text-[10px] bg-sinflow-secondary/20 text-sinflow-secondary px-1.5 py-0.5 rounded font-mono hidden sm:inline">CRM Admin v1.0</span>
            </h1>
            <p className="text-[10px] md:text-xs text-gray-400">Ctrl + Q para salir</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 md:gap-3">
          <button
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white/5 border border-white/10 hover:bg-white/15 text-gray-300 hover:text-white transition-all text-[11px] md:text-xs font-semibold"
            title="Volver a la vista de la Landing Page sin cerrar sesión"
          >
            <CornerUpLeft className="w-3.5 h-3.5" /> <span>Volver a la Web</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-red-500/10 border border-red-500/20 hover:bg-red-500/25 text-red-400 hover:text-white transition-all text-[11px] md:text-xs font-semibold"
          >
            <LogOut className="w-3 h-3" /> <span className="hidden sm:inline">Cerrar Sesión</span>
          </button>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded bg-white/5 border border-white/10 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            title="Cerrar Panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Container Grid */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Sidebar Nav (Desktop only) */}
        <aside className="hidden md:flex w-64 border-r border-white/10 bg-gray-950/20 p-4 space-y-2 flex-col">
          <nav className="flex-1 space-y-1">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === "dashboard"
                  ? "bg-sinflow-secondary text-sinflow-primary shadow-lg shadow-sinflow-secondary/15 font-semibold"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Users className="w-4 h-4" />
              Leads & Consultas
            </button>
            <button
              onClick={() => setActiveTab("quotes")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === "quotes"
                  ? "bg-sinflow-secondary text-sinflow-primary shadow-lg shadow-sinflow-secondary/15 font-semibold"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <DollarSign className="w-4 h-4" />
              Cotizaciones
            </button>
            <button
              onClick={() => setActiveTab("testimonials")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === "testimonials"
                  ? "bg-sinflow-secondary text-sinflow-primary shadow-lg shadow-sinflow-secondary/15 font-semibold"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Star className="w-4 h-4" />
              Moderador Opiniones
            </button>
            <button
              onClick={() => setActiveTab("config")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === "config"
                  ? "bg-sinflow-secondary text-sinflow-primary shadow-lg shadow-sinflow-secondary/15 font-semibold"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Settings className="w-4 h-4" />
              Configuración Tarifas
            </button>
          </nav>
          <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-center">
            <span className="text-[10px] text-gray-500 uppercase tracking-widest block mb-1">Estado de Red</span>
            <span className="inline-flex items-center gap-1.5 text-xs text-green-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Local Activo
            </span>
          </div>
        </aside>

        {/* Mobile Bottom Navigation Bar (Mobile only) */}
        <div className="md:hidden absolute bottom-0 left-0 right-0 h-16 bg-gray-950 border-t border-white/10 flex items-center justify-around z-[10001] px-2 shadow-2xl">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all ${
              activeTab === "dashboard" ? "text-sinflow-secondary" : "text-gray-400"
            }`}
          >
            <Users className="w-4 h-4" />
            <span className="text-[9px] font-semibold">Leads</span>
          </button>
          <button
            onClick={() => setActiveTab("quotes")}
            className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all ${
              activeTab === "quotes" ? "text-sinflow-secondary" : "text-gray-400"
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span className="text-[9px] font-semibold">Cotizaciones</span>
          </button>
          <button
            onClick={() => setActiveTab("testimonials")}
            className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all ${
              activeTab === "testimonials" ? "text-sinflow-secondary" : "text-gray-400"
            }`}
          >
            <Star className="w-4 h-4" />
            <span className="text-[9px] font-semibold">Opiniones</span>
          </button>
          <button
            onClick={() => setActiveTab("config")}
            className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all ${
              activeTab === "config" ? "text-sinflow-secondary" : "text-gray-400"
            }`}
          >
            <Settings className="w-4 h-4" />
            <span className="text-[9px] font-semibold">Config</span>
          </button>
        </div>

        {/* Content Viewport */}
        <main className="flex-1 p-4 md:p-8 pb-20 md:pb-8 overflow-y-auto bg-sinflow-primary/50 relative">
          
          {/* TAB 1: DASHBOARD & LEADS */}
          {activeTab === "dashboard" && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* Metric Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-sm font-medium text-gray-400">Total Consultas</span>
                    <Users className="w-5 h-5 text-sinflow-secondary" />
                  </div>
                  <span className="text-3xl font-extrabold text-white">{totalLeads}</span>
                  <div className="mt-2 text-xs text-gray-500">Leads registrados en total</div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-sm font-medium text-gray-400">Leads Nuevos</span>
                    <Activity className="w-5 h-5 text-sinflow-accent" />
                  </div>
                  <span className="text-3xl font-extrabold text-white">{newLeadsCount}</span>
                  <div className="mt-2 text-xs text-sinflow-accent font-medium">Por atender comercialmente</div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-sm font-medium text-gray-400">Monto Cotizado</span>
                    <DollarSign className="w-5 h-5 text-green-400" />
                  </div>
                  <span className="text-2xl font-extrabold text-white truncate block">{formatCOP(totalQuotedAmount)}</span>
                  <div className="mt-2 text-xs text-gray-500">Total presupuestos generados</div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-sm font-medium text-gray-400">Calificación Promedio</span>
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  </div>
                  <span className="text-3xl font-extrabold text-white">{averageRating} / 5.0</span>
                  <div className="mt-2 text-xs text-gray-500">Opiniones aprobadas</div>
                </div>
              </div>

              {/* Leads List Table */}
              <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-gray-950/20">
                  <div>
                    <h2 className="text-lg font-bold text-white">Solicitudes de Clientes (Leads)</h2>
                    <p className="text-xs text-gray-400">Prospectos interesados que completaron el formulario web</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-gray-400 font-semibold bg-gray-950/30">
                        <th className="p-4">Cliente / Empresa</th>
                        <th className="p-4">Servicio Principal</th>
                        <th className="p-4">Detalle / Requerimiento</th>
                        <th className="p-4">Estado</th>
                        <th className="p-4">Calificación</th>
                        <th className="p-4 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {leads.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-gray-500">No hay solicitudes de clientes registradas.</td>
                        </tr>
                      ) : (
                        leads.map((lead) => (
                          <tr key={lead.id} className="hover:bg-white/5 transition-colors">
                            <td className="p-4">
                              <div className="font-semibold text-white">{lead.name}</div>
                              {lead.company && <div className="text-xs text-gray-500">{lead.company}</div>}
                              <div className="text-[10px] text-gray-500">{lead.email} | {lead.phone}</div>
                            </td>
                            <td className="p-4">
                              <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-white/5 border border-white/10 text-gray-300">
                                {lead.service}
                              </span>
                            </td>
                            <td className="p-4 text-gray-300 max-w-xs truncate" title={lead.description}>{lead.description}</td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                lead.status === "Nuevo" ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" :
                                lead.status === "Contactado" ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30" :
                                lead.status === "Cotizado" ? "bg-green-500/20 text-green-400 border border-green-500/30" :
                                "bg-red-500/20 text-red-400 border border-red-500/30"
                              }`}>
                                {lead.status}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-0.5">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star 
                                    key={s} 
                                    className={`w-3.5 h-3.5 ${
                                      s <= (lead.rating || 5) 
                                        ? "text-yellow-400 fill-yellow-400" 
                                        : "text-gray-600"
                                    }`} 
                                  />
                                ))}
                              </div>
                            </td>
                            <td className="p-4 text-right space-x-2">
                              <button 
                                onClick={() => setEditingLead(lead)}
                                title="Editar Estado"
                                className="p-1.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-yellow-400 hover:text-white transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleCreateQuoteFromLead(lead)}
                                title="Cotizar Solicitud"
                                className="p-1.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-green-400 hover:text-white transition-colors"
                              >
                                <DollarSign className="w-4 h-4" />
                              </button>

                              <button 
                                onClick={() => handleDeleteLead(lead.id)}
                                title="Eliminar Lead"
                                className="p-1.5 rounded bg-white/5 hover:bg-red-500/20 border border-white/10 text-red-400 hover:text-white transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: COTIZACIONES */}
          {activeTab === "quotes" && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* Header section with Create Button */}
              <div className="flex justify-between items-center bg-white/5 border border-white/10 p-6 rounded-2xl">
                <div>
                  <h2 className="text-xl font-bold text-white">Gestión de Cotizaciones</h2>
                  <p className="text-xs text-gray-400">Presupuestos y facturas preliminares de ingeniería</p>
                </div>
                <button
                  onClick={() => setIsQuoteModalOpen(true)}
                  className="px-4 py-2.5 bg-sinflow-secondary hover:bg-sinflow-secondary/90 text-sinflow-primary font-bold rounded-xl flex items-center gap-2 transition-all"
                >
                  <Plus className="w-4 h-4" /> Generar nueva cotización
                </button>
              </div>

              {/* Quotations Table */}
              <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-gray-400 font-semibold bg-gray-950/30">
                        <th className="p-4">Cliente / Empresa</th>
                        <th className="p-4">Servicio Solicitado</th>
                        <th className="p-4">Monto total</th>
                        <th className="p-4">Estado</th>
                        <th className="p-4">Fecha Envío</th>
                        <th className="p-4 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {quotes.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-gray-500">No hay cotizaciones registradas. Genera una nueva arriba.</td>
                        </tr>
                      ) : (
                        quotes.map((q) => (
                          <tr key={q.id} className="hover:bg-white/5 transition-colors">
                            <td className="p-4 font-semibold text-white">{q.client}</td>
                            <td className="p-4 text-gray-300">{q.services}</td>
                            <td className="p-4 font-mono font-semibold text-sinflow-secondary">{formatCOP(q.total)}</td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                q.status === "Pendiente" ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30" :
                                q.status === "Proceso" ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" :
                                "bg-green-500/20 text-green-400 border border-green-500/30"
                              }`}>
                                {q.status}
                              </span>
                            </td>
                            <td className="p-4 text-gray-500 text-xs">{new Date(q.createdAt).toLocaleDateString("es-CO")}</td>
                            <td className="p-4 text-right space-x-2">
                              <button 
                                onClick={() => handleStartEditQuote(q)}
                                title="Editar"
                                className="p-1.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-yellow-400 hover:text-white transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleSendEmailSimulation(q)}
                                title="Enviar Correo"
                                className="p-1.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-blue-400 hover:text-white transition-colors"
                              >
                                <Mail className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => setPreviewingQuote(q)}
                                title="Ver / Imprimir Presupuesto"
                                className="p-1.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-sinflow-secondary hover:text-white transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteQuote(q.id)}
                                title="Eliminar"
                                className="p-1.5 rounded bg-white/5 hover:bg-red-500/20 border border-white/10 text-red-400 hover:text-white transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TESTIMONIOS (MODERACIÓN) */}
          {activeTab === "testimonials" && (
            <div className="space-y-8 animate-fadeIn">
              <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                <h2 className="text-xl font-bold text-white">Moderación de Testimonios y Reseñas</h2>
                <p className="text-xs text-gray-400">Define qué testimonios de clientes se mostrarán activamente en el carrusel de la página de inicio</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {testimonials.map((t) => (
                  <div 
                    key={t.id}
                    className={`p-6 rounded-2xl border bg-white/5 transition-all duration-300 ${
                      t.approved 
                        ? "border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.05)]" 
                        : "border-white/10"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <Image 
                          src={t.image} 
                          alt={t.author}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-full border border-white/20 object-cover" 
                        />
                        <div>
                          <h4 className="font-semibold text-white">{t.author}</h4>
                          <p className="text-xs text-gray-400">{t.role} ({t.service})</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star 
                            key={s} 
                            className={`w-3.5 h-3.5 ${
                              s <= t.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-700"
                            }`} 
                          />
                        ))}
                      </div>
                    </div>
                    
                    <blockquote className="text-sm italic text-gray-300 pl-3 border-l-2 border-white/20 mb-6">
                      &ldquo;{t.content}&rdquo;
                    </blockquote>

                    <div className="flex justify-between items-center pt-4 border-t border-white/5">
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                        t.approved 
                          ? "bg-green-500/20 text-green-400 border border-green-500/30" 
                          : "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                      }`}>
                        {t.approved ? "Aprobado - Visible en Web" : "Pendiente de Moderación"}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleTestimonial(t.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                            t.approved
                              ? "bg-orange-500/10 text-orange-400 hover:bg-orange-500/20"
                              : "bg-green-500/10 text-green-400 hover:bg-green-500/20"
                          }`}
                        >
                          {t.approved ? "Desaprobar" : "Aprobar"}
                        </button>
                        <button
                          onClick={() => handleDeleteTestimonial(t.id)}
                          className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: CONFIGURACIÓN */}
          {activeTab === "config" && (
            <div className="space-y-8 animate-fadeIn max-w-3xl">
              <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                <h2 className="text-xl font-bold text-white">Configuración del Negocio</h2>
                <p className="text-xs text-gray-400">Establece las tarifas horarias y parámetros fiscales para el generador de cotizaciones comerciales</p>
              </div>

              <form onSubmit={handleSaveConfig} className="bg-white/5 border border-white/10 p-8 rounded-3xl space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Tarifa Ingeniería de Datos (COP / hora)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-mono">$</span>
                      <input 
                        type="number"
                        value={config.rateEngineering}
                        onChange={(e) => setConfig({ ...config, rateEngineering: parseInt(e.target.value) || 0 })}
                        required
                        className="w-full bg-black/30 border border-white/10 rounded-xl py-3 pl-8 pr-4 text-white font-mono focus:ring-2 focus:ring-sinflow-secondary/50 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Tarifa Arquitectura UX / UI (COP / hora)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-mono">$</span>
                      <input 
                        type="number"
                        value={config.rateArchitecture}
                        onChange={(e) => setConfig({ ...config, rateArchitecture: parseInt(e.target.value) || 0 })}
                        required
                        className="w-full bg-black/30 border border-white/10 rounded-xl py-3 pl-8 pr-4 text-white font-mono focus:ring-2 focus:ring-sinflow-secondary/50 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Tarifa Desarrollo de Software (COP / hora)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-mono">$</span>
                      <input 
                        type="number"
                        value={config.rateDevelopment}
                        onChange={(e) => setConfig({ ...config, rateDevelopment: parseInt(e.target.value) || 0 })}
                        required
                        className="w-full bg-black/30 border border-white/10 rounded-xl py-3 pl-8 pr-4 text-white font-mono focus:ring-2 focus:ring-sinflow-secondary/50 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Impuesto & Tributación (ej. IVA %)
                    </label>
                    <div className="relative">
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-mono">%</span>
                      <input 
                        type="number"
                        value={config.tax}
                        onChange={(e) => setConfig({ ...config, tax: parseInt(e.target.value) || 0 })}
                        required
                        className="w-full bg-black/30 border border-white/10 rounded-xl py-3 pl-4 pr-8 text-white font-mono focus:ring-2 focus:ring-sinflow-secondary/50 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-6 space-y-4">
                  <h3 className="text-md font-bold text-white">Notificaciones de Contacto</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Correo de la Empresa (Destinatario)
                      </label>
                      <input 
                        type="email"
                        value={config.notificationEmail}
                        onChange={(e) => setConfig({ ...config, notificationEmail: e.target.value })}
                        required
                        className="w-full bg-black/30 border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-sinflow-secondary/50 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Estado del Servicio de Correo
                      </label>
                      <div className="flex items-center gap-4 h-[46px]">
                        <span className="text-xs text-green-400 font-bold bg-green-500/10 px-3 py-1.5 rounded-lg border border-green-500/20">
                          Activo en Producción
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-sinflow-secondary hover:bg-sinflow-secondary/90 text-sinflow-primary font-bold rounded-xl shadow-lg shadow-sinflow-secondary/25 transition-all text-sm uppercase tracking-wider"
                >
                  Guardar Configuración
                </button>
              </form>
            </div>
          )}

        </main>
      </div>

      {/* --- EDIT LEAD MODAL --- */}
      {editingLead && (
        <div className="fixed inset-0 z-[10000] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form 
            onSubmit={handleSaveLead}
            className="bg-gray-900 border border-white/10 rounded-3xl p-8 max-w-md w-full space-y-6 animate-zoomIn"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Editar Solicitud</h3>
              <button 
                type="button" 
                onClick={() => setEditingLead(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Cliente / Nombre</label>
                <input 
                  type="text"
                  value={editingLead.name}
                  onChange={(e) => setEditingLead({ ...editingLead, name: e.target.value })}
                  required
                  className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Empresa / Negocio</label>
                <input 
                  type="text"
                  value={editingLead.company || ""}
                  onChange={(e) => setEditingLead({ ...editingLead, company: e.target.value })}
                  className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Servicio Solicitado</label>
                <input 
                  type="text"
                  value={editingLead.service}
                  disabled
                  className="w-full bg-black/10 border border-white/5 text-gray-500 rounded-xl p-3"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Estado del Lead</label>
                <select
                  value={editingLead.status}
                  onChange={(e) => setEditingLead({ ...editingLead, status: e.target.value as Lead["status"] })}
                  className="w-full bg-gray-850 border border-white/10 rounded-xl p-3 text-white cursor-pointer [&>option]:bg-gray-900"
                >
                  <option value="Nuevo">Nuevo</option>
                  <option value="Contactado">Contactado</option>
                  <option value="Cotizado">Cotizado</option>
                  <option value="Descartado">Descartado</option>
                </select>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-3 bg-sinflow-secondary text-sinflow-primary font-bold rounded-xl hover:opacity-95"
            >
              Guardar Cambios
            </button>
          </form>
        </div>
      )}

      {/* --- CREATE / EDIT QUOTE MODAL --- */}
      {isQuoteModalOpen && (
        <div className="fixed inset-0 z-[10000] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <form 
            onSubmit={handleSaveQuote}
            className="bg-gray-900 border border-white/10 rounded-3xl p-8 max-w-lg w-full space-y-6 my-8 animate-zoomIn"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">
                {editingQuote ? "Editar Cotización" : "Generar Presupuesto Comercial"}
              </h3>
              <button 
                type="button" 
                onClick={() => {
                  setIsQuoteModalOpen(false);
                  setEditingQuote(null);
                  setSelectedLeadForQuote("");
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Cliente / Empresa</label>
                <input 
                  type="text"
                  value={quoteForm.client}
                  onChange={(e) => setQuoteForm({ ...quoteForm, client: e.target.value })}
                  required
                  placeholder="Ej. Nutresa"
                  className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Servicio Solicitado</label>
                <select
                  value={quoteForm.services}
                  onChange={(e) => setQuoteForm({ ...quoteForm, services: e.target.value })}
                  className="w-full bg-gray-850 border border-white/10 rounded-xl p-3 text-white cursor-pointer [&>option]:bg-gray-900"
                >
                  <option value="Consultoría e Inteligencia Artificial">Consultoría e Inteligencia Artificial</option>
                  <option value="Automatización (RPA & IA)">Automatización Inteligente</option>
                  <option value="Analítica de Datos & BI">Analítica de Datos & BI</option>
                  <option value="Desarrollo a Medida">Desarrollo de Software / Apps Web</option>
                  <option value="Desarrollo de Agentes y Chatbots">Agentes Inteligentes y Chatbots</option>
                </select>
              </div>

              <div className="border-t border-white/10 pt-4">
                <h4 className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-3">Distribución de Horas Estimadas</h4>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-400 mb-1">Horas Ing. Datos</label>
                    <input 
                      type="number"
                      value={quoteForm.hoursEngineering}
                      onChange={(e) => setQuoteForm({ ...quoteForm, hoursEngineering: parseInt(e.target.value) || 0 })}
                      min="0"
                      className="w-full bg-black/30 border border-white/10 rounded-xl p-2.5 text-center text-white font-mono focus:outline-none"
                    />
                    <div className="text-[10px] text-gray-500 text-center mt-1">x {formatCOP(config.rateEngineering)}</div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-gray-400 mb-1">Horas Arq. UX</label>
                    <input 
                      type="number"
                      value={quoteForm.hoursArchitecture}
                      onChange={(e) => setQuoteForm({ ...quoteForm, hoursArchitecture: parseInt(e.target.value) || 0 })}
                      min="0"
                      className="w-full bg-black/30 border border-white/10 rounded-xl p-2.5 text-center text-white font-mono focus:outline-none"
                    />
                    <div className="text-[10px] text-gray-500 text-center mt-1">x {formatCOP(config.rateArchitecture)}</div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-gray-400 mb-1">Horas Desarrollo</label>
                    <input 
                      type="number"
                      value={quoteForm.hoursDevelopment}
                      onChange={(e) => setQuoteForm({ ...quoteForm, hoursDevelopment: parseInt(e.target.value) || 0 })}
                      min="0"
                      className="w-full bg-black/30 border border-white/10 rounded-xl p-2.5 text-center text-white font-mono focus:outline-none"
                    />
                    <div className="text-[10px] text-gray-500 text-center mt-1">x {formatCOP(config.rateDevelopment)}</div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Estado Inicial</label>
                <select
                  value={quoteForm.status}
                  onChange={(e) => setQuoteForm({ ...quoteForm, status: e.target.value as Quote["status"] })}
                  className="w-full bg-gray-850 border border-white/10 rounded-xl p-3 text-white cursor-pointer [&>option]:bg-gray-900"
                >
                  <option value="Pendiente">Pendiente</option>
                  <option value="Proceso">Proceso</option>
                  <option value="Completado">Completado</option>
                </select>
              </div>

              {/* Dynamic Totals Summary */}
              <div className="bg-white/5 rounded-2xl p-4 border border-white/5 space-y-1.5 font-mono text-xs">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal:</span>
                  <span>{formatCOP(
                    (quoteForm.hoursEngineering * config.rateEngineering) + 
                    (quoteForm.hoursArchitecture * config.rateArchitecture) + 
                    (quoteForm.hoursDevelopment * config.rateDevelopment)
                  )}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Impuesto ({config.tax}%):</span>
                  <span>{formatCOP(
                    Math.round(((quoteForm.hoursEngineering * config.rateEngineering) + 
                    (quoteForm.hoursArchitecture * config.rateArchitecture) + 
                    (quoteForm.hoursDevelopment * config.rateDevelopment)) * (config.tax / 100))
                  )}</span>
                </div>
                <div className="flex justify-between text-white font-bold border-t border-white/10 pt-2 text-sm">
                  <span>Total Estimado:</span>
                  <span className="text-sinflow-secondary">{formatCOP(
                    Math.round(((quoteForm.hoursEngineering * config.rateEngineering) + 
                    (quoteForm.hoursArchitecture * config.rateArchitecture) + 
                    (quoteForm.hoursDevelopment * config.rateDevelopment)) * (1 + config.tax / 100))
                  )}</span>
                </div>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-3.5 bg-sinflow-secondary text-sinflow-primary font-bold rounded-xl hover:opacity-95"
            >
              {editingQuote ? "Actualizar Cotización" : "Crear Cotización"}
            </button>
          </form>
        </div>
      )}

      {/* --- PREVIEW QUOTE MODAL (INVOICE STYLE) --- */}
      {previewingQuote && (
        <div className="fixed inset-0 z-[10000] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white text-gray-900 rounded-3xl p-8 max-w-2xl w-full my-8 flex flex-col relative shadow-2xl print:p-0 print:m-0 print:shadow-none">
            
            {/* Header controls (Hidden on print) */}
            <div className="flex justify-between items-center pb-4 border-b border-gray-100 mb-6 print:hidden">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-sinflow-accent" />
                Presupuesto Comercial
              </h3>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-lg bg-sinflow-accent text-white font-bold flex items-center gap-2 hover:opacity-95"
                >
                  <Printer className="w-4 h-4" /> Imprimir
                </button>
                <button 
                  onClick={() => setPreviewingQuote(null)}
                  className="p-2 rounded-lg bg-gray-100 border border-gray-200 text-gray-500 hover:text-gray-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Print Body */}
            <div className="flex-1 space-y-8 font-sans">
              {/* Header company logo */}
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-black tracking-tight text-sinflow-primary">SynFlow IA</h1>
                  <p className="text-xs text-gray-500">Inteligencia Artificial y Automatización de Procesos</p>
                  <p className="text-xs text-gray-400 mt-1">Medellín, Colombia</p>
                </div>
                <div className="text-right">
                  <span className="text-xs uppercase tracking-widest text-gray-400 font-bold block">Presupuesto</span>
                  <span className="text-lg font-mono font-bold block">#{previewingQuote.id.toUpperCase()}</span>
                  <span className="text-xs text-gray-500 block">Fecha: {new Date(previewingQuote.createdAt).toLocaleDateString("es-CO")}</span>
                </div>
              </div>

              {/* Client Info block */}
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Dirigido A:</span>
                  <span className="text-md font-bold text-gray-800 block mt-1">{previewingQuote.client}</span>
                  <span className="text-xs text-gray-500">Cliente Asociado / Partner Comercial</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Condición Comercial:</span>
                  <span className="text-xs text-gray-600 block mt-1">Tarifa Horaria Estimada</span>
                  <span className="text-xs text-gray-500">Vigencia del presupuesto: 30 días</span>
                </div>
              </div>

              {/* Project description */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Servicios Incluidos</h4>
                <p className="text-sm font-semibold text-gray-800 bg-gray-100/50 p-3 rounded-lg border border-gray-150">
                  {previewingQuote.services}
                </p>
              </div>

              {/* Items Breakdown Table */}
              <div className="border border-gray-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-100 border-b border-gray-200 text-gray-600 font-bold">
                      <th className="p-3">Concepto Profesional</th>
                      <th className="p-3 text-center">Horas</th>
                      <th className="p-3 text-right">Tarifa / Hora</th>
                      <th className="p-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-150">
                    {previewingQuote.hoursEngineering > 0 && (
                      <tr>
                        <td className="p-3">
                          <span className="font-bold text-gray-800 block">Ingeniería de Datos</span>
                          <span className="text-[10px] text-gray-400">Implementación ETL, modelado semántico y LLMs</span>
                        </td>
                        <td className="p-3 text-center font-mono">{previewingQuote.hoursEngineering}</td>
                        <td className="p-3 text-right font-mono">{formatCOP(previewingQuote.rateEngineering)}</td>
                        <td className="p-3 text-right font-mono font-semibold">
                          {formatCOP(previewingQuote.hoursEngineering * previewingQuote.rateEngineering)}
                        </td>
                      </tr>
                    )}
                    {previewingQuote.hoursArchitecture > 0 && (
                      <tr>
                        <td className="p-3">
                          <span className="font-bold text-gray-800 block">Arquitectura UX / UI</span>
                          <span className="text-[10px] text-gray-400">Diseño interactivo de flujos y pantallas del sistema</span>
                        </td>
                        <td className="p-3 text-center font-mono">{previewingQuote.hoursArchitecture}</td>
                        <td className="p-3 text-right font-mono">{formatCOP(previewingQuote.rateArchitecture)}</td>
                        <td className="p-3 text-right font-mono font-semibold">
                          {formatCOP(previewingQuote.hoursArchitecture * previewingQuote.rateArchitecture)}
                        </td>
                      </tr>
                    )}
                    {previewingQuote.hoursDevelopment > 0 && (
                      <tr>
                        <td className="p-3">
                          <span className="font-bold text-gray-800 block">Desarrollo de Software</span>
                          <span className="text-[10px] text-gray-400">Despliegue de código Next.js, API e integración de APIs</span>
                        </td>
                        <td className="p-3 text-center font-mono">{previewingQuote.hoursDevelopment}</td>
                        <td className="p-3 text-right font-mono">{formatCOP(previewingQuote.rateDevelopment)}</td>
                        <td className="p-3 text-right font-mono font-semibold">
                          {formatCOP(previewingQuote.hoursDevelopment * previewingQuote.rateDevelopment)}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Invoice Totals */}
              <div className="flex justify-end pt-4">
                <div className="w-64 space-y-2 text-xs font-mono">
                  <div className="flex justify-between text-gray-500">
                    <span>Subtotal:</span>
                    <span>{formatCOP(previewingQuote.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>IVA ({previewingQuote.tax}%):</span>
                    <span>{formatCOP(previewingQuote.taxAmount)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-black text-gray-900 border-t border-gray-200 pt-2">
                    <span>Total Neto:</span>
                    <span>{formatCOP(previewingQuote.total)}</span>
                  </div>
                </div>
              </div>

              {/* Footer text */}
              <div className="text-center text-[10px] text-gray-400 border-t border-gray-100 pt-6">
                SynFlow IA • Transformando negocios con soluciones avanzadas de Inteligencia Artificial.
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
