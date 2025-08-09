import ApiError from "../error/ApiError.js";
import { Request, Response, NextFunction } from "express";

export default function adminMiddleware() {
    return function (req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                return next(ApiError.badRequest('Пользователь не авторизован'));
            }

            if (req.user.role !== 'ADMIN') {
                return next(ApiError.badRequest('Доступ запрещен. Требуются права администратора'));
            }

            next();
        } catch (e) {
            if (e instanceof ApiError) {
                return next(e);
            }
            return next(ApiError.internal('Ошибка при проверке прав администратора'));
        }
    };
}