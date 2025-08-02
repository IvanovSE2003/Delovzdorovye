import ApiError from "../error/ApiError.js";
import path from 'path';
import mailService from "./mailService.js";
import {v4} from 'uuid';
import models from '../models/models.js';
import { NextFunction, Request } from "express";
import fileUpload from 'express-fileupload'
import { fileURLToPath } from 'url';
import bcrypt from "bcrypt";

const {User, Doctor, Patient} = models;

class userService {
    static async registrationUser(req: Request, next: NextFunction) {
        const {email, password, role, name, surname, patronymic, phone, pin_code, gender, date_birth, time_zone} = req.body

            if (!req.files || !req.files.img) {
                return next(ApiError.internal('Файл изображения не загружен'));
            }
            
            const img = req.files.img as fileUpload.UploadedFile; 
            const fileName = v4() + '.jpg';
            const filePath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..','static', fileName);

            if(!email || !password) {
                return next(ApiError.badRequest('Некорректный email или пароль'))
            }

            const candidate = await User.findOne({where: {email}})
            if(candidate) {
                return next(ApiError.badRequest('Пользователь с таким email уже есть в системе'))
            }

            const hashPassoword = await bcrypt.hash(password, 5)
            const activationLink = v4();
            await mailService.sendActivationEmail(email, activationLink);

            const user = await User.create({
                email, 
                role, 
                password: hashPassoword, 
                name, 
                surname, 
                patronymic, 
                phone, 
                pin_code, 
                gender, 
                date_birth, 
                time_zone, 
                img: fileName,
                activationLink,
                isActivated: false
            })

            let patient = {};
            let doctor = {};
            if(user.role === 'PATIENT') {
                const {general_info, analyses_examinations, additionally} = req.body;
                if(!general_info || !analyses_examinations || !additionally) {
                    next(ApiError.badRequest('Данные для пациента не пришли'))
                }
                patient = await Patient.create({general_info, analyses_examinations, additionally})
            } else if(user.role === 'DOCTOR') {
                const {specialization, contacts, experience_years} = req.body;
                if(!specialization || !contacts || !experience_years) {
                    next(ApiError.badRequest('Данные для доктора не пришли'))
                }
                doctor = await Doctor.create({specialization, contacts, experience_years});
            } else {
                next(ApiError.badRequest('Неизвестная роль'))
            }

            await img.mv(filePath);
            return {user, patient, doctor}
    }

    static async login(req: Request, next: NextFunction) {
        const {email, phone, password} = req.body;
        
        let user;
        if(email && !phone) {
            user = await User.findOne({where: {email}});
        } else if(!email && phone) {
            user = await User.findOne({where: {phone}});
        } else {
            return next(ApiError.internal('Укажите email или телефон'));
        }

        if (!user) {
            return next(ApiError.internal('Пользователь не найден'));
        }

        let comparePassword = bcrypt.compareSync(password, user.password)
        
        if(!comparePassword) {
            return next(ApiError.internal('Не верный пароль'));
        }

        return user;
    }
}


export default userService;