let ws = new WebSocket(`ws://localhost:7424`);

ws.onopen = function(e) {
    console.log('[open] Connection established');
    console.log('Sending to server');
    ws.send(JSON.stringify({intent: 'join', data: {name: 'Rafi'}}));
};

ws.onmessage = function(event) {
    console.log(`[message] Data received from server: ${event.data}`);
};

ws.onclose = function(event) {
    if (event.wasClean) {
        console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
    } else {
        console.log('[close] Connection died');
    }
};

ws.onerror = function(error) {
    console.log(`[error] ${error.message}`);
};
