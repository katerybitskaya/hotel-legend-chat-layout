(function () {
    if (document.getElementById('chatbot-widget-container')) return;

    const socketScript = document.createElement('script');
    //socketScript.src = 'http://localhost:3000/socket.io/socket.io.js'; //для локального
    socketScript.src = 'https://hotel.altora.ovh/socket.io/socket.io.js'; //для VNS
    socketScript.onload = initChatbot;
    document.head.appendChild(socketScript);

    function initChatbot() {
        const SERVER_URL = 'hotel.altora.ovh'; //для VNS
        //const SERVER_URL = 'http://localhost:3000'; //для локального

        function generateUUID() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }

        function setCookie(name, value, days) {
            var expires = "";
            if (days) {
                var date = new Date();
                date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                expires = "; expires=" + date.toUTCString();
            }
            // Secure только на https — иначе на http браузер не сохранит cookie
            var secure = location.protocol === 'https:' ? '; Secure' : '';
            document.cookie = name + "=" + (value || "") + expires + "; path=/" + secure + "; SameSite=Strict";
        }

        function getCookie(name) {
            var nameEQ = name + "=";
            var ca = document.cookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ') c = c.substring(1, c.length);
                if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
            }
            return null;
        }

        let sessionId = getCookie('chat_session_id');
        if (!sessionId) {
            sessionId = generateUUID();
            setCookie('chat_session_id', sessionId, 365);
        }

        const style = document.createElement('style');
        style.textContent = `
            #chatbot-widget-container {
                position: fixed;
                bottom: 30px;
                right: 30px;
                z-index: 9999;
                font-family: 'Jost', sans-serif;
            }
            #chatbot-toggle-btn {
                background: var(--black, #0a0a08);
                color: var(--gold, #c9a96e);
                border: 1px solid var(--gold, #c9a96e);
                border-radius: 50%;
                width: 60px;
                height: 60px;
                cursor: pointer;
                box-shadow: 0 4px 20px rgba(0,0,0,0.4);
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
            }
            #chatbot-toggle-btn svg {
                width: 24px;
                height: 24px;
                stroke-width: 1.5;
            }
            #chatbot-toggle-btn:hover {
                transform: scale(1.05);
                background: var(--gold, #c9a96e);
                color: var(--black, #0a0a08);
                box-shadow: 0 6px 25px rgba(201,169,110,0.25);
            }
            #chatbot-window {
                display: none;
                flex-direction: column;
                width: 380px;
                height: 440px;
                max-height: 70vh;
                background: var(--mid, #1c1c18);
                border: 1px solid var(--border, rgba(201,169,110,0.18));
                border-radius: 4px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.5);
                position: absolute;
                bottom: 80px;
                right: 0;
                overflow: hidden;
                animation: slideIn 0.4s cubic-bezier(0.22, 1, 0.36, 1);
            }
            @media (max-width: 480px) {
                #chatbot-widget-container {
                    right: 16px;
                    bottom: 16px;
                    left: 16px;
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                }
                #chatbot-window {
                    width: 100%;
                    max-width: none;
                    left: 0;
                    right: 0;
                    height: 65vh;
                    max-height: 65vh;
                }
            }
            @keyframes slideIn {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            #chatbot-header {
                background: var(--panel, #161614);
                border-bottom: 1px solid var(--border, rgba(201,169,110,0.18));
                color: var(--gold, #c9a96e);
                padding: 18px 20px;
                font-family: 'Cormorant Garamond', serif;
                font-size: 1.2rem;
                letter-spacing: 0.05em;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            #chatbot-header span {
                text-transform: uppercase;
                letter-spacing: 0.1em;
                font-size: 0.9rem;
            }
            #chatbot-close {
                background: transparent;
                border: none;
                color: var(--text-dim, #7a7669);
                cursor: pointer;
                font-size: 18px;
                transition: color 0.2s;
            }
            #chatbot-close:hover {
                color: var(--gold, #c9a96e);
            }
            #chatbot-messages {
                flex: 1;
                padding: 20px;
                overflow-y: auto;
                background-color: var(--mid, #1c1c18);
                display: flex;
                flex-direction: column;
                gap: 16px;
            }
            #chatbot-messages::-webkit-scrollbar { width: 4px; }
            #chatbot-messages::-webkit-scrollbar-track { background: var(--mid, #1c1c18); }
            #chatbot-messages::-webkit-scrollbar-thumb { background: var(--gold-dark, #8b6d3f); border-radius: 2px; }

            .chat-message {
                max-width: 85%;
                padding: 12px 16px;
                font-size: 0.85rem;
                line-height: 1.6;
                position: relative;
            }
            .chat-message.user {
                align-self: flex-end;
                background-color: var(--gold, #c9a96e);
                color: var(--black, #0a0a08);
                border-radius: 12px 12px 0 12px;
                font-weight: 500;
            }
            .chat-message.bot {
                align-self: flex-start;
                background-color: var(--panel, #161614);
                color: var(--text, #d4cfc5);
                border: 1px solid var(--border, rgba(201,169,110,0.18));
                border-radius: 12px 12px 12px 0;
            }
            #chatbot-input-area {
                padding: 16px;
                border-top: 1px solid var(--border, rgba(201,169,110,0.18));
                display: flex;
                gap: 10px;
                background: var(--panel, #161614);
            }
            #chatbot-input {
                flex: 1;
                background: transparent;
                padding: 10px 0;
                border: none;
                border-bottom: 1px solid var(--border, rgba(201,169,110,0.18));
                color: var(--white, #f5f2ec);
                font-family: 'Jost', sans-serif;
                font-size: 0.9rem;
                outline: none;
                transition: border-color 0.2s;
            }
            #chatbot-input::placeholder {
                color: var(--text-dim, #7a7669);
                font-size: 0.8rem;
                letter-spacing: 0.05em;
                text-transform: uppercase;
            }
            #chatbot-input:focus {
                border-bottom-color: var(--gold, #c9a96e);
            }
            #chatbot-send {
                background: transparent;
                color: var(--gold, #c9a96e);
                border: 1px solid var(--gold, #c9a96e);
                border-radius: 50%;
                width: 40px;
                height: 40px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
                font-size: 0.8rem;
            }
            #chatbot-send:hover {
                background: var(--gold, #c9a96e);
                color: var(--black, #0a0a08);
            }
        `;
        document.head.appendChild(style);

        const container = document.createElement('div');
        container.id = 'chatbot-widget-container';
        container.innerHTML = `
            <div id="chatbot-window">
                <div id="chatbot-header">
                    <span>Legend Assistant</span>
                    <button id="chatbot-close">✕</button>
                </div>
                <div id="chatbot-messages">
                    <div class="chat-message bot">Welcome to Hotel Legend. How can I make your stay exceptional?</div>
                </div>
                <form id="chatbot-input-area">
                    <input type="text" id="chatbot-input" placeholder="Type a message..." autocomplete="off" />
                    <button type="submit" id="chatbot-send">➤</button>
                </form>
            </div>
            <button id="chatbot-toggle-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
            </button>
        `;
        document.body.appendChild(container);

        const socket = io(SERVER_URL, {
            query: {
                sessionId: sessionId
            },
            // Сразу пробуем WebSocket (без долгого старта через HTTP-polling);
            // если WebSocket недоступен — автоматически переключаемся на polling
            transports: ['websocket', 'polling'],
            tryAllTransports: true
        });

        const toggleBtn = document.getElementById('chatbot-toggle-btn');
        const chatWindow = document.getElementById('chatbot-window');
        const closeBtn = document.getElementById('chatbot-close');
        const form = document.getElementById('chatbot-input-area');
        const input = document.getElementById('chatbot-input');
        const messagesDiv = document.getElementById('chatbot-messages');

        toggleBtn.addEventListener('click', () => {
            chatWindow.style.display = chatWindow.style.display === 'flex' ? 'none' : 'flex';
            if (chatWindow.style.display === 'flex') input.focus();
        });

        closeBtn.addEventListener('click', () => {
            chatWindow.style.display = 'none';
        });

        function appendMessage(text, sender) {
            const div = document.createElement('div');
            div.classList.add('chat-message', sender);
            div.textContent = text;
            messagesDiv.appendChild(div);
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const msg = input.value.trim();
            if (msg) {

                appendMessage(msg, 'user'); 
                socket.emit('chat message', msg);
                input.value = '';
            }
        });

        socket.on('chat message', (msg) => {
            appendMessage(msg, 'bot'); 
        });
    }
})();
