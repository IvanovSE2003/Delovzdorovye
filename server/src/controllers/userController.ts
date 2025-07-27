import { Request, Response, NextFunction} from "express";
import ApiError from "../error/ApiError.js";
import models from "../models/models.js"; 
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const {User} = models;

const generateJwt = (id: number, email: string, role: string) => {
    return jwt.sign({id, email, role}, process.env.SECRET_KEY as string, {expiresIn: '24h'})
}

class UserController {
    static async registrations(req: Request, res: Response, next: NextFunction) {
        const {email, password, role, name, surname, patronymic, phone, pin_code, gender, date_birth, time_zone} = req.body
        if(!email || !password) {
            return next(ApiError.badRequest('Некорректный email или пароль'))
        }
        const candidate = await User.findOne({where: {email}})
        if(candidate) {
            return next(ApiError.badRequest('Пользователь с таким email уже есть в системе'))
        }
        const hashPassoword = await bcrypt.hash(password, 5)
        const user = await User.create({email, role, password: hashPassoword, name, surname, patronymic, phone, pin_code, gender, date_birth, time_zone})
        const token = generateJwt(user.id, user.email, user.role)
        return res.json({token})
    }


    static async login(req: Request, res: Response, next: NextFunction) {
        const {email, password} = req.body;
        const user = await User.findOne({where: {email}})
        if (!user) {
            return next(ApiError.internal('Пользователь с таким именем не найден'))
        }
        let comparePassword = bcrypt.compareSync(password, user.password)
        if(!comparePassword) {
            return next(ApiError.internal('Не верный пароль пользователя'));
        }
        const token = generateJwt(user.id, user.email, user.role)
        return res.json({token})
    }

    static async check(req: Request, res: Response, next: NextFunction) {
        if (!req.user) {
            return next(ApiError.internal('Пользователь не авторизован'));
        }
        const token = generateJwt(req.user.id as number, req.user.email, req.user.role);
        return res.json({token});
    }
}

export default UserController;