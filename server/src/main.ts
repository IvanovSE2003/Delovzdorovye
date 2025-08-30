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
import ConsultationRepositoryImpl from './core/application/repositories/consultations.repository.impl.js'
import TimeSlotRepositoryImpl from './core/application/repositories/timeSlot.repository.impl.js'
import TimerServiceImpl from './core/application/services/timer.service.impl.js'
import { createServer } from 'http';
import { Server } from 'socket.io';
import { timerService } from './socket/timer.service.init.js'

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
    console.log('✅ Клиент подключился:', socket.id);

    socket.on('join-consultation', (consultationId: number) => {
        socket.join(`consultation-${consultationId}`);
        console.log(`👥 Клиент ${socket.id} присоединился к консультации ${consultationId}`);
    });

    socket.on('leave-consultation', (consultationId: number) => {
        socket.leave(`consultation-${consultationId}`);
        console.log(`👋 Клиент ${socket.id} покинул консультацию ${consultationId}`);
    });

    socket.on('payment-success', (data: { consultationId: number }) => {
        timerService.stopTimer(data.consultationId);
        console.log(`💳 Оплата успешна для консультации: ${data.consultationId}`);

        socket.to(`consultation-${data.consultationId}`).emit('payment-confirmed', {
            consultationId: data.consultationId,
            message: 'Оплата подтверждена'
        });
    });

    socket.on('disconnect', () => {
        console.log('❌ Клиент отключился:', socket.id);
    });
});


const start = async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync();
        // await timerService.restoreTimers();
        server.listen(PORT, () => {
            console.log(`🚀 Сервер запустился на порте: ${PORT}`);
        });
    } catch (e) {
        console.log(e)
    }
}


start()