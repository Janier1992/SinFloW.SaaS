import { GoogleGenerativeAI } from "@google/generative-ai";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Define the interface for messages
interface Message {
    role: "user" | "model" | "system";
    content: string;
}

// Initialize Redis only if url and token are present
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null;

// Create a new ratelimiter, that allows 10 requests per 10 seconds per IP
const ratelimit = redis
    ? new Ratelimit({
        redis: redis,
        limiter: Ratelimit.slidingWindow(10, "10 s"),
        analytics: true,
    })
    : null;

// Validar token de Turnstile en lado Servidor (Cloudflare)
async function verifyTurnstileToken(token: string) {
    const secret = process.env.TURNSTILE_SECRET_KEY;
    if (!secret) return true; // Bypass si no está configurado (para desarrollo)

    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(token)}`,
    });

    const data = await response.json();
    return data.success;
}

export async function POST(req: Request) {
    try {
        // Implement Rate Limiting by IP if Redis is configured
        if (ratelimit) {
            const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
            const { success, limit, reset, remaining } = await ratelimit.limit(`synflow_chat_${ip}`);

            if (!success) {
                return new Response("Too Many Requests. You have exceeded the rate limit.", {
                    status: 429,
                    headers: {
                        "X-RateLimit-Limit": limit.toString(),
                        "X-RateLimit-Remaining": remaining.toString(),
                        "X-RateLimit-Reset": reset.toString(),
                    },
                });
            }
        }

        // Ya no hacemos fallback a NEXT_PUBLIC para seguridad.
        const apiKey = process.env.GOOGLE_API_KEY;

        if (!apiKey) {
            console.error("Falta GOOGLE_API_KEY en variables de entorno");
            return new Response("Error de configuración del servidor.", { status: 500 });
        }

        const body = await req.json();
        const { messages, systemInstruction, turnstileToken } = body;

        // Verify Turnstile (Anti-Bot)
        // Require token if secret is configured in env
        if (process.env.TURNSTILE_SECRET_KEY) {
            if (!turnstileToken) {
                return new Response("Se requiere validación de seguridad (Captcha).", { status: 403 });
            }
            const isValid = await verifyTurnstileToken(turnstileToken);
            if (!isValid) {
                return new Response("Validación de seguridad fallida. Intenta nuevamente.", { status: 403 });
            }
        }

        // Ensure we always have messages
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return new Response("Payload de mensajes inválido", { status: 400 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);

        // Usamos gemini-2.5-flash
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: systemInstruction,
        });

        // Format history for Gemini SDK
        const history = messages.slice(0, -1).map((msg: Message) => ({
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: msg.content }]
        }));

        const userMessage = messages[messages.length - 1].content;

        const chat = model.startChat({ history });
        const result = await chat.sendMessageStream(userMessage);

        const encoder = new TextEncoder();


        const readable = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of result.stream) {
                        if (chunk.text) {
                            controller.enqueue(encoder.encode(chunk.text()));
                        }
                    }
                } catch (streamError) {
                    console.error("Stream generation error:", streamError);
                    controller.error(streamError);
                } finally {
                    controller.close();
                }
            }
        });

        return new Response(readable, {
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });

    } catch (error: unknown) {
        // Sanitización: Log detallado en servidor, mensaje genérico al cliente
        console.error("API Route Chat Error:", error);
        return new Response("Ocurrió un error al procesar la solicitud. Por favor, intenta de nuevo más tarde.", { status: 500 });
    }
}
