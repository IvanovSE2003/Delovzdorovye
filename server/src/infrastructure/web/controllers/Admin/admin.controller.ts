import { NextFunction, Request, Response } from 'express'
import ApiError from "../../error/ApiError.js";
import DoctorRepository from '../../../../core/domain/repositories/doctor.repository.js';
import UserRepository from '../../../../core/domain/repositories/user.repository.js';
import Doctor from '../../../../core/domain/entities/doctor.entity.js';
import User from '../../../../core/domain/entities/user.entity.js';
import UserShortInfoDto from '../../types/UserShortInfoDto.js';
import ConsultationRepository from '../../../../core/domain/repositories/consultation.repository.js';
import BasicDataRepository from '../../../../core/domain/repositories/basicData.repository.js';
import ProfDataRepository from '../../../../core/domain/repositories/profData.repository.js';
import NotificationRepository from '../../../../core/domain/repositories/notifaction.repository.js';
import Notification from '../../../../core/domain/entities/notification.entity.js';

export default class BatchController {
    constructor(
        private readonly basicDataReposiotry: BasicDataRepository,
        private readonly profDataRepository: ProfDataRepository,
        private readonly doctorRepository: DoctorRepository,
        private readonly userRepository: UserRepository,
        private readonly consultationRepository: ConsultationRepository,
        private readonly notificationRepository: NotificationRepository
    ) { }

