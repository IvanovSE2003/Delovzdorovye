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

dotenv.config()

const PORT = process.env.PORT || 5000
const app = express()
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true 
}))
app.use(express.json())
app.use(express.static(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'static')))
app.use(fileUpload({}))
app.use(cookieParser())
app.use('/api', router)

app.use(errorHandler)

const start = async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync();
        app.listen(PORT, () => {
            console.log(`Сервер запустился на порте: ${PORT}`);
        })
    } catch(e) {
        console.log(e)
    }
}


start()