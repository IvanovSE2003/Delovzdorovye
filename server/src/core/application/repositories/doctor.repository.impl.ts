import models from '../../../infrastructure/persostence/models/models.js';
import DoctorRepository from '../../domain/repositories/doctor.repository.js';
import { DoctorModelInterface, IDoctorCreationAttributes } from '../../../infrastructure/persostence/models/interfaces/doctor.model.js';
import Doctor from '../../domain/entities/doctor.entity.js';
import { Op } from 'sequelize';
import sequelize from '../../../infrastructure/persostence/db/db.js';
import TimeSlot from '../../domain/entities/timeSlot.entity.js';

const { UserModel, DoctorModel, SpecializationModel, DoctorSpecialization } = models;

export default class DoctorRepositoryImpl implements DoctorRepository {

    async findById(id: number): Promise<Doctor | null> {
        const doctor = await DoctorModel.findByPk(id, {
            include: [
                {
                    model: SpecializationModel,
                    through: { attributes: ['diploma', 'license'] }, // Теперь включаем атрибуты связующей таблицы
                    attributes: ['name']
                }
            ]
        });

        return doctor ? this.mapToDomainDoctor(doctor) : null;
    }

    async findByUserId(userId: number) {
        const doctor = await DoctorModel.findOne({
            where: { userId },
            include: [
                {
                    model: SpecializationModel,
                    through: { attributes: ['diploma', 'license'] },
                    attributes: ['name']
                }
            ]
        });

        return doctor ? this.mapToDomainDoctor(doctor) : null;
    }

    async findAll(
        page: number = 1,
        limit: number = 10,
        filters?: {
            specialization?: string;
            isActive?: boolean;
            gender?: string;
            experienceMin?: number;
            experienceMax?: number;
        }
    ): Promise<{
        doctors: Doctor[];
        totalCount: number;
        totalPages: number;
    }> {
        const where: any = {};
        const userWhere: any = {};

        if (filters?.specialization) {
            where['$specializations.name$'] = filters.specialization;
        }

        if (filters?.isActive !== undefined) {
            where.activate = filters.isActive;
        }

        if (filters?.experienceMin !== undefined || filters?.experienceMax !== undefined) {
            where.experience_years = {};
            if (filters?.experienceMin !== undefined) {
                where.experience_years[Op.gte] = filters.experienceMin;
            }
            if (filters?.experienceMax !== undefined) {
                where.experience_years[Op.lte] = filters.experienceMax;
            }
        }

        if (filters?.gender) {
            userWhere.gender = filters.gender;
        }

        const totalCount = await DoctorModel.count({
            where,
            include: [
                {
                    model: UserModel,
                    where: userWhere,
                    required: true
                },
                {
                    model: SpecializationModel,
                    where: filters?.specialization ? { name: filters.specialization } : {},
                    required: !!filters?.specialization
                }
            ]
        });

        const totalPages = Math.ceil(totalCount / limit);

        const doctors = await DoctorModel.findAll({
            where,
            include: [
                {
                    model: UserModel,
                    where: userWhere,
                    required: true,
                    attributes: ['id', 'name', 'surname', 'patronymic', 'img', 'gender']
                },
                {
                    model: SpecializationModel,
                    through: { attributes: ['diploma', 'license'] }, // Включаем атрибуты связующей таблицы
                    attributes: ['name'],
                    where: filters?.specialization ? { name: filters.specialization } : {}
                }
            ],
            limit,
            offset: (page - 1) * limit,
            order: [['experience_years', 'DESC'], ['id', 'ASC']]
        });

        return {
            doctors: doctors.map(doctor => this.mapToDomainDoctor(doctor)),
            totalCount,
            totalPages
        };
    }

    async findByUserIds(userIds: number[]): Promise<Doctor[]> {
        const doctors = await DoctorModel.findAll({
            where: {
                userId: {
                    [Op.in]: userIds
                }
            },
            include: [
                {
                    model: SpecializationModel,
                    through: { attributes: ['diploma', 'license'] },
                    attributes: ['name']
                }
            ]
        });

        return doctors.map(doctor => this.mapToDomainDoctor(doctor));
    }

