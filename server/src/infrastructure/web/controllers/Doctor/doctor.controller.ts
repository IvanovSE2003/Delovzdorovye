import { Request, Response, NextFunction } from "express";
import DoctorRepository from "../../../../core/domain/repositories/doctor.repository.js";
import ProfDataRespository from "../../../../core/domain/repositories/profData.repository.js"
import ApiError from "../../error/ApiError.js";
import FileService from "../../../../core/domain/services/file.service.js";
import Doctor from "../../../../core/domain/entities/doctor.entity.js";
import UserRepository from "../../../../core/domain/repositories/user.repository.js";

export default class DoctorController {
    constructor(
        private readonly doctorRepository: DoctorRepository,
        private readonly profDataRepository: ProfDataRespository,
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
            const { data: dataString, comment, type } = req.body as { data: string; comment?: string; type?: "ADD" | "DELETE" };

            let data: Partial<Doctor>;
            try {
                data = JSON.parse(dataString);
            } catch (parseError) {
                return next(ApiError.badRequest("Неверный формат данных"));
            }

            const doctor = await this.doctorRepository.findById(Number(id));
            if (!doctor) {
                return next(ApiError.badRequest("Специалист не найден"));
            }

            const profDataRecord: any = {
                comment: comment || null,
                type: type || 'ADD'
            };

            if (req.files?.diploma) {
                const diplomaFile = Array.isArray(req.files.diploma)
                    ? req.files.diploma[0]
                    : req.files.diploma;

                try {
                    const fileName = await this.fileService.saveFile(diplomaFile);
                    profDataRecord.new_diploma = fileName;
                } catch (error) {
                    console.error('Ошибка обработки файла диплома:', error);
                    return next(ApiError.internal('Ошибка загрузки диплома'));
                }
            } else if (data.diploma) {
                profDataRecord.new_diploma = data.diploma;
            }

            if (req.files?.license) {
                const licenseFile = Array.isArray(req.files.license)
                    ? req.files.license[0]
                    : req.files.license;

                try {
                    const fileName = await this.fileService.saveFile(licenseFile);
                    profDataRecord.new_license = fileName;
                } catch (error) {
                    console.error('Ошибка обработки файла лицензии:', error);
                    return next(ApiError.internal('Ошибка загрузки лицензии'));
                }
            } else if (data.license) {
                profDataRecord.new_license = data.license;
            }

            if (data.experienceYears !== undefined) {
                profDataRecord.new_experience_years = data.experienceYears;
            }

            if(data.specialization !== undefined) {
                profDataRecord.new_specialization = data.specialization;
            }

            const user = await this.userRepository.findByDoctorId(doctor.id);
            if (!user) {
                return next(ApiError.badRequest("Пользователь для данного доктора не найден"));
            }
            profDataRecord.userId = user.id;
            await this.profDataRepository.create(profDataRecord);

            return res.json({
                success: true,
                message: "Изменения отправлены на модерацию",
                changes: {
                    experienceYears: data.experienceYears !== undefined,
                    diploma: profDataRecord.new_diploma !== undefined,
                    license: profDataRecord.new_license !== undefined
                }
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