import ApiError from "../error/ApiError.js";
import { Request, Response, NextFunction } from "express";
import TokenService from "../../../core/domain/services/token.service.js";


declare global {
    namespace Express {
        interface Request {
            user?: { id: number; email: string; role: string };
        }
    }
}

export default function authMiddleware(tokenService: TokenService) {
    return async function (req: Request, res: Response, next: NextFunction) {
        if (req.method === 'OPTIONS') {
            return next();
        }
        try {
            const token = req.headers.authorization;
            if (!token) return next(ApiError.notAuthorized('Пользователь не авторизован'));

            const accessToken = token.split(' ')[1];
            if (!accessToken) return next(ApiError.notAuthorized('Пользователь не авторизован'));

            const userData = tokenService.validateAccessToken(accessToken)
            if (!userData) return next(ApiError.notAuthorized('Пользователь не авторизован'));

            req.user = userData;
            next();
        } catch (e) {
            return next(ApiError.notAuthorized('Неверный токен авторизации'));
        }
    };
}