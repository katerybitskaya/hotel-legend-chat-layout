const io = require('socket.io-client');

const socket = io('http://localhost:3000', {
    // rejectUnauthorized: false
});

socket.on('connect', () => {
    console.log('Connected to server');

    const message = "Co robimy na zajęciach?";
    console.log(`Sending: ${message}`);
    socket.emit('chat message', message);
});

socket.on('chat message', (msg) => {
    console.log(`Received: ${msg}`);
    socket.disconnect();
});

socket.on('connect_error', (err) => {
    console.error('Connection error:', err.message);
    socket.disconnect();
});
