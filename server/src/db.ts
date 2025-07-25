import 'dotenv/config'
import { Sequelize } from 'sequelize';

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

// const sequelizeModel = new Sequelize(
//     process.env.DB_NAME,
//     process.env.DB_USER,
//     process.env.DB_PASSWORD,
//     {
//         dialect: "postgres",
//         host: process.env.DB_HOST,
//         port: dbPort,  
//     }
// );

const sequelizeModel = new Sequelize(
    "medice",
    "postgres",
    "1",
    {
        dialect: "postgres",
        host: "localhost",
        port: 5432,  
    }
);

export default sequelizeModel