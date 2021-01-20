import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import routes from './routes';
import wsRoutes from './wsRoutes';
import WebSocket from 'ws';
import db from './db/db';
import redis from './db/redis';

const app = express();
const router = express.Router();
routes(router);

app.use(cors());
app.use(express.static('./server/public'));
app.use('/', router);
app.get('*', (req, res) => res.status(200).send({
    message: 'Welcome to the beginning of nothingness.',
}));

redis.Connect();
redis.GetSubscriber().subscribe('message:new');

// Connect to DB
db.Connect().then(() => {
    app.listen(process.env.PORT, () =>
        console.log(`Chat app listening on port ${process.env.PORT}!`),
    );

    const wss = new WebSocket.Server({ port: process.env.WS_PORT });
    wss.on('connection', function connection(ws, req) {
        wsRoutes(ws, req);

        redis.GetSubscriber().on('message', (channel, message) => {
            console.log("Message '" + message + "' on channel '" + channel + "' arrived!");
            wss.clients.forEach(function each(client) {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(message);
                }
            });
        });
    });
});
