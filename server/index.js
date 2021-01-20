import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import routes from './routes';
import wsRoutes from './wsRoutes';
import WebSocket from 'ws';
import { ConnectDB } from './db/db';

const app = express();
const router = express.Router();
routes(router);

app.use(cors());
app.use(express.static('./server/public'));
app.use('/', router);
app.get('*', (req, res) => res.status(200).send({
    message: 'Welcome to the beginning of nothingness.',
}));

// Connect to DB
ConnectDB().then((db) => {
    app.listen(process.env.PORT, () =>
        console.log(`Chat app listening on port ${process.env.PORT}!`),
    );

    const wss = new WebSocket.Server({ port: process.env.WS_PORT });
    wss.on('connection', function connection(ws, req) {
        wsRoutes(ws, req, db);
    });
});
