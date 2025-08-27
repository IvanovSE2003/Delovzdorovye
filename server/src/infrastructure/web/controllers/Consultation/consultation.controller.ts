import { Request, Response, NextFunction } from "express";
import ProblemRepository from "../../../../core/domain/repositories/problem.repository.js";
import ApiError from "../../error/ApiError.js";
import ConsultationRepository from "../../../../core/domain/repositories/consultation.repository.js";

export default class ConsultationController {
    constructor(
        private readonly problemRepository: ProblemRepository,
        private readonly consultationRepository: ConsultationRepository
    ) { }

    async findProblmesAll(req: Request, res: Response, next: NextFunction) {
        try {
            const problems = await this.problemRepository.findAll();
            if (!problems) {
                return next(ApiError.badRequest('Проблемы не найдены'));
            }

            return res.status(200).json(problems);
        } catch (e: any) {
            return next(ApiError.internal(e.message));
        }
    }

    async findDateForProblem(req: Request, res: Response, next: NextFunction) {
        try {
            // const { problems } = req.body as string[];

        } catch (e: any) {
            return next(ApiError.internal(e.message));
        }
    }
}
