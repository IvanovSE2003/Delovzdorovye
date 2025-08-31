import { NextFunction, Request, Response } from "express";
import SpecializationReposotory from "../../../../core/domain/repositories/specializations.repository.js";
import ApiError from "../../error/ApiError.js";
import Specialization from "../../../../core/domain/entities/specialization.entity.js";

export default class SpecializationController {
    constructor(
        public readonly specializationReposiotory: SpecializationReposotory,
    ) { }

    async findAll(req: Request, res: Response, next: NextFunction) {
        try {
            const specializations = await this.specializationReposiotory.findAll();
            if (!specializations) {
                return next(ApiError.badRequest('Специализации не найдены'));
            }
            return res.status(200).json(specializations);
        } catch (e: any) {
            return next(ApiError.badRequest(e.message));
        }
    }

    async createSpecialization(req: Request, res: Response, next: NextFunction) {
        try {
            const { name } = req.body;

            const specialization = new Specialization(0, name);
            const newSpecialization = await this.specializationReposiotory.save(specialization);
            if (!newSpecialization) {
                return next(ApiError.internal('Специализация не создана'));
            }
            res.status(200).json(newSpecialization);
        } catch (e: any) {
            return next(ApiError.internal(e.message));
        }
    }

    async updateSpecialization(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { name } = req.body;

            const specialization = await this.specializationReposiotory.findById(Number(id));

            if (!specialization) {
                return next(ApiError.badRequest('Специализация не найдена'));
            }

            const updateSpecialization = await this.specializationReposiotory.save(specialization.setName(name));
            return res.status(200).json(updateSpecialization);
        } catch (e: any) {
            return next(ApiError.internal(e.message));
        }
    }

    async deleteSpecialization(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const specialization = await this.specializationReposiotory.findById(Number(id));

            if (!specialization) {
                return next(ApiError.badRequest('Специализация не найдена'));
            }

            await this.specializationReposiotory.delete(specialization.id);
            return res.status(204).send();
        } catch (e: any) {
            return next(ApiError.internal(e.message));
        }
    }
}