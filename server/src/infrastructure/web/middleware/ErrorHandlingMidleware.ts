import ApiError from "../error/ApiError.js";
import { Request, Response, NextFunction } from "express";

export default function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
    if(err instanceof ApiError) {
        return res.status(err.status).json({success: err.success, message: err.message})
    }
    return res.status(500).json({ 
        message: err.message,
        success: err.success,
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
}