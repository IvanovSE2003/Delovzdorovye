import jwt from "jsonwebtoken"
import { Request, Response, NextFunction } from "express"
import UserJwtPayload from "../types/UserJwtPayload.js";

export default function roleMiddleware(role: string) {
    return function authMiddleware(req: Request, res: Response, next: NextFunction) {
        if (req.method === 'OPTIONS') {
            return next();
        }
        
        try {
            const token = req.headers.authorization?.split(' ')[1];
            
            if (!token) {
                return res.status(401).json({message: "Пользователь не авторизован!"});
            }
            
            if (!process.env.SECRET_KEY) {
                throw new Error('SECRET_KEY не установлен');
            }
            
            const decoded = jwt.verify(token, process.env.SECRET_KEY);
            
            if (typeof decoded === 'object' && decoded !== null && 
                'id' in decoded && 'email' in decoded && 'role' in decoded) {
                
                const user = decoded as UserJwtPayload;
                if (user.role !== role) {
                    return res.status(403).json({message: "Нет доступа!"}); 
                }
                
                req.user = user;
                next();
            } else {
                return res.status(401).json({message: "Неверный формат токена"});
            }
        } catch (e) {
            return res.status(401).json({message: "Пользователь не авторизован!"});
        }
    }
}