import express from 'express'
import dotenv from 'dotenv'
import sequelize from './infrastructure/persostence/db/db.js'
import cors from 'cors'
import router from './infrastructure/web/routes/index.js'
import errorHandler from './infrastructure/web/middleware/ErrorHandlingMidleware.js';
import fileUpload from 'express-fileupload'
import path from 'path'
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser'
import { createServer } from 'http';
// import { timerService } from './socket/timer.service.init.js'
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import { WebSocketServer, WebSocket } from 'ws';

dayjs.extend(utc);
dayjs.extend(timezone);

dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();
const server = createServer(app);
const wss = new WebSocketServer({
    server,
    path: '/ws',
    clientTracking: true
});

export const clients = new Map<{ role: any; userId?: any }, WebSocket>();

wss.on('connection', (ws) => {
    let userData: { role: any; userId?: any } | null = null;

    ws.on('pong', () => {
        console.log('Соединение активировано');
    });

    ws.on('message', (msg) => {
        let data;
        try {
            data = JSON.parse(msg.toString());
        } catch {
            return;
        }

        if (data.type === 'join') {
            const userId = data.userId;
            userData = { userId, role: data.role };
            clients.set(userData, ws);
        }

        if (data.type === 'ping') {
            ws.send(JSON.stringify({
                type: 'pong'
            }));
        }

        if (data.type === 'pong') {
            console.log('Получено сообщение от клиента');
        }
    });

    ws.on('close', () => {
        for (const [userId, socket] of clients) {
            if (socket === ws) {
                clients.delete(userId);
                break;
            }
        }
    });
});

app.use(cors({
    credentials: true,
    origin: "http://localhost:5173"
}));

app.use(express.json());
app.use(express.static(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'static')));
app.use(fileUpload({}));
app.use(cookieParser());
app.use('/api', router);

app.use(errorHandler);

const start = async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync();
        server.listen(PORT, () => {
            console.log(`Сервер запустился на порте: ${PORT}`);
        });
    } catch (e) {
        console.log(e);
    }
}


start()