    async getOne(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const batch = await this.basicDataReposiotry.findById(Number(id));

            if (!batch) {
                return next(ApiError.badRequest('Изменение не найдено'));
            }

            return res.status(200).json(batch);
        } catch (e: any) {
            return next(ApiError.badRequest(e.message));
        }
    }

    async getAllBasicData(req: Request, res: Response, next: NextFunction) {
        try {
            const limit = req.query.limit || 10;
            const page = req.query.page || 1;
            const basicData = await this.basicDataReposiotry.findAll(Number(page), Number(limit));

            if (!basicData || basicData.batches.length === 0) {
                return next(ApiError.badRequest('Изменения не найдены'));
            }

            const formattedBatches = basicData.batches.map(data => ({
                id: data.id,
                field_name: data.field_name,
                old_value: data.old_value,
                new_value: data.new_value,
                userId: data.userId,
                userName: data.userName,
                userSurname: data.userSurname,
                userPatronymic: data.userPatronymic
            }));

            return res.status(200).json({
                basicDatas: formattedBatches,
                totalCount: basicData.totalCount,
                totalPage: basicData.totalPage
            });
        } catch (e: any) {
            next(ApiError.badRequest(e.message));
        }
    }

    async getAllProfData(req: Request, res: Response, next: NextFunction) {
        try {
            const limit = req.query.limit || 10;
            const page = req.query.page || 1;
            const filters = req.query.filters || {}

            const profDatas = await this.profDataRepository.findAll(Number(page), Number(limit), filters);

            if (!profDatas) {
                return next(ApiError.badRequest('Данные для обновления профессиональных данных не найдены'));
            }

            const formattedProfData = profDatas.profData.map(data => ({
                id: data.id,
                new_diploma: data.new_diploma,
                new_license: data.new_license,
                new_experience_years: data.new_experience_years,
                new_specialization: data.new_specialization,
                comment: data.comment,
                type: data.type,
                userId: data.userId,
                userName: data.userName,
                userSurname: data.userSurname,
                userPatronymic: data.userPatronymic
            }));

            res.status(200).json({
                profDatas: formattedProfData,
                totalCount: profDatas.totalCount,
                totalPage: profDatas.totalPage
            })
        } catch (e: any) {
            return next(ApiError.internal(e.message));
        }
    }

    async confirmBasicData(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;

            const basicData = await this.basicDataReposiotry.findById(Number(id));
            if (!basicData) {
                return next(ApiError.badRequest("Изменение не найдено"));
            }

            const user = await this.userRepository.findById(basicData.userId || 0);
            if (!user) {
                return next(ApiError.badRequest("Пользователь не найден"));
            }

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

            if (basicData.field_name in userFieldMap) {
                userFieldMap[basicData.field_name](user, basicData.new_value);
                await this.userRepository.update(user);
            } else {
                return next(ApiError.badRequest("Недопустимое поле для изменения"));
            }

            await this.basicDataReposiotry.delete(basicData.id);

            const basicDatas = await this.basicDataReposiotry.findAllByUserId(user.id);
            if (basicDatas.length === 0) {
                await this.userRepository.save(user.setSentChanges(false));
            }

            await this.notificationRepository.save(new Notification(0, "Изменения приняты", "Ваши изменения были приняты администатором", "INFO", false, basicData, "BASICDATA"));

            return res.status(200).json({
                success: true,
                message: "Изменение успешно подтверждено и применено",
            });
        } catch (e: any) {
            return next(ApiError.badRequest("Неизвестная ошибка"));
        }
    }

    async rejectBasicData(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { rejection_reason } = req.body;

            const basicData = await this.basicDataReposiotry.findById(Number(id));

            if (!basicData) {
                return next(ApiError.badRequest('Изменение не найдено'));
            }

            await this.notificationRepository.save(new Notification(0, "Изменения не приняты", `Ваши изменения не приняты администратором. ${rejection_reason}`, "INFO", false, basicData, "BASICDATA", basicData.userId));

            await this.basicDataReposiotry.delete(basicData.id);
            return res.status(200).json({
                success: true,
                message: 'Изменение успешно отменено и сообщение отправлено'
            });
        } catch (e: any) {
            return next(ApiError.badRequest(e.message));
        }
    }

    async confirmProfData(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const profData = await this.profDataRepository.findById(Number(id));

            if (!profData) {
                return next(ApiError.badRequest('Данные изменения профессиональных компентенций не найдены'));
            }

            const doctor = await this.doctorRepository.findByUserId(profData.userId || 0);

            if (!doctor) {
                return next(ApiError.badRequest('Специалист не найден'));
            }

            const newDoctor = await this.doctorRepository.save(doctor.setYear(profData.new_experience_years));
            await this.doctorRepository.saveLisinseDiploma(newDoctor, profData.new_license, profData.new_diploma, profData.new_specialization);

            await this.profDataRepository.delete(profData.id);

            await this.notificationRepository.save(new Notification(0, "Изменения приняты", "Ваши изменения были приняты администатором", "INFO", false, profData, "PROFDATA"));
            return res.status(200).json({
                success: true,
                message: "Изменения успешно подтверждены и применены для профессиональных данных",
            });
        } catch (e: any) {
            return next(ApiError.internal(e.message));
        }
    }

    async rejectProfData(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { rejection_reason } = req.body;

            const profData = await this.profDataRepository.findById(Number(id));
            if (!profData) {
                return next(ApiError.badRequest('Данные изменения профессиональных компентенций не найдены'));
            }

            await this.notificationRepository.save(new Notification(0, "Изменения не приняты", `Ваши изменения не приняты администратором. ${rejection_reason}`, "INFO", false, profData, "BASICDATA", profData.userId || 0));

            await this.profDataRepository.delete(profData.id);
            return res.status(200).json({
                success: true,
                message: 'Изменение успешно отменено и сообщение отправлено'
            });
        } catch (e: any) {
            return next(ApiError.internal(e.message));
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

            const doctors = await this.doctorRepository.getDoctorsWithSpecializations(doctorUserIds);
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
                    profData: [],
                    isBlocked: user.isBlocked
                };

                if (user.role === 'DOCTOR') {
                    const doctorInfo = doctorMap.get(user.id);
                    if (doctorInfo && doctorInfo.profData && doctorInfo.profData.length > 0) {
                        userData.profData = doctorInfo.profData.map(spec => ({
                            specialization: spec.specialization || null,
                            diploma: spec.diploma || null,
                            license: spec.license || null
                        }));
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
            const { page, limit } = req.query;

            const pageUser = page ? page : 1;
            const limitUser = limit ? limit : 1;

            const result = await this.userRepository.findAll(Number(pageUser), Number(limitUser), { role: "PATIENT" });

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
            const { page, limit } = req.query;

            const pageUser = page ? page : 1;
            const limitUser = limit ? limit : 1;

            const result = await this.consultationRepository.findAll(Number(pageUser), Number(limitUser));
            if (!result) {
                return next(ApiError.badRequest('Консультации не найдены'));
            }

            return res.status(200).json(result);
        } catch (e: any) {
            return next(ApiError.internal(e.message));
        }
    }
}