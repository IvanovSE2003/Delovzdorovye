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

    async getOne(req: Request, res: Response, next: NextFunction) {
        try {
            const {id} = req.params;
            const doctor = await this.doctorRepository.findByUserId(Number(id));
            if(!doctor) {
                return next(ApiError.badRequest('Пользователь не найден'));
            }
            res.status(200).json(doctor);
        } catch(e: any) {
            return next(ApiError.badRequest(e.message));
        }
    }

    async updateDoctor(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            let { data } = req.body;

            if (typeof data === 'string') {
                try {
                    data = JSON.parse(data);
                } catch {
                    return next(ApiError.badRequest('Некорректный формат данных'));
                }
            }

            const doctor = await this.doctorRepository.findById(Number(id));
            if (!doctor) {
                return next(ApiError.badRequest('Доктор не найден'));
            }

            if (req.files?.diploma) {
                const diplomaFile = req.files.diploma as UploadedFile;
                const diplomaFileName = await this.fileService.saveFile(diplomaFile);
                data.diploma = diplomaFileName;
            }
            if (req.files?.license) {
                const licenseFile = req.files.license as UploadedFile;
                const licenseFileName = await this.fileService.saveFile(licenseFile);
                data.license = licenseFileName;
            }

            const allowedFields: (keyof Doctor)[] = [
                'specializations', 
                'experienceYears',
                'diploma',
                'license',
            ];

            const changes = Object.entries(data)
                .filter(([field_name]) => allowedFields.includes(field_name as keyof Doctor))
                .map(([field_name, new_value]) => {
                    const field = field_name as keyof Doctor;
                    const oldValue = doctor[field];
                    const translatedFieldName = FIELD_TRANSLATIONS[field_name] || field_name;
                    
                    return {
                        field_name: translatedFieldName,
                        old_value: oldValue !== undefined && oldValue !== null ? String(oldValue) : null,
                        new_value: String(new_value)
                    };
                });

            if (changes.length === 0) {
                return next(ApiError.badRequest('Нет допустимых полей для изменения'));
            }

            const user = await this.userRepository.findByDoctorId(doctor.id);
            if(!user) {
                return next(ApiError.badRequest('Пользователь для данного доктора не найден'))
            }
            await this.batchRepository.createBatchWithChangesUser(Number(user.id), changes);

            return res.json({ success: true, message: 'Изменения отправлены на модерацию' });
        } catch (e: any) {
            next(ApiError.internal(e.message));
        }
    }
}

const FIELD_TRANSLATIONS: Record<string, string> = {
    specialization: 'Специализация',
    experienceYears: 'Опыт работы',
    diploma: 'Диплом',
    license: 'Лицензия',
};