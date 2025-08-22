import { Request, Response, NextFunction } from "express";
import DoctorRepository from "../../../../core/domain/repositories/doctor.repository.js";
import ApiError from "../../error/ApiError.js";
import BatchRepository from "../../../../core/domain/repositories/batch.repository.js";
import FileService from "../../../../core/domain/services/file.service.js";
import Doctor from "../../../../core/domain/entities/doctor.entity.js";
import { UploadedFile } from "express-fileupload";
import UserRepository from "../../../../core/domain/repositories/user.repository.js";

export default class DoctorController {
    constructor(
        private readonly doctorRepository: DoctorRepository,
        private readonly batchRepository: BatchRepository,
        private readonly fileService: FileService,
        private readonly userRepository: UserRepository
    ) { }

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

            return res.status(200).json({
                success: true,
                data: result.doctors,
                pagination: {
                    currentPage: page,
                    totalPages: result.totalPages,
                    totalItems: result.totalCount,
                    itemsPerPage: limit
                }
            });
        } catch (e: any) {
            return next(ApiError.internal(e.message));
        }
    }

    async getOne(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const doctor = await this.doctorRepository.findByUserId(Number(id));
            if (!doctor) {
                return next(ApiError.badRequest('Пользователь не найден'));
            }
            return res.status(200).json(doctor);
        } catch (e: any) {
            return next(ApiError.badRequest(e.message));
        }
    }

    async updateDoctor(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { data } = req.body as { data: Partial<Doctor> };

            const doctor = await this.doctorRepository.findById(Number(id));
            if (!doctor) {
                return next(ApiError.badRequest("Доктор не найден"));
            }

            const fileFields: (keyof Doctor)[] = ["diploma", "license"];
            for (const field of fileFields) {
                const file = req.files?.[field] as UploadedFile | undefined;
                if (file) {
                    const fileName = await this.fileService.saveFile(file);
                    data[field] = fileName as any; 
                }
            }

            const allowedFields: (keyof Doctor)[] = [
                "specializations",
                "experienceYears",
                "diploma",
                "license",
            ];

            const changes = Object.entries(data)
                .filter(([field]) => allowedFields.includes(field as keyof Doctor))
                .map(([field, newValue]) => {
                    const key = field as keyof Doctor;
                    const oldValue = doctor[key];
                    return {
                        field_name: FIELD_TRANSLATIONS[field] || field,
                        old_value: oldValue != null ? String(oldValue) : null,
                        new_value: String(newValue),
                    };
                });

            if (!changes.length) {
                return next(ApiError.badRequest("Нет допустимых полей для изменения"));
            }

            const user = await this.userRepository.findByDoctorId(doctor.id);
            if (!user) {
                return next(ApiError.badRequest("Пользователь для данного доктора не найден"));
            }

            await this.batchRepository.createBatchWithChangesUser(user.id, changes);

            return res.json({
                success: true,
                message: "Изменения отправлены на модерацию",
            });
        } catch (e: any) {
            return next(ApiError.internal(e.message));
        }
    }

    async getTimeSlotByDoctorId(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const doctor = await this.doctorRepository.findById(Number(id));

            if (!doctor) {
                return next(ApiError.badRequest('Доктор не найден'));
            }

            const timeSlots = await this.doctorRepository.getTimeSlots(doctor.id);
            return res.status(200).json(timeSlots);
        } catch (e: any) {
            return next(ApiError.badRequest(e.message));
        }
    }
}

const FIELD_TRANSLATIONS: Record<string, string> = {
    specialization: 'Специализация',
    experienceYears: 'Опыт работы',
    diploma: 'Диплом',
    license: 'Лицензия',
};