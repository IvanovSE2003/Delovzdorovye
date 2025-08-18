import { NextFunction, Request, Response } from 'express'
import BatchRepository from "../../../../core/domain/repositories/batch.repository.js";
import ApiError from "../../error/ApiError.js";
import DoctorRepository from '../../../../core/domain/repositories/doctor.repository.js';
import UserRepository from '../../../../core/domain/repositories/user.repository.js';
import Doctor from '../../../../core/domain/entities/doctor.entity.js';
import User from '../../../../core/domain/entities/user.entity.js';
import UserShortInfoDto from '../../types/UserShortInfoDto.js';

export default class BatchController {
    constructor(
        private readonly batchRepository: BatchRepository,
        private readonly doctorRepository: DoctorRepository,
        private readonly userRepository: UserRepository
    ) {}

    async getOne(req: Request, res: Response, next: NextFunction) {
        try {
            const {id} = req.params;
            const batch = await this.batchRepository.findById(Number(id));

            if(!batch) {
                return next(ApiError.badRequest('Изменение не найдено'));
            }

            return res.status(200).json(batch);
        } catch(e: any) {
            return next(ApiError.badRequest(e.message));
        }
    }

    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const limit = req.body.limit || 10;
            const page = req.body.page || 1;
            const batches = await this.batchRepository.findAll(Number(page), Number(limit));
            
            if(!batches || batches.batches.length === 0) {
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
        } catch(e: any) {
            next(ApiError.badRequest(e.message));
        }
    }

    async confirm(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;

            const batch = await this.batchRepository.findById(Number(id));
            
            if (!batch) {
                return next(ApiError.badRequest('Изменение не найдено'));
            }

            const user = await this.userRepository.findById(batch.userId || 0);
            if (!user) {
                return next(ApiError.badRequest('Пользователь не найден'));
            }

            const doctorFields = ['Специализация', 'Опыт работы', 'Диплом', 'Лицензия'];
            const isDoctorField = doctorFields.includes(batch.field_name);

            if (isDoctorField) {
                const doctor = await this.doctorRepository.findByUserId(user.id);
                if (!doctor) {
                    return next(ApiError.badRequest('Доктор не найден'));
                }

                const updates: Partial<Doctor> = {};
                switch (batch.field_name) {
                    case 'Специализация':
                        updates.specialization = batch.new_value;
                        break;
                    case 'Опыт работы':
                        updates.experienceYears = parseInt(batch.new_value);
                        break;
                    case 'Диплом':
                        updates.diploma = batch.new_value;
                        break;
                    case 'Лицензия':
                        updates.license = batch.new_value;
                        break;
                }

                Object.assign(doctor, updates);
                await this.doctorRepository.update(doctor);
            } else {
                const updates: Partial<User> = {};
                switch (batch.field_name) {
                    case 'Имя':
                        updates.name = batch.new_value;
                        break;
                    case 'Фамилия':
                        updates.surname = batch.new_value;
                        break;
                    case 'Отчество':
                        updates.patronymic = batch.new_value;
                        break;
                    case 'Пол':
                        updates.gender = batch.new_value;
                        console.log(user.img);
                        if(updates.gender === 'Женщина') {
                            user.img === 'man.png' ? updates.img = 'girl.png' : updates.img = user.img
                        } else {
                            user.img === 'girl.png' ? updates.img = 'man.png' : updates.img = user.img
                        }
                        console.log(user.img);
                        break;
                    case 'Дата рождения':
                        updates.dateBirth = new Date(batch.new_value);
                        break;
                }

                Object.assign(user, updates);
                await this.userRepository.update(user);
            }

            await this.batchRepository.delete(batch.id);


            return res.status(200).json({ 
                success: true, 
                message: 'Изменение успешно подтверждено и применено' 
            });
        } catch(e: any) {
            return next(ApiError.badRequest(e.message));
        }
    }

    async reject(req: Request, res: Response, next: NextFunction) {
        try {
            const {id} = req.params;
            const {rejection_reason} = req.body;

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
        } catch(e: any) {
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
                    specialization: null,
                    diploma: null,
                    license: null,
                    isBlocked: user.isBlocked
                };

                if (user.role === 'DOCTOR') {
                    const doctorInfo = doctorMap.get(user.id);
                    if (doctorInfo) {
                        userData.specialization = doctorInfo.specialization || null;
                        userData.diploma = doctorInfo.diploma || null;
                        userData.license = doctorInfo.license || null;
                    }
                }

                return userData;
            });

            return res.status(200).json(response);
        } catch (e: any) {
            next(ApiError.badRequest(e.message)); 
        }
    }
}