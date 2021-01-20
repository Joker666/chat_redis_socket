import messageCtrl from './controllers/messageCtrl';
import roomCtrl from './controllers/roomCtrl';

module.exports = (ws, req, db) => {
    ws.on('message', async function incoming(message) {
        let m = JSON.parse(message);
        switch (m.intent) {
            case 'join':
                await roomCtrl.join(ws, req, db, m.data);
                break;
            default:
                console.log("Hello");
        }
    });
}
