// websocket.js
const WebSocket = require('ws');
let clients = [];

function initWebSocket(port, onClientConnected) {
    const wss = new WebSocket.Server({ port });

    wss.on('connection', (ws) => {
        clients.push(ws);
        console.log('Client connected');

        ws.on('message', (message) => {
            console.log(`Received message from client: ${message}`);
        });

        ws.on('close', () => {
            console.log('Client disconnected');
            clients = clients.filter(client => client !== ws);
        });

        // Call the onClientConnected callback when a client connects
        if (typeof onClientConnected === 'function') {
            onClientConnected();
        }
    });

    console.log(`WebSocket server running on port ${port}`);
}

function sendMessage(command, params) {
    const message = JSON.stringify({
        message: 'invokeFunction',
        functionName: command,
        params: params
    });
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

module.exports = { initWebSocket, sendMessage };