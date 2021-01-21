import messageCtrl from './controllers/messageCtrl';
import roomCtrl from './controllers/roomCtrl';

module.exports = (ws, req) => {
    ws.on('message', async function incoming(message) {
        let m = JSON.parse(message);
        switch (m.intent) {
            case 'join':
                await roomCtrl.join(ws, req, m.data);
                break;
            case 'send':
                await messageCtrl.create(ws, req, m.data);
                break;
            default:
                console.log(m.intent);
        }
    });

    ws.on('close', async function close() {
        await roomCtrl.leave(ws);
    });
}
