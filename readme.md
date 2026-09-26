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
│   ├── script.js       # Page interactions
│   └── chatbot.js      # Chatbot UI & socket client
├── serwis.js           # Node.js server (Express + Socket.io + Gemini)
├── ecosystem.config.js # PM2 process manager config (production)
├── bazawiedzy.md       # Chatbot knowledge base about the hotel
├── prompt.md           # System prompt / persona for the AI assistant
├── package.json
├── .env.example        # Template for .env
└── .env                # API keys (not in repository)
```

## Setup

1. Install Node.js (v20+ recommended)
2. Clone the repository and install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the project root (copy `.env.example`):
   ```env
   GEM_KEY=your_google_gemini_api_key
   GEM_MODEL=gemini-2.5-flash
   CHAT_WLASNY=false
   ```
   The port is fixed in `serwis.js` (`const PORT = 3000`) and is not read from `.env`.
4. Start the server:
   ```bash
   node serwis.js
   ```
5. Open `http://localhost:3000` in your browser.

## Chatbot Configuration

The chatbot behaviour is controlled by two Markdown files:
- **`bazawiedzy.md`** — knowledge base with information about the hotel (rooms, dining, amenities, etc.)
- **`prompt.md`** — system instruction that defines the AI assistant's persona and rules

Edit these files to customise the chatbot without touching the server code.

## Production

The server can be managed by PM2:
```bash
pm2 start ecosystem.config.js
pm2 save
```

## Notes

- `.env`, `historia/` (chat history), and SSL certificate files are excluded from Git.
- For local development the server uses plain HTTP. SSL is available via commented-out code in `serwis.js`.
