document.addEventListener('DOMContentLoaded', (event) => {
    const msgerForm = get(".msger-inputarea");
    const msgerInput = get(".msger-input");
    const msgerChat = get(".msger-chat");

    let ws = new WebSocket(`ws://localhost:7424`);
    let connected = false;
    let user = null;
    let meta = null;
    let messages = [];
    let prompt = window.prompt('Enter your name:');

    const SECOND_PERSON_IMG = "man.svg";
    const FIRST_PERSON_IMG = "https://image.flaticon.com/icons/svg/145/145867.svg";
    const FIRST_PERSON_NAME = prompt;

    ws.onopen = function(e) {
        console.log('[open] Connection established');
        if (prompt) {
            ws.send(JSON.stringify({intent: 'join', data: {name: prompt}}));
        }
    };

    ws.onmessage = function(event) {
        console.log(`[message] Data received from server: ${event.data}`);
        let data = JSON.parse(event.data);
        let message = JSON.parse(data.message);
        switch (data.channel) {
            case 'join:new':
                if (message.user.name === prompt) {
                    connected = true;
                    user = message.user;

                    fetch('http://localhost:2312/api/messages/' + message.room._id)
                        .then(response => response.json())
                        .then(data => {
                            meta = data.meta;
                            messages = data.data;

                            messages.forEach((each) => {
                                if (each.userID === user._id) {
                                    appendMessage(FIRST_PERSON_NAME, FIRST_PERSON_IMG, "right", each.text);
                                } else {
                                    appendMessage(each.user.name, SECOND_PERSON_IMG, "left", each.text);
                                }
                            });
                        });
                }
                break;
            case 'message:new':
                messages.push(message.message);
                if (user._id !== message.user._id) {
                    appendMessage(message.user.name, SECOND_PERSON_IMG, "left", message.message.text);
                }
                break;
            default:
                console.log(data.channel);
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

    msgerForm.addEventListener("submit", event => {
        event.preventDefault();

        const msgText = msgerInput.value;
        if (!msgText || !connected) return;

        appendMessage(FIRST_PERSON_NAME, FIRST_PERSON_IMG, "right", msgText);
        ws.send(JSON.stringify({intent: 'send', data: {text: msgText}}));
        msgerInput.value = "";
    });

    function appendMessage(name, img, side, text) {
        const msgHTML = `
            <div class="msg ${side}-msg">
                <div class="msg-img" style="background-image: url(${img})"></div>
                
                <div class="msg-bubble">
                <div class="msg-info">
                    <div class="msg-info-name">${name}</div>
                    <div class="msg-info-time">${formatDate(new Date())}</div>
                </div>
                
                <div class="msg-text">${text}</div>
                </div>
            </div>
        `;

        msgerChat.insertAdjacentHTML("beforeend", msgHTML);
        msgerChat.scrollTop += 500;
    }
});

// Utils
function get(selector, root = document) {
    return root.querySelector(selector);
}

function formatDate(date) {
    const h = "0" + date.getHours();
    const m = "0" + date.getMinutes();

    return `${h.slice(-2)}:${m.slice(-2)}`;
}
