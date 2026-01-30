const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const path = require("path");

const SYSTEM_INSTRUCTION = `Eres el Asistente Virtual de Sinflow. Responde brevemente.`;

async function test() {
    try {
        const envPath = path.join(__dirname, "..", ".env.local");
        const envContent = fs.readFileSync(envPath, "utf8");
        const match = envContent.match(/GOOGLE_API_KEY=(.*)/);

        if (!match) {
            console.error("❌ No GOOGLE_API_KEY found");
            return;
        }

        const apiKey = match[1].trim();
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-flash-latest",
            systemInstruction: SYSTEM_INSTRUCTION
        });

        console.log("📡 Testing Gemini 2.0 Flash chat...");

        // Mocking the history flow from the API route
        // This simulates a fresh chat with no history yet
        const chat = model.startChat({
            history: [],
        });

        const result = await chat.sendMessage("Hola, prueba de conexión.");
        const response = await result.response;

        console.log("✅ Success! Response:", response.text());

    } catch (err) {
        console.error("❌ Error:", err);
    }
}

test();
