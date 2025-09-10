import { NextFunction, Request, Response } from "express";
import OtherProblemRepository from "../../../../core/domain/repositories/otherProblem.repository"
import ApiError from "../../error/ApiError";

export default class OtherProblemController {
    constructor(
        private readonly otherProblemRepository: OtherProblemRepository
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
}