import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

// Type definitions for the payload
interface EmailRequest {
  type: "new_lead" | "client_confirm" | "quote_approved" | "admin_register";
  to: string;
  data: {
    name?: string;
    email?: string;
    phone?: string;
    company?: string;
    service?: string;
    description?: string;
    client?: string;
    services?: string;
    hoursEngineering?: number;
    hoursArchitecture?: number;
    hoursDevelopment?: number;
    rateEngineering?: number;
    rateArchitecture?: number;
    rateDevelopment?: number;
    subtotal?: number;
    tax?: number;
    total?: number;
  };
}

// 1. HTML Template for notifying the company about a new lead
const getNewLeadHtml = (data: {
  name: string;
  email: string;
  phone: string;
  company?: string;
  service: string;
  description: string;
}) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #0A0F1C; color: #E5E7EB; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background-color: #111827; border: 1px solid #1F2937; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3); }
    .header { background: linear-gradient(135deg, #00E0FF 0%, #7B5CFF 100%); padding: 30px; text-align: center; }
    .header h1 { margin: 0; color: #FFFFFF; font-size: 24px; font-weight: bold; letter-spacing: -0.5px; }
    .content { padding: 30px; }
    .lead-badge { display: inline-block; padding: 6px 12px; background-color: rgba(0, 224, 255, 0.15); border: 1px solid rgba(0, 224, 255, 0.3); color: #00E0FF; font-size: 12px; font-weight: bold; border-radius: 9999px; text-transform: uppercase; margin-bottom: 20px; }
    .info-grid { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    .info-grid td { padding: 12px; border-bottom: 1px solid #1F2937; }
    .info-grid td.label { font-weight: bold; color: #9CA3AF; width: 150px; font-size: 13px; }
    .info-grid td.value { color: #F3F4F6; font-size: 14px; }
    .footer { text-align: center; padding: 20px; background-color: #0d1321; border-top: 1px solid #1F2937; font-size: 11px; color: #6B7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Nuevo Lead Capturado</h1>
    </div>
    <div class="content">
      <span class="lead-badge">Solicitud Web</span>
      <p style="margin-top: 0; font-size: 15px; color: #D1D5DB; line-height: 1.5;">Se ha recibido una nueva solicitud de información a través del formulario principal de la landing page.</p>
      
      <table class="info-grid">
        <tr>
          <td class="label">Nombre Cliente</td>
          <td class="value">${data.name}</td>
        </tr>
        <tr>
          <td class="label">Empresa / Negocio</td>
          <td class="value">${data.company || "No especificado"}</td>
        </tr>
        <tr>
          <td class="label">Correo Electrónico</td>
          <td class="value"><a href="mailto:${data.email}" style="color: #00E0FF; text-decoration: none;">${data.email}</a></td>
        </tr>
        <tr>
          <td class="label">Teléfono / Celular</td>
          <td class="value">${data.phone}</td>
        </tr>
        <tr>
          <td class="label">Servicio Solicitado</td>
          <td class="value" style="font-weight: bold; color: #00E0FF;">${data.service}</td>
        </tr>
        <tr>
          <td class="label">Descripción</td>
          <td class="value">${data.description}</td>
        </tr>
      </table>
      
      <div style="text-align: center;">
        <a href="https://wa.me/${data.phone.replace(/[^0-9]/g, "")}" style="display: inline-block; background-color: #22C55E; color: #FFFFFF; font-weight: bold; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 14px;">Contactar por WhatsApp</a>
      </div>
    </div>
    <div class="footer">
      SynFlow IA • Plataforma de CRM Automatizada
    </div>
  </div>
</body>
</html>
`;

// 2. HTML Template for confirming request receipt to the client
const getClientConfirmHtml = (data: { name: string; service: string }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #F8FAFC; color: #334155; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 30px auto; background-color: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .header { background: linear-gradient(135deg, #0A0F1C 0%, #1E293B 100%); padding: 40px 30px; text-align: center; }
    .header h1 { margin: 0; color: #00E0FF; font-size: 26px; font-weight: bold; letter-spacing: -0.5px; }
    .content { padding: 35px 30px; line-height: 1.6; }
    .content h2 { color: #0F172A; font-size: 18px; margin-top: 0; }
    .step-box { background-color: #F1F5F9; border-left: 4px solid #7B5CFF; border-radius: 4px; padding: 15px; margin: 20px 0; }
    .button { display: inline-block; background-color: #7B5CFF; color: #FFFFFF !important; font-weight: bold; padding: 12px 24px; border-radius: 9999px; text-decoration: none; font-size: 14px; text-align: center; box-shadow: 0 4px 6px rgba(123, 92, 255, 0.2); }
    .footer { text-align: center; padding: 20px; background-color: #0A0F1C; font-size: 11px; color: #94A3B8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>SynFlow IA</h1>
    </div>
    <div class="content">
      <h2>¡Hola, ${data.name}!</h2>
      <p>Hemos recibido correctamente tu solicitud de información para el servicio de <strong>${data.service}</strong>.</p>
      <p>Uno de nuestros ingenieros consultores en Medellín está revisando tus datos de negocio para diseñar una propuesta comercial a tu medida.</p>
      
      <div class="step-box">
        <strong style="color: #0F172A; display: block; margin-bottom: 5px;">¿Qué sigue ahora?</strong>
        <ol style="margin: 0; padding-left: 20px; font-size: 13px; color: #475569;">
          <li>Mapearemos tu requerimiento con nuestras tarifas comerciales oficiales.</li>
          <li>Te enviaremos el presupuesto estimado en PDF para tu revisión.</li>
          <li>Agendaremos una sesión demo de 15 minutos para resolver dudas técnicas.</li>
        </ol>
      </div>

      <p style="margin-bottom: 30px;">Si tienes alguna duda urgente o quieres acelerar tu cotización, puedes comunicarte en directo a través de nuestra línea de atención.</p>
      
      <div style="text-align: center;">
        <a href="https://wa.me/573044769593?text=Hola,%20quisiera%20saber%20el%20estado%20de%20mi%20solicitud%20en%20SynFlow" class="button">Hablar con un Asesor en Directo</a>
      </div>
  </div>
</body>
</html>
`;

// 3. HTML Template for notifying the client that their quote has been approved/sent with a detailed commercial proposal breakdown
const getQuoteApprovedHtml = (data: {
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
  total: number;
}) => {
  const formatCOP = (val: number) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0
    }).format(val);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #F8FAFC; color: #334155; margin: 0; padding: 0; }
    .container { max-width: 650px; margin: 30px auto; background-color: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .header { background: linear-gradient(135deg, #0A0F1C 0%, #1E293B 100%); padding: 40px 30px; text-align: center; }
    .header h1 { margin: 0; color: #00E0FF; font-size: 26px; font-weight: bold; }
    .content { padding: 35px 30px; line-height: 1.6; }
    .proposal-title { color: #0F172A; font-size: 20px; font-weight: bold; margin-bottom: 20px; text-align: center; border-bottom: 2px solid #E2E8F0; padding-bottom: 10px; }
    .item-table { width: 100%; border-collapse: collapse; margin: 25px 0; font-size: 14px; }
    .item-table th { background-color: #0A0F1C; color: #FFFFFF; text-align: left; padding: 12px; font-weight: bold; }
    .item-table td { padding: 14px 12px; border-bottom: 1px solid #E2E8F0; }
    .item-table tr.total-row td { font-weight: bold; background-color: #F8FAFC; color: #0F172A; }
    .item-table tr.grand-total-row td { font-weight: bold; background-color: rgba(0, 224, 255, 0.05); color: #0088CC; font-size: 16px; border-top: 2px solid #00E0FF; }
    .button { display: inline-block; background-color: #22C55E; color: #FFFFFF !important; font-weight: bold; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-size: 14px; text-align: center; box-shadow: 0 4px 6px rgba(34, 197, 94, 0.2); }
    .footer { text-align: center; padding: 25px; background-color: #0A0F1C; font-size: 11px; color: #94A3B8; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Presupuesto Aprobado</h1>
    </div>
    <div class="content">
      <h2 style="color: #0F172A; font-size: 18px; margin-top: 0;">Estimado cliente de ${data.client},</h2>
      <p>Nos complace informarte que hemos finalizado la estimación comercial detallada de los servicios tecnológicos solicitados.</p>
      <p>Tu propuesta detallada para el servicio <strong>${data.services}</strong> ya está configurada en nuestro sistema. A continuación se desglosa el presupuesto técnico estimado para el desarrollo del proyecto:</p>
      
      <div class="proposal-title">Desglose Comercial del Proyecto</div>
      
      <table class="item-table">
        <thead>
          <tr>
            <th>Concepto / Desglose del Servicio</th>
            <th style="text-align: right; width: 120px;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${data.hoursEngineering > 0 ? `
          <tr>
            <td>
              <div style="font-weight: bold; color: #0F172A;">Ingeniería de Inteligencia Artificial</div>
              <div style="font-size: 12px; color: #64748B; margin-top: 4px;">RPA, LLMs, NLP • ${data.hoursEngineering} horas &times; ${formatCOP(data.rateEngineering)} / h</div>
            </td>
            <td style="text-align: right; font-weight: bold; color: #0F172A; vertical-align: middle;">
              ${formatCOP(data.hoursEngineering * data.rateEngineering)}
            </td>
          </tr>
          ` : ""}
          ${data.hoursArchitecture > 0 ? `
          <tr>
            <td>
              <div style="font-weight: bold; color: #0F172A;">Arquitectura Cloud & Ingeniería de Datos</div>
              <div style="font-size: 12px; color: #64748B; margin-top: 4px;">Supabase, AWS • ${data.hoursArchitecture} horas &times; ${formatCOP(data.rateArchitecture)} / h</div>
            </td>
            <td style="text-align: right; font-weight: bold; color: #0F172A; vertical-align: middle;">
              ${formatCOP(data.hoursArchitecture * data.rateArchitecture)}
            </td>
          </tr>
          ` : ""}
          ${data.hoursDevelopment > 0 ? `
          <tr>
            <td>
              <div style="font-weight: bold; color: #0F172A;">Desarrollo de Software a Medida</div>
              <div style="font-size: 12px; color: #64748B; margin-top: 4px;">Frontend & Backend • ${data.hoursDevelopment} horas &times; ${formatCOP(data.rateDevelopment)} / h</div>
            </td>
            <td style="text-align: right; font-weight: bold; color: #0F172A; vertical-align: middle;">
              ${formatCOP(data.hoursDevelopment * data.rateDevelopment)}
            </td>
          </tr>
          ` : ""}
          
          <tr class="total-row">
            <td style="text-align: right;">Subtotal Neto:</td>
            <td style="text-align: right;">${formatCOP(data.subtotal)}</td>
          </tr>
          <tr class="total-row">
            <td style="text-align: right;">Impuesto IVA (${data.tax}%):</td>
            <td style="text-align: right;">${formatCOP(data.total - data.subtotal)}</td>
          </tr>
          <tr class="grand-total-row">
            <td style="text-align: right;">Presupuesto Total Estimado:</td>
            <td style="text-align: right;">${formatCOP(data.total)}</td>
          </tr>
        </tbody>
      </table>

      <p style="margin-top: 25px; margin-bottom: 30px;">Para proceder con la planificación de sprints de desarrollo e inicio técnico, por favor confirma tu aprobación haciendo clic en el siguiente botón o respondiendo directamente a este correo.</p>
      
      <div style="text-align: center;">
        <a href="https://wa.me/573044769593?text=Hola,%20he%20recibido%20el%20presupuesto%20desglosado%20por%20${formatCOP(data.total)}%20y%20quiero%20aprobarlo%20para%20iniciar%20desarrollo" class="button">Aprobar e Iniciar Desarrollo</a>
      </div>
    </div>
    <div class="footer">
      SynFlow IA • Inteligencia Artificial y Automatización en Medellín<br>
      Este es un presupuesto comercial válido por 30 días a partir de su emisión.<br>
      © ${new Date().getFullYear()} SynFlow IA. Todos los derechos reservados.
    </div>
  </div>
</body>
</html>
`;
};

// 4. HTML Template for admin user registration confirmation
// siteUrl is injected at call time so it always reflects the real deployment URL
const getAdminRegisterHtml = (data: { name: string; email: string }, siteUrl: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #0A0F1C; color: #E5E7EB; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background-color: #111827; border: 1px solid #1F2937; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3); }
    .header { background: linear-gradient(135deg, #00E0FF 0%, #7B5CFF 100%); padding: 30px; text-align: center; }
    .header h1 { margin: 0; color: #FFFFFF; font-size: 24px; font-weight: bold; letter-spacing: -0.5px; }
    .content { padding: 30px; }
    .auth-badge { display: inline-block; padding: 6px 12px; background-color: rgba(34, 197, 94, 0.15); border: 1px solid rgba(34, 197, 94, 0.3); color: #22C55E; font-size: 12px; font-weight: bold; border-radius: 9999px; text-transform: uppercase; margin-bottom: 20px; }
    .credentials-box { background-color: #0d1321; border: 1px solid #1F2937; border-radius: 8px; padding: 16px 20px; margin: 20px 0; }
    .credentials-box p { margin: 4px 0; font-size: 13px; color: #9CA3AF; }
    .credentials-box strong { color: #F3F4F6; }
    .footer { text-align: center; padding: 20px; background-color: #0d1321; border-top: 1px solid #1F2937; font-size: 11px; color: #6B7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Cuenta Autorizada</h1>
    </div>
    <div class="content">
      <span class="auth-badge">Acceso de Administrador Autorizado</span>
      <p style="margin-top: 0; font-size: 16px; color: #D1D5DB; line-height: 1.5;">
        Hola, <strong>${data.name}</strong>.
      </p>
      <p style="font-size: 15px; color: #9CA3AF; line-height: 1.5;">
        Tu cuenta con el correo electrónico <strong style="color: #00E0FF;">${data.email}</strong> ha sido creada exitosamente y se encuentra <strong style="color: #22C55E;">totalmente autorizada</strong> para acceder al Portal Administrativo de <strong style="color: #F3F4F6;">SynFlow IA</strong>.
      </p>
      <p style="font-size: 14px; color: #9CA3AF; line-height: 1.5;">
        Ya puedes iniciar sesión con tus credenciales para gestionar solicitudes, estimar cotizaciones y moderar testimonios.
      </p>
      <div class="credentials-box">
        <p>📧 <strong>Correo:</strong> ${data.email}</p>
        <p>🔑 <strong>Contraseña:</strong> La que registraste al crear la cuenta</p>
      </div>
      <div style="margin: 30px 0; text-align: center;">
        <a href="${siteUrl}?admin=open" style="display: inline-block; background: linear-gradient(135deg, #00E0FF 0%, #7B5CFF 100%); color: #FFFFFF; font-weight: bold; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-size: 14px; box-shadow: 0 4px 10px rgba(0, 224, 255, 0.2);">Ir al Portal de Administración →</a>
      </div>
      <p style="font-size: 12px; color: #6B7280; text-align: center;">Si el botón no funciona, copia y pega esta URL en tu navegador:<br><span style="color: #00E0FF;">${siteUrl}</span></p>
    </div>
    <div class="footer">
      SynFlow IA • Inteligencia Artificial y Automatización<br>
      © ${new Date().getFullYear()} SynFlow IA. Todos los derechos reservados.
    </div>
  </div>
</body>
</html>
`;

export async function POST(req: Request) {
  try {
    const body: EmailRequest = await req.json();
    const { type, to, data } = body;

    if (!type || !to || !data) {
      return NextResponse.json({ error: "Parámetros incompletos" }, { status: 400 });
    }

    // Resolve the real site URL: prefer env var, then derive from request headers (works on Vercel)
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      req.headers.get("origin") ||
      req.headers.get("referer")?.split("/").slice(0, 3).join("/") ||
      "https://synflow-ia.vercel.app";

    // Determine subject and HTML template based on email type
    let htmlContent = "";
    let subject = "";

    switch (type) {
      case "new_lead":
        subject = "🔥 Nuevo Lead Capturado - SynFlow IA";
        htmlContent = getNewLeadHtml(data as { name: string; email: string; phone: string; company?: string; service: string; description: string; });
        break;
      case "client_confirm":
        subject = "✉️ Hemos recibido tu solicitud - SynFlow IA";
        htmlContent = getClientConfirmHtml(data as { name: string; service: string; });
        break;
      case "quote_approved":
        subject = "💼 Presupuesto Comercial Estimado - SynFlow IA";
        htmlContent = getQuoteApprovedHtml(data as {
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
          total: number;
        });
        break;
      case "admin_register":
        subject = "🔑 Acceso Autorizado al CRM - SynFlow IA";
        htmlContent = getAdminRegisterHtml(data as { name: string; email: string; }, siteUrl);
        break;
      default:
        return NextResponse.json({ error: "Tipo de correo inválido" }, { status: 400 });
    }

    // Load SMTP Credentials from env, defaulting to Google SMTP if user/pass are provided
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASSWORD;
    const host = process.env.SMTP_HOST || (user ? "smtp.gmail.com" : undefined);
    const port = parseInt(process.env.SMTP_PORT || "465");
    const from = process.env.SMTP_FROM || (user ? `"SynFlow IA" <${user}>` : '"SynFlow IA" <no-reply@synflow-ia.vercel.app>');

    // Check if real SMTP configurations are provided
    if (host && user && pass) {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465, // True for port 465, false for other ports
        auth: { user, pass },
      });

      await transporter.sendMail({
        from,
        to,
        subject,
        html: htmlContent,
      });

      console.log(`[SMTP] Correo enviado exitosamente a ${to}. Asunto: ${subject}`);
      return NextResponse.json({ success: true, message: `Correo real enviado a ${to}` });
    } else {
      // Mock sending by logging beautifully to the server console
      console.log("\n==================================================");
      console.log(`✉️ SIMULADOR DE ENVÍO DE CORREOS - SYNFLOW IA`);
      console.log(`   Destinatario: ${to}`);
      console.log(`   Remitente:    ${from}`);
      console.log(`   Asunto:       ${subject}`);
      console.log("--------------------------------------------------");
      console.log(`   [HTML BODY TEMPLATE GENERATED]`);
      console.log(htmlContent.trim());
      console.log("==================================================\n");

      return NextResponse.json({
        success: true,
        simulated: true,
        message: "Correo simulado con éxito (detalles impresos en consola del servidor Next.js)",
      });
    }
  } catch (error: unknown) {
    console.error("Error en la API de envíos de correo:", error);
    return NextResponse.json(
      { error: "Error interno al enviar la notificación." },
      { status: 500 }
    );
  }
}
