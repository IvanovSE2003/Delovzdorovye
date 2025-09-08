import { NextFunction, Request, Response } from "express";
import NotificationRepository from "../../../../core/domain/repositories/notifaction.repository"
import ApiError from "../../error/ApiError";
import UserRepository from "../../../../core/domain/repositories/user.repository";

export default class NotificationContorller {
    constructor(
        public readonly notificationReposiotory: NotificationRepository,
        public readonly userRepository: UserRepository
    ) { }

    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const { limit, page } = req.query;
            const notifactions = await this.notificationReposiotory.findAll(Number(page), Number(limit));
            res.status(200).json(notifactions)
        } catch (e: any) {
            return next(ApiError.internal(e.message));
        }
    }

    async getUserId(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId } = req.query;
            const user = await this.userRepository.findById(Number(userId));
            if (!user) {
                return next(ApiError.badRequest('Пользователь не найден'));
            }

            const notifications = await this.notificationReposiotory.findByUserId(user.id);

            res.status(200).json(notifications)
        } catch (e: any) {
            return next(ApiError.internal(e.message));
        }
    }

    async deleteAllNotification(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId } = req.body;

            const user = await this.userRepository.findById(Number(userId));
            if (!user) {
                return next(ApiError.badRequest('Пользователь не найден'));
            }

            await this.notificationReposiotory.deleteByUser(user.id);
            res.status(204).send();
        } catch (e: any) {
            return next(ApiError.internal(e.message));
        }
    }

    async readNotification(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.body;
            const notifaction = await this.notificationReposiotory.findById(Number(id));
            if (!notifaction) {
                return next(ApiError.badRequest('Уведомление не найдено'));
            }
            await this.notificationReposiotory.save(notifaction.setRead(true));
            return res.status(200).send();
        } catch (e: any) {
            return next(ApiError.internal(e.message));
        }
    }

    async getCountNotification(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId, unreadOnly } = req.query;
            const user = await this.userRepository.findById(Number(userId));
            if (!user) {
                return next(ApiError.badRequest("Пользователь не найден"));
            }

            const count = await this.notificationReposiotory.countByUserId(user.id, unreadOnly === "true");

            return res.status(200).json({ count });
        } catch (e: any) {
            return next(ApiError.internal(e.message));
        }
    }

}