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
    <div class="footer">
      SynFlow IA • Inteligencia Artificial y Automatización en Medellín<br>
      © ${new Date().getFullYear()} SynFlow. Todos los derechos reservados.
    </div>
  </div>
</body>
</html>
`;

// 3. HTML Template for notifying the client that their quote has been approved/sent
const getQuoteApprovedHtml = (data: { client: string; services: string; total: number }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #F8FAFC; color: #334155; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 30px auto; background-color: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .header { background: linear-gradient(135deg, #0A0F1C 0%, #1E293B 100%); padding: 40px 30px; text-align: center; }
    .header h1 { margin: 0; color: #00E0FF; font-size: 26px; font-weight: bold; }
    .content { padding: 35px 30px; line-height: 1.6; }
    .price-box { text-align: center; background-color: rgba(0, 224, 255, 0.05); border: 1px dashed #00E0FF; border-radius: 12px; padding: 25px; margin: 25px 0; }
    .price-box span { font-size: 12px; font-weight: bold; color: #64748B; text-transform: uppercase; letter-spacing: 1px; }
    .price-box h2 { font-size: 32px; font-weight: 900; color: #0F172A; margin: 5px 0 0 0; font-family: monospace; }
    .button { display: inline-block; background-color: #22C55E; color: #FFFFFF !important; font-weight: bold; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-size: 14px; text-align: center; }
    .footer { text-align: center; padding: 20px; background-color: #0A0F1C; font-size: 11px; color: #94A3B8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Presupuesto Aprobado</h1>
    </div>
    <div class="content">
      <h2 style="color: #0F172A; font-size: 18px; margin-top: 0;">Estimado cliente de ${data.client},</h2>
      <p>Nos complace informarte que hemos finalizado la estimación comercial de los servicios de ingeniería solicitados.</p>
      <p>Tu propuesta detallada para <strong>${data.services}</strong> ya está configurada en nuestro portal y lista para iniciar ejecución.</p>
      
      <div class="price-box">
        <span>Presupuesto Comercial Estimado (Con Impuesto)</span>
        <h2>${new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(data.total)}</h2>
      </div>

      <p style="margin-bottom: 30px;">Para avanzar con la planeación de sprints y el inicio de desarrollo técnico, por favor confirma tu aprobación respondiendo a este correo o contactando a tu director de cuenta directamente por WhatsApp.</p>
      
      <div style="text-align: center;">
        <a href="https://wa.me/573044769593?text=Hola,%20he%20recibido%20el%20presupuesto%20por%20${data.total}%20y%20quiero%20iniciar%20el%20servicio" class="button">Aprobar e Iniciar Desarrollo</a>
      </div>
    </div>
    <div class="footer">
      SynFlow IA • Inteligencia Artificial y Automatización en Medellín<br>
      © ${new Date().getFullYear()} SynFlow. Todos los derechos reservados.
    </div>
  </div>
</body>
</html>
`;

// 4. HTML Template for admin user registration confirmation
const getAdminRegisterHtml = (data: { name: string; email: string }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #0A0F1C; color: #E5E7EB; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background-color: #111827; border: 1px solid #1F2937; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3); }
    .header { background: linear-gradient(135deg, #00E0FF 0%, #7B5CFF 100%); padding: 30px; text-align: center; }
    .header h1 { margin: 0; color: #FFFFFF; font-size: 24px; font-weight: bold; letter-spacing: -0.5px; }
    .content { padding: 30px; text-align: center; }
    .auth-badge { display: inline-block; padding: 6px 12px; background-color: rgba(34, 197, 94, 0.15); border: 1px solid rgba(34, 197, 94, 0.3); color: #22C55E; font-size: 12px; font-weight: bold; border-radius: 9999px; text-transform: uppercase; margin-bottom: 20px; }
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
      <p style="margin-top: 0; font-size: 16px; color: #D1D5DB; line-height: 1.5; text-align: left;">
        Hola, <strong>${data.name}</strong>.
      </p>
      <p style="font-size: 15px; color: #9CA3AF; line-height: 1.5; text-align: left;">
        Tu cuenta con el correo electrónico <strong style="color: #00E0FF;">${data.email}</strong> ha sido creada exitosamente y se encuentra **totalmente autorizada** para acceder al Portal Administrativo de **SynFlow IA**.
      </p>
      <p style="font-size: 15px; color: #9CA3AF; line-height: 1.5; text-align: left;">
        Ya puedes iniciar sesión en el portal utilizando tus credenciales para gestionar solicitudes de servicios, estimar cotizaciones y moderar testimonios.
      </p>
      <div style="margin: 30px 0; text-align: center;">
        <a href="https://synflow.io" style="display: inline-block; background: linear-gradient(135deg, #00E0FF 0%, #7B5CFF 100%); color: #FFFFFF; font-weight: bold; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-size: 14px; box-shadow: 0 4px 10px rgba(0, 224, 255, 0.2);">Ir a SynFlow IA</a>
      </div>
    </div>
    <div class="footer">
      SynFlow IA • Inteligencia Artificial y Automatización en Medellín<br>
      © ${new Date().getFullYear()} SynFlow. Todos los derechos reservados.
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
        htmlContent = getQuoteApprovedHtml(data as { client: string; services: string; total: number; });
        break;
      case "admin_register":
        subject = "🔑 Acceso Autorizado al CRM - SynFlow IA";
        htmlContent = getAdminRegisterHtml(data as { name: string; email: string; });
        break;
      default:
        return NextResponse.json({ error: "Tipo de correo inválido" }, { status: 400 });
    }

    // Load SMTP Credentials from env, defaulting to Google SMTP if user/pass are provided
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASSWORD;
    const host = process.env.SMTP_HOST || (user ? "smtp.gmail.com" : undefined);
    const port = parseInt(process.env.SMTP_PORT || "465");
    const from = process.env.SMTP_FROM || (user ? `"SynFlow IA" <${user}>` : '"SynFlow IA" <no-reply@synflow.io>');

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
