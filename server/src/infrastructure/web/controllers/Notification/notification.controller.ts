import { NextFunction, Request, Response } from "express";
import NotificationRepository from "../../../../core/domain/repositories/notifaction.repository"
import ApiError from "../../error/ApiError";

export default class NotificationContorller {
    constructor(
        public readonly notificationReposiotory: NotificationRepository
    ) { }

    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const {limit, page} = req.query;
            const notifactions = await this.notificationReposiotory.findAll(Number(page), Number(limit));
            res.status(200).json(notifactions)
        } catch (e: any) {
            return next(ApiError.internal(e.message));
        }
    }
}