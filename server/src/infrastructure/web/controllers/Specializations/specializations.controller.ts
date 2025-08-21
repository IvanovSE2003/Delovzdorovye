import { NextFunction, Request, Response } from "express";
import SpecializationReposotory from "../../../../core/domain/repositories/specializations.repository.js";
import ApiError from "../../error/ApiError.js";

export default class SpecializationController {
    constructor(
        public readonly userSpecializations: SpecializationReposotory,
    ) { }

    async findAll(req: Request, res: Response, next: NextFunction) {
        try {
            const specializations = await this.userSpecializations.findAll();
            if (!specializations) {
                return next(ApiError.badRequest('Специализации не найдены'));
            }
            return res.status(200).json(specializations);
        } catch (e: any) {
            return next(ApiError.badRequest(e.message));
        }
    }
}