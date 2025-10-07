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
import { timerService } from './socket/timer.service.init.js'
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import { WebSocketServer, WebSocket } from 'ws';
import adminController from './infrastructure/web/controllers/Admin/admin.controller.interface.js'

dayjs.extend(utc);
dayjs.extend(timezone);

dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

export const clients = new Map<number, WebSocket>();

wss.on('connection', (ws) => {
    let userData: { role: any; userId?: any } | null = null; 
    let intervalId: string | number | NodeJS.Timeout | null | undefined = null;

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
            clients.set(userId, ws);

            intervalId = setInterval(() => {
                if (ws.readyState === WebSocket.OPEN) {
                    let info;

                    if (userData?.role === 'ADMIN') {
                        info = { type: 'info', message: 'Привет, админ!', timestamp: Date.now() };
                    } else if (userData?.role === 'PATIENT') {
                        info = { type: 'info', message: 'Привет, пользователь!', timestamp: Date.now() };
                    } else {
                        info = { type: 'info', message: 'Привет, специалист!', timestamp: Date.now() };
                    }

                    ws.send(JSON.stringify(info));
                }
            }, 5000);
        }
    });

    ws.on('close', () => {
        // Убираем клиента из списка
        for (const [userId, socket] of clients) {
            if (socket === ws) {
                clients.delete(userId);
                break;
            }
        }

        // Останавливаем интервал
        if (intervalId) clearInterval(intervalId);
    });
});

app.use(cors({
    credentials: true,
    origin: ["https://affably-clear-rat.cloudpub.ru", "http://localhost:5173"],
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
        console.log(e)
    }
}


start()