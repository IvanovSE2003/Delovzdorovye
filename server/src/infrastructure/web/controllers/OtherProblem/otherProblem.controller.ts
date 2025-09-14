import { NextFunction, Request, Response } from "express";
import OtherProblemRepository from "../../../../core/domain/repositories/otherProblem.repository"
import ApiError from "../../error/ApiError";
import OtherProblem from "../../../../core/domain/entities/otherProblem.entity";
import UserRepository from "../../../../core/domain/repositories/user.repository";
import { convertUserTimeToMoscow } from "../../function/transferTime";

export default class OtherProblemController {
    constructor(
        private readonly otherProblemRepository: OtherProblemRepository,
        private readonly userRepository: UserRepository
    ) { }

    async findAll(req: Request, res: Response, next: NextFunction) {
        try {
            const otherProblems = await this.otherProblemRepository.findAll();
            if(otherProblems && otherProblems.length === 0) {
                return next(ApiError.badRequest('Записи других проблем не найдены'));
            }
            res.status(200).json(otherProblems)
        } catch (e: any) {
            return next(ApiError.internal(e.message));
        }
    }

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const {textOtherProblem, time, date, userId} = req.body;

            const user = await this.userRepository.findById(Number(userId));
            if(!user) {
                return next(ApiError.badRequest('Пользователь не найден'));
            }

            const { newTime: moscowTime, newDate: moscowDate } = convertUserTimeToMoscow(date, time, user.timeZone);

            await this.otherProblemRepository.save(new OtherProblem(0, moscowTime, moscowDate, textOtherProblem, userId));
            return res.status(201).json({success: true, message: "Заявка успешно отправлена"});
        } catch(e: any) {
            return next(ApiError.internal(e.message))
        }
    }
}