import ApiError from "../error/ApiError.js";
import { Request, Response, NextFunction } from "express";

export default function errorHandler(err: object, req: Request, res: Response, next: NextFunction) {
    if(err instanceof ApiError) {
        return res.status(err.status).json({messange: err.message, errors: err.errors})
    }
    return res.status(500).json({ 
        message: 'Непредвиденная ошибка сервера',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
}