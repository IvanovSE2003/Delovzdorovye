// auth.middleware.ts
import ApiError from "../error/ApiError.js";
import { Request, Response, NextFunction } from "express";
import TokenService from "../../../core/domain/services/token.service.js";

export default function authMiddleware(tokenService: TokenService) {
    return async function (req: Request, res: Response, next: NextFunction) {
        if (req.method === 'OPTIONS') {
            return next();
        }
        
        try {
            const token = req.headers.authorization?.split(' ')[1];
            
            if (!token) {
                return next(ApiError.badRequest('Пользователь не авторизован'));
            }
            
            const userData = tokenService.validateAccessToken(token)            
            if (!userData) {
                return next(ApiError.badRequest('Пользователь не авторизован'));
            }
            
            req.user = userData as any;
            
            next();
        } catch (e) {
            if (e instanceof ApiError) {
                return next(e);
            }
            return next(ApiError.badRequest('Неверный токен авторизации'));
        }
    };
}