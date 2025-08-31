import { NextFunction, Request, Response } from 'express'
import BatchRepository from "../../../../core/domain/repositories/batch.repository.js";
import ApiError from "../../error/ApiError.js";
import DoctorRepository from '../../../../core/domain/repositories/doctor.repository.js';
import UserRepository from '../../../../core/domain/repositories/user.repository.js';
import Doctor from '../../../../core/domain/entities/doctor.entity.js';
import User from '../../../../core/domain/entities/user.entity.js';
import UserShortInfoDto from '../../types/UserShortInfoDto.js';
import ConsultationRepository from '../../../../core/domain/repositories/consultation.repository.js';

export default class BatchController {
    constructor(
        private readonly batchRepository: BatchRepository,
        private readonly doctorRepository: DoctorRepository,
        private readonly userRepository: UserRepository,
        private readonly consultationRepository: ConsultationRepository
    ) { }

    async getOne(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const batch = await this.batchRepository.findById(Number(id));

            if (!batch) {
                return next(ApiError.badRequest('Изменение не найдено'));
            }

            return res.status(200).json(batch);
        } catch (e: any) {
            return next(ApiError.badRequest(e.message));
        }
    }

    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const limit = req.body.limit || 10;
            const page = req.body.page || 1;
            const batches = await this.batchRepository.findAll(Number(page), Number(limit));

            if (!batches || batches.batches.length === 0) {
                return next(ApiError.badRequest('Изменения не найдены'));
            }

            const formattedBatches = batches.batches.map(batch => ({
                id: batch.id,
                field_name: batch.field_name,
                old_value: batch.old_value,
                new_value: batch.new_value,
                userName: batch.userName,
                userSurname: batch.userSurname,
                userPatronymic: batch.userPatronymic
            }));

            return res.status(200).json({
                batches: formattedBatches,
                totalCount: batches.totalCount,
                totalPage: batches.totalPage
            });
        } catch (e: any) {
            next(ApiError.badRequest(e.message));
        }
    }

    async confirm(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;

            const batch = await this.batchRepository.findById(Number(id));
            if (!batch) {
                return next(ApiError.badRequest("Изменение не найдено"));
            }

            const user = await this.userRepository.findById(batch.userId || 0);
            if (!user) {
                return next(ApiError.badRequest("Пользователь не найден"));
            }

            const doctorFieldMap: Record<string, (doctor: Doctor, value: string) => void> = {
                "Специализации": (doctor, value) => {
                    doctor.specializations = value.split(",").map(s => s.trim());
                },
                "Опыт работы": (doctor, value) => (doctor.experienceYears = parseInt(value)),
                // "Диплом": (doctor, value) => (doctor.diploma = value),
                // "Лицензия": (doctor, value) => (doctor.license = value),
            };

            const userFieldMap: Record<string, (user: User, value: string) => void> = {
                "Изображение": (u, v) => (u.img = v),
                "Имя": (u, v) => (u.name = v),
                "Фамилия": (u, v) => (u.surname = v),
                "Отчество": (u, v) => (u.patronymic = v),
                "Пол": (u, v) => {
                    u.gender = v;
                    if (u.img === "man.png" && v === "Женщина") u.img = "girl.png";
                    else if (u.img === "girl.png" && v !== "Женщина") u.img = "man.png";
                },
                "Дата рождения": (u, v) => (u.dateBirth = new Date(v)),
            };

            if (batch.field_name in doctorFieldMap) {
                const doctor = await this.doctorRepository.findByUserId(user.id);
                if (!doctor) {
                    return next(ApiError.badRequest("Доктор не найден"));
                }

                doctorFieldMap[batch.field_name](doctor, batch.new_value);
                await this.doctorRepository.update(doctor);
            } else if (batch.field_name in userFieldMap) {
                userFieldMap[batch.field_name](user, batch.new_value);
                await this.userRepository.update(user);
            } else {
                return next(ApiError.badRequest("Недопустимое поле для изменения"));
            }

            await this.batchRepository.delete(batch.id);

            const batches = await this.batchRepository.findAllByUserId(user.id);
            if (batches.length === 0) {
                await this.userRepository.save(user.setSentChanges(false));
            }


            return res.status(200).json({
                success: true,
                message: "Изменение успешно подтверждено и применено",
            });
        } catch (e: any) {
            return next(ApiError.badRequest("Неизвестная ошибка"));
        }
    }

    async reject(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { rejection_reason } = req.body;

            const batch = await this.batchRepository.findById(Number(id));

            if (!batch) {
                return next(ApiError.badRequest('Изменение не найдено'));
            }

            // создание уведомлений
            console.log(rejection_reason);

            await this.batchRepository.delete(batch.id);
            return res.status(200).json({
                success: true,
                message: 'Изменение успешно отменено и сообщение отправлено'
            });
        } catch (e: any) {
            return next(ApiError.badRequest(e.message));
        }
    }

    async getAllUser(req: Request, res: Response, next: NextFunction) {
        try {
            const users = await this.userRepository.getAll();

            if (!users || users.length === 0) {
                return res.status(404).json({ message: 'Пользователи не найдены' });
            }

            const doctorUserIds = users
                .filter(user => user.role === 'DOCTOR')
                .map(user => user.id);

            const doctors = await this.doctorRepository.findByUserIds(doctorUserIds);

            const doctorMap = new Map<number, Doctor>();
            doctors.forEach(doctor => {
                if (doctor.userId) {
                    doctorMap.set(doctor.userId, doctor);
                }
            });

            const response = users.map(user => {
                const userData: UserShortInfoDto = {
                    id: user.id,
                    role: user.role,
                    name: user.name,
                    surname: user.surname,
                    patronymic: user.patronymic,
                    img: user.img,
                    phone: user.phone,
                    gender: user.gender,
                    email: user.email,
                    specializations: null,
                    diploma: null,
                    license: null,
                    isBlocked: user.isBlocked
                };

                if (user.role === 'DOCTOR') {
                    const doctorInfo = doctorMap.get(user.id);
                    if (doctorInfo) {
                        userData.specializations = doctorInfo.specializations || null;
                        // userData.diploma = doctorInfo.diploma || null;
                        // userData.license = doctorInfo.license || null;
                    }
                }

                return userData;
            });

            return res.status(200).json(response);
        } catch (e: any) {
            next(ApiError.badRequest(e.message));
        }
    }

    async getUserConsultation(req: Request, res: Response, next: NextFunction) {
        try {
            const { page, limit } = req.body;

            const result = await this.userRepository.findAll(page, limit, { role: "PATIENT" });

            if (!result || !result.users || result.users.length === 0) {
                return next(ApiError.badRequest('Пользователи не найдены'));
            }

            return res.status(200).json({
                users: result.users.map(user => ({
                    id: user.id,
                    name: user.name,
                    surname: user.surname,
                    patronymic: user.patronymic,
                    phone: user.phone
                })),
                totalCount: result.totalCount,
                totalPages: result.totalPages
            });
        } catch (e: any) {
            return next(ApiError.internal(e.message));
        }
    }

    async getConsultaions(req: Request, res: Response, next: NextFunction) {
        try {
            const { page, limit } = req.body;
            const result = await this.consultationRepository.findAll(page, limit);
            if (!result) {
                return next(ApiError.badRequest('Консультации не найдены'));
            }

            return res.status(200).json(result);
        } catch (e: any) {
            return next(ApiError.internal(e.message));
        }
    }

    
}