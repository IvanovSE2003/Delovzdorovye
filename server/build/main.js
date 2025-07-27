import express from 'express';
import dotenv from 'dotenv';
import sequelize from './db.js';
import models from './models/models.js';
import cors from 'cors';
import router from './routes/index.js';
import errorHandler from './midlewares/ErrorHandlingMidleware.js';
const User = models.User;
dotenv.config();
const PORT = process.env.PORT || 5000;
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', router);
app.use(errorHandler);
const start = async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync();
        app.listen(PORT, () => {
            console.log(`Сервер запустился на порте: ${PORT}`);
        });
    }
    catch (e) {
        console.log(e);
    }
};
start();
//# sourceMappingURL=main.js.map