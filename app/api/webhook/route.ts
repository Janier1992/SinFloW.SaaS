import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Obtenemos la URL del webhook desde las variables de entorno
        const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;

        if (!webhookUrl) {
            console.error("N8N Webhook URL no está configurada.");
            return NextResponse.json(
                { error: "Configuración de servidor incompleta." },
                { status: 500 }
            );
        }

        // Realizamos la petición de servidor a servidor para evitar problemas de CORS
        const response = await fetch(webhookUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Error del Webhook de N8N:", response.status, errorText);

            // Si es un 404 y es la URL de test, probablemente n8n no está "escuchando"
            if (response.status === 404 && webhookUrl.includes("webhook-test")) {
                return NextResponse.json(
                    { error: "El Webhook de prueba no está escuchando. Haz clic en 'Listen for Test Event' en n8n." },
                    { status: 404 }
                );
            }

            return NextResponse.json(
                { error: `Error en n8n: ${response.statusText}` },
                { status: response.status }
            );
        }

        const data = await response.json().catch(() => ({}));

        return NextResponse.json({ success: true, data });
    } catch (error: unknown) {
        console.error("Error interno en el proxy del Webhook:", error);
        return NextResponse.json(
            { error: "Error de red al intentar conectar con el servidor." },
            { status: 500 }
        );
    }
}
