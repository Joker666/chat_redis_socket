document.addEventListener('DOMContentLoaded', (event) => {
    const msgerForm = get(".msger-inputarea");
    const msgerInput = get(".msger-input");
    const msgerChat = get(".msger-chat");
    const newJoin = get("#new-join");

    let ws = new WebSocket(`ws://localhost:7424`);
    let connected = false;
    let user = null;
    let room = null;
    let meta = null;
    let joinTimeout = null;
    let leaveTimeout = null;
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
                user = message.user;
                room = message.room;
                if (message.user.name === prompt) {
                    connected = true;

                    fetch('http://localhost:2312/api/messages/' + message.room._id)
                        .then(response => response.json())
                        .then(data => {
                            meta = data.meta;
                            messages = data.data.reverse();

                            messages.forEach((each) => {
                                if (each.userID === user._id) {
                                    appendMessage(FIRST_PERSON_NAME, FIRST_PERSON_IMG, "right", each.text);
                                } else {
                                    appendMessage(each.user.name, SECOND_PERSON_IMG, "left", each.text);
                                }
                            });
                        });
                } else {
                    clearTimeout(joinTimeout);
                    clearTimeout(leaveTimeout);
                    newJoin.textContent = `${user.name} just joined`;
                    joinTimeout = setTimeout(() => {
                        newJoin.textContent = '';
                    }, 3000);
                }
                break;
            case 'message:new':
                messages.push(message.message);
                if (user._id !== message.user._id) {
                    appendMessage(message.user.name, SECOND_PERSON_IMG, "left", message.message.text);
                }
                break;
            case 'join:left':
                clearTimeout(leaveTimeout);
                clearTimeout(joinTimeout);
                newJoin.textContent = `${message.user.name} just left`;
                leaveTimeout = setTimeout(() => {
                    newJoin.textContent = '';
                }, 3000);
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

    msgerChat.addEventListener("scroll", event => {
        if (event.target.scrollTop === 0 && ((meta.skip + meta.limit) < meta.total)) {
            fetch('http://localhost:2312/api/messages/' + room._id + '?skip=' + meta.limit)
                .then(response => response.json())
                .then(data => {
                    meta = data.meta;
                    messages = data.data;

                    messages.forEach((each) => {
                        if (each.userID === user._id) {
                            appendMessage(FIRST_PERSON_NAME, FIRST_PERSON_IMG, "right", each.text, "afterbegin");
                        } else {
                            appendMessage(each.user.name, SECOND_PERSON_IMG, "left", each.text, "afterbegin");
                        }
                    });
                });
        }
    });

    function appendMessage(name, img, side, text, insertPosition = "beforeend") {
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

        msgerChat.insertAdjacentHTML(insertPosition, msgHTML);
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
