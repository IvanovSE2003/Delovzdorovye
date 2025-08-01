import ApiError from "../error/ApiError.js";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import UserJwtPayload from "../types/UserJwtPayload.js";
import TokenService from "../service/tokenService.js";

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
        
        const userData = TokenService.validateAccessToken(token);
        if(!userData) {
            return next(ApiError.notAuthorized('Пользователь не авторизирован'));
        }
        req.user = userData as any;
        next();
    } catch (e) {
        return next(ApiError.notAuthorized('Пользователь не авторизирован'));
    }
}