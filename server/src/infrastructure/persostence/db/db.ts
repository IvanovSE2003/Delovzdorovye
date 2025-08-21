import 'dotenv/config'
import dotenv from 'dotenv'
import { Sequelize } from 'sequelize';

dotenv.config()

if (
    !process.env.DB_NAME || 
    !process.env.DB_USER || 
    !process.env.DB_PASSWORD || 
    !process.env.DB_HOST || 
    !process.env.DB_PORT
) {
    throw new Error("В переменных среды отсутствует конфигурация базы данных");
}

const dbPort = parseInt(process.env.DB_PORT, 10);

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        dialect: "postgres",
        host: process.env.DB_HOST,
        port: dbPort,  
        logging: false,
    }
);

sequelize.authenticate()
    .then(() => {
        console.log('✅ Подключение к PostgreSQL установлено');
    })
    .catch((err: Error) => {
        console.error('❌ Ошибка подключения к PostgreSQL:', err.message);
        process.exit(1); // Завершаем процесс при ошибке
    });

export default sequelize