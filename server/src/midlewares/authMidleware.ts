import ApiError from "../error/ApiError.js";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import UserJwtPayload from "../types/UserJwtPayload.js";

export default function authMiddleware(req: Request, res: Response, next: NextFunction) {
    if (req.method === 'OPTIONS') {
        return next();
    }
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return next(ApiError.notAuthorized('Пользователь не авторизирован'));
        }
        
        if (!process.env.SECRET_KEY) {
            throw new Error('SECRET_KEY не установлен');
        }
        
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        if (typeof decoded === 'object' && decoded !== null && 
            'id' in decoded && 'email' in decoded && 'role' in decoded) {
            req.user = decoded as UserJwtPayload;
            next();
        } else {
            return next(ApiError.tokenInvalid('Не верный формат токена'));
        }
        next();
    } catch (e) {
        return next(ApiError.notAuthorized('Пользователь не авторизирован'));
    }
}