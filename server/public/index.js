let ws = new WebSocket(`ws://localhost:7424`);
let connected = false;
let prompt = window.prompt('Enter your name:');

ws.onopen = function(e) {
    console.log('[open] Connection established');
    // ws.send(JSON.stringify({intent: 'send', data: {text: 'Hello World'}}));
    if (prompt) {
        ws.send(JSON.stringify({intent: 'join', data: {name: prompt}}));
    }
};

ws.onmessage = function(event) {
    console.log(`[message] Data received from server: ${event.data}`);
    let data = JSON.parse(event.data);
    let message = JSON.parse(data.message);
    if (data.channel === 'join:new') {
        if (message.user.name === prompt) {
            connected = true;
        }
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
