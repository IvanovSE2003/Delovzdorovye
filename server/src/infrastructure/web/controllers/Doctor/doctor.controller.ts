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
            const { data: dataString } = req.body as { data: string };

            let data: Partial<Doctor>;
            try {
                data = JSON.parse(dataString);
            } catch (parseError) {
                return next(ApiError.badRequest("Неверный формат данных"));
            }

            const doctorId = Number(id);
            const doctor = await this.doctorRepository.findById(doctorId);
            if (!doctor) {
                return next(ApiError.badRequest("Доктор не найден"));
            }

            if (!data.diplomas) data.diplomas = [];
            if (!data.licenses) data.licenses = [];

            const fileFields = ["diplomas", "licenses"] as const;
            const fileProcessingPromises: Promise<void>[] = [];

            for (const field of fileFields) {
                const files = req.files?.[field] as UploadedFile[] | UploadedFile | undefined;

                if (files) {
                    const fileArray = Array.isArray(files) ? files : [files];

                    for (const file of fileArray) {
                        const processFile = async () => {
                            try {
                                const fileName = await this.fileService.saveFile(file);
                                data[field]!.push(fileName);
                            } catch (error) {
                                console.error(`Ошибка обработки файла для поля ${field}:`, error);
                            }
                        };
                        fileProcessingPromises.push(processFile());
                    }
                }
            }

            await Promise.all(fileProcessingPromises);

            const allowedFields: (keyof Doctor)[] = [
                "experienceYears",
                "diplomas",
                "licenses"
            ];

            const changes = Object.entries(data)
                .filter(([field]) => allowedFields.includes(field as keyof Doctor))
                .map(([field, newValue]) => {
                    const key = field as keyof Doctor;
                    const oldValue = doctor[key];

                    let formattedOldValue = oldValue;
                    let formattedNewValue = newValue;

                    if (Array.isArray(oldValue) && Array.isArray(newValue)) {
                        formattedOldValue = oldValue.join(', ');
                        formattedNewValue = newValue.join(', ');
                    } else if (Array.isArray(oldValue)) {
                        formattedOldValue = oldValue.join(', ');
                        formattedNewValue = String(newValue);
                    } else if (Array.isArray(newValue)) {
                        formattedOldValue = String(oldValue);
                        formattedNewValue = newValue.join(', ');
                    }

                    return {
                        field_name: FIELD_TRANSLATIONS[field] || field,
                        old_value: formattedOldValue != null ? String(formattedOldValue) : null,
                        new_value: String(formattedNewValue),
                    };
                });

            if (changes.length === 0) {
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
                changesCount: changes.length
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
    specializations: 'Специализации',
    experienceYears: 'Опыт работы',
    diplomas: 'Дипломы',
    licenses: 'Лицензии',
};