import { Request, Response, NextFunction } from "express";
import DoctorRepository from "../../../../core/domain/repositories/doctor.repository.js";
import ApiError from "../../error/ApiError.js";

export default class DoctorController {
    constructor(
        private readonly doctorRepository: DoctorRepository
    ) {}

    async getAllDoctors(req: Request, res: Response, next: NextFunction) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            
            const filters = {
                specialization: req.query.specialization as string | undefined,
                isActive: req.query.isActive !== undefined 
                    ? req.query.isActive === 'true' 
                    : undefined,
                gender: req.query.gender as string | undefined,
                experienceMin: req.query.experienceMin 
                    ? parseInt(req.query.experienceMin as string) 
                    : undefined,
                experienceMax: req.query.experienceMax 
                    ? parseInt(req.query.experienceMax as string) 
                    : undefined
            };
            
            const result = await this.doctorRepository.findAll(page, limit, filters);
            
            res.status(200).json({
                success: true,
                data: result.doctors,
                pagination: {
                    currentPage: page,
                    totalPages: result.totalPages,
                    totalItems: result.totalCount,
                    itemsPerPage: limit
                }
            });
        } catch (error) {
            next(ApiError.internal('Ошибка при получении списка докторов'));
        }
    }
}