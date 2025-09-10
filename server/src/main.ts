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
import { Op } from 'sequelize';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

dayjs.extend(utc);
dayjs.extend(timezone);

dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

timerService.setIo(io);

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));
app.use(express.json());
app.use(express.static(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'static')));
app.use(fileUpload({}));
app.use(cookieParser());
app.use('/api', router);

app.use(errorHandler);


io.on('connection', (socket) => {
    console.log('Клиент подключился:', socket.id);

    socket.on('join-consultation', (consultationId: number) => {
        socket.join(`consultation-${consultationId}`);
        console.log(`Клиент ${socket.id} присоединился к консультации ${consultationId}`);
    });

    socket.on('leave-consultation', (consultationId: number) => {
        socket.leave(`consultation-${consultationId}`);
        console.log(`Клиент ${socket.id} покинул консультацию ${consultationId}`);
    });

    socket.on('payment-success', (data: { consultationId: number }) => {
        timerService.stopTimer(data.consultationId);
        console.log(`Оплата успешна для консультации: ${data.consultationId}`);

        socket.to(`consultation-${data.consultationId}`).emit('payment-confirmed', {
            consultationId: data.consultationId,
            message: 'Оплата подтверждена'
        });
    });

    socket.on('disconnect', () => {
        console.log('Клиент отключился:', socket.id);
    });
});


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

                // const expiredConsultations = await models.Consultation.findAll({
                //     where: {
                //         consultation_status: 'UPCOMING',
                //         payment_status: 'PAYMENT',
                //         reservation_expires_at: { [Op.lt]: now.toDate() }
                //     }
                // });

                // for (const consult of expiredConsultations) {
                //     const slot = await models.DoctorSlots.findOne({
                //         where: {
                //             doctorId: consult.doctorId,
                //             date: consult.date,
                //             time: consult.time
                //         }
                //     });

                //     if (slot) {
                //         await slot.update({ status: 'OPEN' });
                //     }

                //     // 3️⃣ Обновляем консультацию
                //     await consult.update({ payment_status: 'NOTPAID' });

                //     console.log(`⏰ Сброшена бронь консультации ${consult.id}, слот освобождён`);
                // }

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