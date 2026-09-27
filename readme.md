# Hotel Legend — Landing Page & AI Chatbot

A luxurious landing page for **Hotel Legend** featuring a modern design and an integrated AI assistant powered by Google Gemini.

## Technologies

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Backend:** Node.js, Express.js
- **Real-time communication:** Socket.io
- **AI:** Google Gemini API (`@google/genai`)

## Project Structure

```
hotel/
├── public/             # Static frontend files served by Node.js
│   ├── index.html      # Main landing page
│   ├── style.css       # Styles
│   ├── fonts.css       # Self-hosted font faces
│   ├── fonts/          # Cormorant Garamond & Jost (woff2, SIL OFL)
│   ├── script.js       # Page interactions
│   └── chatbot.js      # Chatbot UI & socket client
├── server.js           # Node.js server (Express + Socket.io + Gemini)
├── ecosystem.config.js # PM2 process manager config
├── chatbot/            # Files used by the AI assistant
│   ├── knowledge-base.md # Knowledge base about the hotel
│   └── prompt.md       # System prompt / persona for the AI assistant
├── package.json
├── .env.example        # Settings template (copy to .env)
└── .env                # Your settings and API key (not in repository)
```

## Setup

1. Install Node.js (v20+ recommended)
2. Clone the repository and install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file from the template and set at least `GEM_KEY`:
   ```bash
   cp .env.example .env
   ```
   ```env
   PORT=3000
   USE_HTTPS=false
   GEM_KEY=your_google_gemini_api_key
   GEM_MODEL=gemini-2.5-flash
   ```
   `USE_HTTPS=true` serves `https://localhost:PORT` with your own certificate
   (`SSL_KEY` / `SSL_CERT`). The chatbot widget connects to the same address the page was opened
   from, so no URLs need to be changed in the frontend.
4. Start the server — one of two ways:
   - **Node.js** (the terminal window must stay open):
     ```bash
     node server.js
     ```
   - **PM2** (runs in the background; install once with `npm install -g pm2`):
     ```bash
     pm2 start ecosystem.config.js
     ```
     Useful commands: `pm2 logs server`, `pm2 restart server`, `pm2 stop server`.
5. Open `http://localhost:3000` in your browser.

## Chatbot Configuration

The chatbot behaviour is controlled by two Markdown files in the `chatbot/` folder:
- **`knowledge-base.md`** — knowledge base with information about the hotel (rooms, dining, amenities, etc.)
- **`prompt.md`** — system instruction that defines the AI assistant's persona and rules

Edit these files to customise the chatbot without touching the server code.

## Notes

- `.env`, `.env.*` (except `.env.example`), `history/` (chat history) and SSL certificate files are excluded from Git.
- By default the server uses plain HTTP (`USE_HTTPS=false`).
