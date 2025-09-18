import { NextFunction, Request, Response } from "express";
import OtherProblemRepository from "../../../../core/domain/repositories/otherProblem.repository"
import ApiError from "../../error/ApiError";
import OtherProblem from "../../../../core/domain/entities/otherProblem.entity";
import UserRepository from "../../../../core/domain/repositories/user.repository";
import { convertUserTimeToMoscow } from "../../function/transferTime";
import NotificationRepository from "../../../../core/domain/repositories/notifaction.repository";
import Notification from "../../../../core/domain/entities/notification.entity";

export default class OtherProblemController {
    constructor(
        private readonly otherProblemRepository: OtherProblemRepository,
        private readonly userRepository: UserRepository,
        private readonly notificationRepository: NotificationRepository
    ) { }

    async findAll(req: Request, res: Response, next: NextFunction) {
        try {
            const otherProblems = await this.otherProblemRepository.findAll();
            if (otherProblems && otherProblems.length === 0) {
                return next(ApiError.badRequest('Записи других проблем не найдены'));
            }
            res.status(200).json(otherProblems)
        } catch (e: any) {
            return next(ApiError.internal(e.message));
        }
    }

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const { textOtherProblem, time, date, userId } = req.body;

            const user = await this.userRepository.findById(Number(userId));
            if (!user) return next(ApiError.badRequest('Пользователь не найден'));

            const { newTime: moscowTime, newDate: moscowDate } = convertUserTimeToMoscow(date, time, user.timeZone);

            await this.otherProblemRepository.save(
                new OtherProblem(
                    0,
                    moscowTime,
                    moscowDate,
                    textOtherProblem,
                    user.id
                )
            );

            await this.notificationRepository.save(
                new Notification(
                    0,
                    "Ваша проблема в обработке",
                    "Проблема будет обрабората администратором в ближайшее время",
                    "WARNING",
                    false,
                    null,
                    null,
                    user.id
                )
            )

            return res.status(201).json({
                success: true,
                message: "Заявка успешно отправлена"
            });
        } catch (e: any) {
            return next(ApiError.internal(e.message))
        }
    }

    async findByUserId(req: Request, res: Response, next: NextFunction) {
        try {
            const {userId} = req.params;
            const user = await this.userRepository.findById(Number(userId));
            if(!user) return next(ApiError.badRequest('Пользователь не найден'));

            const otherProblems = await this.otherProblemRepository.findAllByUser(user.id);

            res.status(200).json(otherProblems);
        } catch(e: any) {
            return next(ApiError.internal(e.message));
        }
    }
}