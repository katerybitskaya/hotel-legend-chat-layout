# GENERAL DESCRIPTION
Node.js + Express + Socket.IO service handling the backend for the chatbot widget.
The server runs on port 3000 with SSL enabled (HTTPS).
Upon connecting to the server, the client receives a unique session identifier, which is assigned to a cookie.
With each connection to the server, the client passes the session identifier.

Add to the server in the historia directory, a file named YYYYMMDD_HHMMSS_sessionID.json with the conversation history.
Include the history in the prompt sent to Gemini.
The file is added upon each connection to the server, not after sending a message.

In the .env file there is a variable CHAT_WLASNY=true or false
If true, uses own AI
If false, uses Gemini

# SYSTEM ARCHITECTURE

## Backend (serwis.js)
- Framework: Express.js.
- Protocol: HTTPS (keys `ss.key`, `ss.crt`).
- WebSocket: Socket.IO (with CORS `*` support).
- Functionality: Serving static files from `public/` and broadcasting chat messages (`chat message`).

## Frontend (public/chatbot.js)
- Standalone chatbot widget script.
- Dynamically loads Socket.IO client.
- Injects CSS styles and HTML structure of the widget into the page.
- Implements logic for sending/receiving messages and UI (toggle button, chat window).

# TECHNICAL DESCRIPTION
- Language: JavaScript (Node.js).
- Backend libraries: `express`, `https`, `fs`, `socket.io`, `cors`, `path`.
- Frontend libraries: `socket.io-client` (loaded dynamically).

# CONFIGURATION
- Port: 3000
- Server address: `https://*:3000`


# GEMINI API
Key (GEM_KEY) and model (GEM_MODEL) available in .env file
```
const { GoogleGenAI } = require("@google/genai");

// Configure API key from environment variable GEM_KEY
const ai = new GoogleGenAI({ apiKey: process.env.GEM_KEY });

async function main() {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "Explain how AI works in a few words",
  });
  console.log(response.text);
}

main();
```