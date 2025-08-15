import { Request, Response, NextFunction } from "express";
import DoctorRepository from "../../../../core/domain/repositories/doctor.repository.js";
import ApiError from "../../error/ApiError.js";
import BatchRepository from "../../../../core/domain/repositories/batch.repository.js";
import Batch from "../../../../core/domain/entities/batch.entity.js";

export default class DoctorController {
    constructor(
        private readonly doctorRepository: DoctorRepository,
        private readonly batchRepository: BatchRepository
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

    async updateDoctor(req: Request, res: Response, next: NextFunction) {
        const {doctorId, data} = req.body;

        const doctor = this.doctorRepository.findById(Number(doctorId));

        if(!doctor) {
            next(ApiError.badRequest('Доктор не найден'));
        }

        data.map(async (value: string, key: string, index: number) => {
            const batch = new Batch(index, 'pending', '', false, key, "", value);
            await this.batchRepository.save(batch);
        });
    }
}