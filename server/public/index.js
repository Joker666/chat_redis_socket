let ws = new WebSocket(`ws://localhost:7424`);
let connected = false;

ws.onopen = function(e) {
    console.log('[open] Connection established');
    console.log('Sending to server');
    ws.send(JSON.stringify({intent: 'join', data: {name: 'Rafi'}}));
    setInterval(() => {
        if (connected) {
            console.log('Sending message');
            ws.send(JSON.stringify({intent: 'send', data: {text: 'Hello World'}}));
        }
    }, 3000);
};

ws.onmessage = function(event) {
    console.log(`[message] Data received from server: ${event.data}`);
    let data = JSON.parse(event.data);
    if (data.status && data.status === 'Connected') {
        connected = true;
    }
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
