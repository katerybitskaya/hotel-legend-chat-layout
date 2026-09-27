const express = require('express');
const http = require('http');
const https = require('https');
const fs = require('fs');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

const ENV_FILE = process.env.ENV_FILE
    || (fs.existsSync(path.join(__dirname, '.env.local')) ? '.env.local' : '.env');
dotenv.config({ path: path.join(__dirname, ENV_FILE) });

const { GoogleGenAI } = require("@google/genai");

const app = express();
app.use(cors());

app.use(express.static(path.join(__dirname, 'public')));

const HISTORY_DIR = path.join(__dirname, 'history');
if (!fs.existsSync(HISTORY_DIR)) {
    fs.mkdirSync(HISTORY_DIR);
}

let knowledgeBase = '';
try {
    knowledgeBase = fs.readFileSync(path.join(__dirname, 'chatbot', 'knowledge-base.md'), 'utf8');
} catch (err) {
    console.error("Error reading chatbot/knowledge-base.md:", err);
    knowledgeBase = "Knowledge base is unavailable.";
}

let systemInstruction = '';
try {
    systemInstruction = fs.readFileSync(path.join(__dirname, 'chatbot', 'prompt.md'), 'utf8');
} catch (err) {
    console.error("Error reading chatbot/prompt.md:", err);
    systemInstruction = "You are a helpful AI assistant.";
}

const GEM_MODEL = process.env.GEM_MODEL || "gemini-2.5-flash";
const ai = new GoogleGenAI({ apiKey: process.env.GEM_KEY });

const USE_HTTPS = process.env.USE_HTTPS === 'true';
const server = USE_HTTPS
    ? https.createServer({
        key: fs.readFileSync(path.join(__dirname, process.env.SSL_KEY || 'ss.key')),
        cert: fs.readFileSync(path.join(__dirname, process.env.SSL_CERT || 'ss.crt')),
    }, app)
    : http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});


function getTimestamp() {
    const now = new Date();
    const pad = (num) => (num < 10 ? '0' + num : num);
    return (
        now.getFullYear().toString() +
        pad(now.getMonth() + 1) +
        pad(now.getDate()) +
        '_' +
        pad(now.getHours()) +
        pad(now.getMinutes()) +
        pad(now.getSeconds())
    );
}

io.on('connection', (socket) => {
    const sessionId = socket.handshake.query.sessionId || 'unknown_session';
    console.log(`New client connected: ${socket.id}, Session ID: ${sessionId}`);

    const sessionFileBase = `${getTimestamp()}_${sessionId}.json`;
    const sessionFilePath = path.join(HISTORY_DIR, sessionFileBase);

    let conversationHistory = [];

    socket.on('chat message', async (msg) => {
        console.log(`[${sessionId}] User:`, msg);

        conversationHistory.push({ role: 'user', content: msg });

        saveHistory(sessionFilePath, conversationHistory);

        const historyText = conversationHistory
            .map(entry => `${entry.role === 'user' ? 'USER' : 'AI'}: ${entry.content}`)
            .join('\n');

        let prompt = `
            KNOWLEDGE BASE:
            ${knowledgeBase}

            CONVERSATION HISTORY:
            ${historyText}
            
            `;


        try {
            console.log(`[${sessionId}] Using Gemini...`);
            const response = await ai.models.generateContent({
                model: GEM_MODEL,
                contents: prompt,
                // chatbot/prompt.md — роль и правила ответа ассистента
                config: { systemInstruction },
            });

            const aiResponseText = response.text || "Sorry, I couldn't generate a response.";

            console.log(`[${sessionId}] AI:`, aiResponseText);
            conversationHistory.push({ role: 'assistant', content: aiResponseText });
            saveHistory(sessionFilePath, conversationHistory);

            socket.emit('chat message', aiResponseText);

        } catch (error) {
            console.error("AI Error:", error);
            const errorMsg = "Sorry, an error occurred while generating a response.";
            socket.emit('chat message', errorMsg);
        }
    });

    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
    });
});

function saveHistory(filePath, history) {
    fs.writeFile(filePath, JSON.stringify(history, null, 2), (err) => {
        if (err) console.error("Error saving history:", err);
    });
}

const PORT = Number(process.env.PORT) || 3000;
server.listen(PORT, () => {
    console.log(`Server running on ${USE_HTTPS ? 'https' : 'http'}://localhost:${PORT} (settings: ${ENV_FILE})`);
});
