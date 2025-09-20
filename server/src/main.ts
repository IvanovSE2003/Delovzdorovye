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
import { Server } from 'socket.io';
import { timerService } from './socket/timer.service.init.js'
import cron from 'node-cron';
import models from './infrastructure/persostence/models/models.js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import videoConferenceService from './socket/videoConferenceService.js'

dayjs.extend(utc);
dayjs.extend(timezone);

dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["https://lithely-truthful-polecat.cloudpub.ru"],
        methods: ["GET", "POST"]
    }
});

videoConferenceService.setIo(io);
timerService.setIo(io);

app.use(cors({
    origin: "https://lithely-truthful-polecat.cloudpub.ru",
    credentials: true
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
        // await timerService.restoreTimers();

        cron.schedule('*/5 * * * *', async () => {
            try {
                const nowMoscow = dayjs().tz('Europe/Moscow');

                const consultations = await models.Consultation.findAll({
                    where: {
                        consultation_status: 'UPCOMING'
                    }
                });

                for (const consult of consultations) {
                    const consultDateTime = dayjs.tz(
                        `${consult.date} ${consult.time}`,
                        'YYYY-MM-DD HH:mm',
                        'Europe/Moscow'
                    );

                    if (consultDateTime.add(2, 'hour').isBefore(nowMoscow)) {
                        await consult.update({ consultation_status: 'ARCHIVE' });
                        console.log(`Консультация ${consult.id} завершена автоматически`);
                    }
                }
            } catch (e) {
                console.error('Ошибка при авто-завершении консультаций:', e);
            }
        }, {
            timezone: 'Europe/Moscow'
        });


        server.listen(PORT, () => {
            console.log(`Сервер запустился на порте: ${PORT}`);
        });
    } catch (e) {
        console.log(e)
    }
}


start()