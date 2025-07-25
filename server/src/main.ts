import express from 'express'
import dotenv from 'dotenv'
import sequelize from './db.js'

dotenv.config()

const PORT = process.env.PORT || 5000
const app = express()

const start = async () => {
    try {
        await sequelize.authenticate()
        await sequelize.sync()
        app.listen(PORT, () => {
            console.log(`Сервер запустился на порте: ${PORT}`)
        })
    } catch(e) {
        console.log(e)
    }
}


start()