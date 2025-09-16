import { Request, Response, NextFunction } from "express";
import DoctorRepository from "../../../../core/domain/repositories/doctor.repository.js";
import ProfDataRespository from "../../../../core/domain/repositories/profData.repository.js"
import ApiError from "../../error/ApiError.js";
import FileService from "../../../../core/domain/services/file.service.js";
import UserRepository from "../../../../core/domain/repositories/user.repository.js";
import SpecializationRepository from "../../../../core/domain/repositories/specializations.repository.js"
import ProfData from "../../../../core/domain/entities/profData.entity.js";
import TimeSlotRepository from "../../../../core/domain/repositories/timeSlot.repository.js"
import NotificationRepository from "../../../../core/domain/repositories/notifaction.repository.js"
import normalizeDate from "../../function/normDate.js";
import Notification from "../../../../core/domain/entities/notification.entity.js";

export default class DoctorController {
    constructor(
        private readonly doctorRepository: DoctorRepository,
        private readonly profDataRepository: ProfDataRespository,
        private readonly fileService: FileService,
        private readonly userRepository: UserRepository,
        private readonly specializationRepository: SpecializationRepository,
        private readonly timeSlotRepository: TimeSlotRepository,
        private readonly notificationReposiotory: NotificationRepository
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
            const { type, specializationId, comment } = req.body;

            if (!specializationId) {
                return res.status(204).send()
            }

            const user = await this.userRepository.findById(Number(id));
            if (!user) {
                return next(ApiError.badRequest("Пользователь для данного доктора не найден"));
            }

            const doctor = await this.doctorRepository.findByUserId(user.id);
            if (!doctor) {
                return next(ApiError.badRequest("Специалист не найден"));
            }

            let diplomaFileName = "";
            let licenseFileName = "";

            if (req.files?.diploma) {
                const diplomaFile = Array.isArray(req.files.diploma)
                    ? req.files.diploma[0]
                    : req.files.diploma;
                try {
                    diplomaFileName = await this.fileService.saveFile(diplomaFile);
                } catch (error) {
                    return next(ApiError.internal('Ошибка загрузки диплома'));
                }
            }

            if (req.files?.license) {
                const licenseFile = Array.isArray(req.files.license)
                    ? req.files.license[0]
                    : req.files.license;
                try {
                    licenseFileName = await this.fileService.saveFile(licenseFile);
                } catch (error) {
                    return next(ApiError.internal('Ошибка загрузки лицензии'));
                }
            }

            const specialization = await this.specializationRepository.findById(specializationId);
            if (!specialization) {
                return next(ApiError.badRequest('Специализация не найдена'));
            }

            await this.profDataRepository.save(new ProfData(
                0,
                diplomaFileName,
                licenseFileName,
                specialization.name,
                comment,
                type,
                user.id
            ));

            await this.userRepository.save(user.setSentChanges(true));

            await this.notificationReposiotory.save(
                new Notification(
                    0,
                    "Обновление данных",
                    "Ваши профессиональные данные были отправлены на модерацию. Ответ займёт от одного часа до трёх дней.",
                    "INFO",
                    false,
                    null,
                    null,
                    user.id
                )
            );

            return res.json({
                success: true,
                message: "Изменения отправлены на модерацию"
            });
        } catch (e: any) {
            console.error('Error in updateDoctor:', e);
            return next(ApiError.internal(e.message));
        }
    }

    async TakeBreak(req: Request, res: Response, next: NextFunction) {
        try {
            const { startDate, endDate } = req.body;
            const { userId } = req.params;

            const start = new Date(startDate);
            const end = new Date(endDate);
            const now = new Date();

            if (start < now) {
                return next(ApiError.badRequest('Дата начала перерыва не может быть в прошлом'));
            }

            if (start > end) {
                return next(ApiError.badRequest('Дата начала перерыва не может быть в будущем'));
            }

            const diffInMs = end.getTime() - start.getTime();
            const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

            if (diffInDays > 61) {
                return next(ApiError.badRequest('Перерыв не может длиться более двух месяцев'));
            }

            const doctor = await this.doctorRepository.findByUserId(Number(userId));
            if (!doctor) {
                return next(ApiError.badRequest('Пользователь не найден'));
            }

            await this.timeSlotRepository.takeBreak(normalizeDate(startDate), normalizeDate(endDate), doctor.id);
            await this.notificationReposiotory.save(
                new Notification(
                    0,
                    "Перерыв",
                    `Вы успешно взяли перерыв с ${startDate} по ${endDate}.`,
                    "INFO",
                    false,
                    null,
                    null,
                    Number(userId)
                )
            );
            res.status(200).json({
                success: true,
                message: `Вы успешно взяли перерыв с ${normalizeDate(startDate)} по ${normalizeDate(endDate)}`
            });
        } catch (e: any) {
            return next(ApiError.internal(e.message));
        }
    }
}