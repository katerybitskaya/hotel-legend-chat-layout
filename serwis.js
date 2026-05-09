const express = require('express');
const https = require('https');
const fs = require('fs');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

const { GoogleGenAI } = require("@google/genai");

const app = express();
app.use(cors());

app.use(express.static(path.join(__dirname, 'public')));

const HISTORY_DIR = path.join(__dirname, 'historia');
if (!fs.existsSync(HISTORY_DIR)) {
    fs.mkdirSync(HISTORY_DIR);
}

let knowledgeBase = '';
try {
    knowledgeBase = fs.readFileSync('bazawiedzy.md', 'utf8');
} catch (err) {
    console.error("Error reading bazawiedzy.md:", err);
    knowledgeBase = "Knowledge base is unavailable.";
}

let systemInstruction = '';
try {
    systemInstruction = fs.readFileSync('prompt.md', 'utf8');
} catch (err) {
    console.error("Error reading prompt.md:", err);
    systemInstruction = "You are a helpful AI assistant.";
}

const GEM_MODEL = process.env.GEM_MODEL || "gemini-2.5-flash";
const ai = new GoogleGenAI({ apiKey: process.env.GEM_KEY });

const options = {
    key: fs.readFileSync('ss.key'),
    cert: fs.readFileSync('ss.crt')
};

const server = https.createServer(options, app);
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

    saveHistory(sessionFilePath, conversationHistory);

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
            let aiResponseText = "";

            if (process.env.CHAT_WLASNY === 'true') {
                console.log(`[${sessionId}] Using Custom AI...`);

                const postData = JSON.stringify({
                    "base_model_name": "Llama-3.1-8B",
                    "adapter_name": "wsi",
                    "system_prompt": systemInstruction,
                    "prompt": prompt
                });

                const http = require('http');

                const options = {
                    hostname: '10.40.50.152',
                    port: 8000,
                    path: '/generate',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': Buffer.byteLength(postData)
                    }
                };

                aiResponseText = await new Promise((resolve, reject) => {
                    const req = http.request(options, (res) => {
                        let data = '';
                        res.setEncoding('utf8');
                        res.on('data', (chunk) => { data += chunk; });
                        res.on('end', () => {
                            try {
                                if (res.statusCode !== 200) {
                                    reject(new Error(`Server returned status code ${res.statusCode}: ${data}`));
                                    return;
                                }
                                const json = JSON.parse(data);
                                console.log(`[${sessionId}] Custom AI response model:`, json.model_used);
                                resolve(json.response);
                            } catch (e) {
                                reject(e);
                            }
                        });
                    });

                    req.on('error', (e) => {
                        reject(e);
                    });

                    req.write(postData);
                    req.end();
                });

            } else {
                console.log(`[${sessionId}] Using Gemini...`);
                const response = await ai.models.generateContent({
                    model: GEM_MODEL,
                    contents: prompt,
                });

                aiResponseText = response.text || "Sorry, I couldn't generate a response.";
            }

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

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running on https://localhost:${PORT}`);
});
