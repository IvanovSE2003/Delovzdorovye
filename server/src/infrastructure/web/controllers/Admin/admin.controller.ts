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

export default class AdminController {
    constructor(
        private readonly basicDataRepository: BasicDataRepository,
        private readonly profDataRepository: ProfDataRepository,
        private readonly doctorRepository: DoctorRepository,
        private readonly userRepository: UserRepository,
        private readonly consultationRepository: ConsultationRepository,
        private readonly notificationRepository: NotificationRepository
    ) { }

    async getOneBasicData(req: Request, res: Response, next: NextFunction) {
        const { id } = req.params;
        const basicData = await this.basicDataRepository.findById(Number(id));

        if (!basicData) {
            return next(ApiError.badRequest('Основное изменение не найдено'));
        }

        return res.status(200).json(basicData);
    }

    async getAllBasicData(req: Request, res: Response, next: NextFunction) {
        const limit = req.query.limit || 10;
        const page = req.query.page || 1;
        const basicData = await this.basicDataRepository.findAll(Number(page), Number(limit));

        if (!basicData || basicData.batches.length === 0) {
            return next(ApiError.badRequest('Изменения не найдены'));
        }

        const formattedBasicDatas = basicData.batches.map(data => ({
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
            basicDatas: formattedBasicDatas,
            totalCount: basicData.totalCount,
            totalPage: basicData.totalPage
        });
    }

    async getAllProfData(req: Request, res: Response, next: NextFunction) {
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
    }

    async confirmProfData(req: Request, res: Response, next: NextFunction) {
        const { id } = req.params;
        const profData = await this.profDataRepository.findById(Number(id));

        if (!profData) {
            return next(ApiError.badRequest('Данные изменения профессиональных компентенций не найдены'));
        }

        const user = await this.userRepository.findById(profData.userId || 0);
        if (!user) return next(ApiError.badRequest('Пользователь не найден'));

        const doctor = await this.doctorRepository.findByUserId(user.id);
        if (!doctor) return next(ApiError.badRequest('Специалист не найден'));

        await this.doctorRepository.saveLisinseDiploma(doctor, profData.new_license, profData.new_diploma, profData.new_specialization);
        await this.profDataRepository.delete(profData.id);
        await this.notificationRepository.save(
            new Notification(
                0,
                "Изменения приняты",
                "Ваши изменения были приняты администатором",
                "INFO",
                false,
                profData,
                "PROFDATA",
                user.id
            )
        );

        await this.userRepository.save(user.setSentChanges(false));

        return res.status(200).json({
            success: true,
            message: "Изменения профессиональных данных успешно подтверждены и применены для специалиста.",
        });
    }

    async rejectProfData(req: Request, res: Response, next: NextFunction) {
        const { id } = req.params;
        const { rejection_reason } = req.body;

        const profData = await this.profDataRepository.findById(Number(id));
        if (!profData) return next(ApiError.badRequest('Данные изменения профессиональных компентенций не найдены'));

        const user = await this.userRepository.findById(profData.userId!)
        if (!user) return next(ApiError.badRequest('Пользователь не найден'));

        await this.notificationRepository.save(
            new Notification(
                0,
                "Отмена обновлений",
                `Ваши изменения были отклонены администратором по причине "${rejection_reason}".`,
                "ERROR",
                false,
                null,
                null,
                user.id
            )
        )

        await this.profDataRepository.delete(profData.id);
        await this.userRepository.save(user.setSentChanges(false));

        return res.status(200).json({
            success: true,
            message: 'Изменение успешно отменено'
        });
    }

    async confirmBasicData(req: Request, res: Response, next: NextFunction) {
        const { id } = req.params;

        const basicData = await this.basicDataRepository.findById(Number(id));
        if (!basicData) return next(ApiError.badRequest("Изменение не найдено"));

        const user = await this.userRepository.findById(basicData.userId || 0);
        if (!user) return next(ApiError.badRequest("Пользователь не найден"));

        const pendingFieldMap: Record<string, (user: User) => Promise<void>> = {
            "Изображение": async (u) => {
                if (u.pending_img) {
                    u.img = u.pending_img;
                    await this.userRepository.save(u);
                }
            },
            "Имя": async (u) => {
                if (u.pending_name) {
                    u.name = u.pending_name;
                    await this.userRepository.save(u);
                }
            },
            "Фамилия": async (u) => {
                if (u.pending_surname) {
                    u.surname = u.pending_surname;
                    await this.userRepository.save(u);
                }
            },
            "Отчество": async (u) => {
                if (u.pending_patronymic) {
                    u.patronymic = u.pending_patronymic;
                    await this.userRepository.save(u);
                }
            },
            "Пол": async (u) => {
                if (u.pending_gender) {
                    const oldGender = u.gender;
                    u.gender = u.pending_gender;

                    if (oldGender !== u.pending_gender) {
                        if (u.img === "man.png" && u.pending_gender === "Женщина") {
                            u.img = "girl.png";
                        } else if (u.img === "girl.png" && u.pending_gender !== "Женщина") {
                            u.img = "man.png";
                        }
                    }

                    await this.userRepository.save(u);
                }
            },
            "Дата рождения": async (u) => {
                if (u.pending_date_birth) {
                    u.dateBirth = u.pending_date_birth;
                    await this.userRepository.save(u);
                }
            },
        };

        if (basicData.field_name in pendingFieldMap) {
            await pendingFieldMap[basicData.field_name](user);
        } else {
            return next(ApiError.badRequest("Недопустимое поле для изменения"));
        }

        await this.basicDataRepository.delete(basicData.id);

        const remainingChanges = await this.basicDataRepository.findAllByUserId(user.id);
        if (remainingChanges.length === 0) {
            user.setSentChanges(false);
            await this.userRepository.save(user);
        }

        await this.notificationRepository.save(
            new Notification(
                0,
                "Изменения приняты",
                "Ваши изменения были приняты администратором.",
                "INFO",
                false,
                basicData,
                "BASICDATA",
                user.id
            )
        );

        return res.status(200).json({
            success: true,
            message: "Изменение успешно подтверждено и применено.",
        });
    }

    async rejectBasicData(req: Request, res: Response, next: NextFunction) {
        const { id } = req.params;
        const { rejection_reason } = req.body;

        const basicData = await this.basicDataRepository.findById(Number(id));
        if (!basicData) return next(ApiError.badRequest('Изменение не найдено'));

        const user = await this.userRepository.findById(basicData.userId || 0);
        if (!user) return next(ApiError.badRequest('Пользователь не найден'));

        await this.notificationRepository.save(
            new Notification(
                0,
                "Изменения не приняты",
                `Ваши изменения были отклонены администратором по причине "${rejection_reason}".`,
                "INFO",
                false,
                basicData,
                "BASICDATA",
                user.id
            )
        );

        await this.basicDataRepository.delete(basicData.id);

        if (user.role === "DOCTOR") {
            user.pending_img = user.img;
            user.pending_name = user.name;
            user.pending_surname = user.surname;
            user.pending_patronymic = user.patronymic;
            user.pending_gender = user.gender;
            user.pending_date_birth = user.dateBirth;
        }

        user.sentChanges = false;
        user.hasPendingChanges = false;

        await this.userRepository.save(user);

        return res.status(200).json({
            success: true,
            message: 'Изменение успешно отменено и сообщение отправлено'
        });
    }

    async getAllUser(req: Request, res: Response, next: NextFunction) {
        const users = await this.userRepository.findAll();

        if (!users || users.users.length === 0) return next(ApiError.badRequest('Пользователи не найдены'));

        const doctorUserIds = users.users
            .filter(user => user.role === 'DOCTOR')
            .map(user => user.id);

        const doctors = await this.doctorRepository.getDoctorsWithSpecializations(doctorUserIds);
        const doctorMap = new Map<number, Doctor>();
        doctors.forEach(doctor => {
            if (doctor.userId) {
                doctorMap.set(doctor.userId, doctor);
            }
        });

        const response = users.users.map(user => {
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
    }

    async getUserConsultation(req: Request, res: Response, next: NextFunction) {
        const { page, limit } = req.query;

        const pageUser = page ? Number(page) : 1;
        const limitUser = limit ? Number(limit) : 1;

        const result = await this.userRepository.findAll(pageUser, limitUser, { role: "PATIENT" });
        if (!result || !result.users || result.users.length === 0) return next(ApiError.badRequest('Пользователи не найдены'));

        const usersWithFlag = await this.userRepository.findOtherProblem(result.users);

        const usersWithDetails = await Promise.all(
            result.users.map(async user => {
                const hasOtherProblem = usersWithFlag.some(problemUser => problemUser.id === user.id);
                const countOtherProblem = await this.consultationRepository.getCountOtherProblemByUser(user.id);
                return {
                    id: user.id,
                    name: user.name,
                    surname: user.surname,
                    patronymic: user.patronymic,
                    phone: user.phone,
                    hasOtherProblem: hasOtherProblem,
                    countOtherProblem: countOtherProblem
                };
            })
        );

        return res.status(200).json({
            users: usersWithDetails,
            totalCount: result.totalCount,
            totalPages: result.totalPages
        });
    }

    async getConsultaions(req: Request, res: Response, next: NextFunction) {
        const { page, limit } = req.query;

        const pageUser = page ? page : 1;
        const limitUser = limit ? limit : 1;

        const result = await this.consultationRepository.findAll(Number(pageUser), Number(limitUser));
        if (!result) return res.status(200).json([]);

        return res.status(200).json(result);
    }

    async countAdminData(req: Request, res: Response, next: NextFunction) {
        const [basicDataCount, profDataCount, consultCount, otherPorblemCount] = await Promise.all([
            this.basicDataRepository.getCount(),
            this.profDataRepository.getCount(),
            this.consultationRepository.getCount(),
            this.consultationRepository.getCountOtherProblem()
        ]);
        const totalChanges = basicDataCount + profDataCount;

        return res.status(200).json({
            countChange: totalChanges,
            countConsult: consultCount,
            countOtherProblem: otherPorblemCount
        });
    }
}