    async update(doctor: Doctor): Promise<Doctor> {
        if (!doctor.id) {
            throw new Error("ID доктора не найдено для обновления");
        }

        const transaction = await sequelize.transaction();

        try {
            // Обновляем основные данные доктора
            const [affectedCount, updatedDoctors] = await DoctorModel.update(
                this.mapToPersistence(doctor),
                {
                    where: { id: doctor.id },
                    returning: true,
                    transaction
                }
            );

            if (affectedCount === 0 || !updatedDoctors || updatedDoctors.length === 0) {
                throw new Error(`Доктор с id ${doctor.id} не найден`);
            }

            const updatedDoctor = updatedDoctors[0] as DoctorModelInterface;
            const specializationUpdates = [];
            for (let i = 0; i < doctor.specializations.length; i++) {
                const specName = doctor.specializations[i];
                const diploma = doctor.diplomas[i] || null;
                const license = doctor.licenses[i] || null;

                const [spec] = await SpecializationModel.findOrCreate({
                    where: { name: specName },
                    transaction
                });

                specializationUpdates.push(
                    DoctorSpecialization.upsert({
                        doctorId: doctor.id,
                        specializationId: spec.id,
                        diploma,
                        license
                    }, { transaction })
                );
            }

            await Promise.all(specializationUpdates);

            const currentSpecializations = await SpecializationModel.findAll({
                where: { name: { [Op.in]: doctor.specializations } },
                transaction
            });

            const currentSpecIds = currentSpecializations.map(spec => spec.id);
            await DoctorSpecialization.destroy({
                where: {
                    doctorId: doctor.id,
                    specializationId: { [Op.notIn]: currentSpecIds }
                },
                transaction
            });

            await transaction.commit();

            const fullDoctor = await DoctorModel.findByPk(doctor.id, {
                include: [{
                    model: SpecializationModel,
                    through: { attributes: ['diploma', 'license'] },
                    attributes: ['name']
                }]
            });

            return this.mapToDomainDoctor(fullDoctor!);

        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async create(doctor: Doctor): Promise<Doctor> {
        const transaction = await sequelize.transaction();

        try {
            const createdDoctor = await DoctorModel.create(
                this.mapToPersistence(doctor),
                { transaction }
            );

            const specializationCreates = [];
            for (let i = 0; i < doctor.specializations.length; i++) {
                const specName = doctor.specializations[i];
                const diploma = doctor.diplomas[i] || null;
                const license = doctor.licenses[i] || null;

                const [spec] = await SpecializationModel.findOrCreate({
                    where: { name: specName },
                    transaction
                });

                specializationCreates.push(
                    DoctorSpecialization.create({
                        doctorId: createdDoctor.id,
                        specializationId: spec.id,
                        diploma,
                        license
                    }, { transaction })
                );
                console.log(specializationCreates);
            }

            await Promise.all(specializationCreates);
            await transaction.commit();

            const fullDoctor = await DoctorModel.findByPk(createdDoctor.id, {
                include: [{
                    model: SpecializationModel,
                    through: { attributes: ['diploma', 'license'] },
                    attributes: ['name']
                }]
            });

            return this.mapToDomainDoctor(fullDoctor!);

        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async getTimeSlots(doctorId: number): Promise<TimeSlot[]> {
        const doctorSchedules = await models.DoctorsSchedule.findAll({
            where: {
                doctorId: doctorId
            },
            include: [{
                model: models.TimeSlot,
                required: false,
                where: { is_available: true }
            }]
        });

        const timeSlots: TimeSlot[] = [];

        for (const schedule of doctorSchedules) {
            for (const slot of (schedule as any).time_slots || []) {
                const scheduleDate = new Date(schedule.date);
                const [hours, minutes] = slot.time.split(':').map(Number);
                scheduleDate.setHours(hours, minutes, 0, 0);

                if (scheduleDate < new Date()) {
                    continue;
                }

                const timeSlot = new TimeSlot(
                    slot.id,
                    slot.time,
                    slot.is_available,
                    slot.consultationId,
                    slot.patientId,
                    schedule.id
                );

                timeSlots.push(timeSlot);
            }
        }

        return timeSlots;
    }

    private mapToDomainDoctor(doctorModel: DoctorModelInterface & { specializations?: any[]; user?: any }): Doctor {
        const specializations: string[] = [];
        const diplomas: string[] = [];
        const licenses: string[] = [];

        if (doctorModel.specializations) {
            doctorModel.specializations.forEach(spec => {
                specializations.push(spec.name);
                diplomas.push(spec.doctor_specializations?.diploma || '');
                licenses.push(spec.doctor_specializations?.license || '');
            });
        }

        return new Doctor(
            doctorModel.id,
            doctorModel.experience_years,
            diplomas,
            licenses,
            doctorModel.isActivated,
            specializations,
            doctorModel.userId,
            doctorModel.user?.name,
            doctorModel.user?.surname,
            doctorModel.user?.patronymic,
            doctorModel.user?.img,
            doctorModel.user?.gender
        );
    }

    private mapToPersistence(doctor: Doctor): IDoctorCreationAttributes {
        return {
            experience_years: doctor.experienceYears,
            isActivated: doctor.isActivated,
            userId: doctor.userId
        };
    }
}