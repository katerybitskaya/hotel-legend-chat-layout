# Hotel Legend - Web App & AI Chatbot

A luxurious landing page for "Hotel Legend" featuring a modern design and an integrated AI assistant.

## Technologies Used
* **Frontend:** HTML5, modern CSS3, Vanilla JavaScript.
* **Backend:** Node.js, Express.js.
* **Real-time Communication:** Socket.io.
* **AI Integration:** Google Gemini AI (and fallback to local Llama models).

## Project Setup
1. Ensure Node.js is installed.
2. Clone this repository (or open the local folder).
3. Install dependencies by running:
   ```bash
   npm install
   ```
4. Verify or create your environment variables in `.env` (like `GEM_KEY` for Google Gemini). Ensure SSL certificates (`ss.crt`, `ss.key`) are present in the root folder.
5. Start the server:
   ```bash
   node serwis.js
   ```
6. Open your browser and navigate to `https://localhost:3000`. The frontend interface and the chatbot will both run perfectly using this unified port.

## Note
SSL certificates (`ss.crt`, `ss.key`) and environment files like `.env`, as well as the `.gitignore` itself are intentionally ignored by Git to protect sensitive details from being exposed publicly.