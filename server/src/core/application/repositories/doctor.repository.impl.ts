import models from '../../../infrastructure/persostence/models/models.js';
import DoctorRepository from '../../domain/repositories/doctor.repository.js';
import { IDoctorCreationAttributes } from '../../../infrastructure/persostence/models/interfaces/doctor.model.js';
import Doctor from '../../domain/entities/doctor.entity.js';
import sequelize from '../../../infrastructure/persostence/db/db.js';
import { Op } from "sequelize";

const { UserModel, DoctorModel, SpecializationModel, DoctorSpecialization } = models;

export default class DoctorRepositoryImpl implements DoctorRepository {
    async findById(id: number): Promise<Doctor | null> {
        const doctor = await DoctorModel.findByPk(id, {
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

    async findByUserId(userId: number) {
        const doctor = await DoctorModel.findOne({
            where: {
                userId,
                isActivated: true
            },
            include: [
                {
                    model: SpecializationModel,
                    through: { attributes: ['diploma', 'license'] },
                    attributes: ['id', 'name'],
                }
            ]
        });

        return doctor ? this.mapToDomainDoctor(doctor) : null;
    }

    async findByUserIdSimple(userId: number): Promise<Doctor | null> {
        const doctor = await DoctorModel.findOne({
            where: {
                userId
            }
        });
        return doctor ? this.mapToDomainDoctor(doctor) : null;
    }

    async findByProblems(problems: number[] | number | string | string[]): Promise<Doctor[]> {
        if (!problems || (Array.isArray(problems) && problems.length === 0)) {
            throw new Error("Проблемы не указаны");
        }

        let problemIds: number[] = [];

        if (Array.isArray(problems)) {
            problemIds = problems.map(p => Number(p));
        } else {
            problemIds = [Number(problems)];
        }

        const doctors = await DoctorModel.findAll({
            where: {
                isActivated: true,
                competencies: {
                    [Op.overlap]: problemIds
                }
            },
            include: [
                {
                    model: UserModel,
                    attributes: ["id", "name", "surname", "patronymic", "img", "time_zone"]
                },
                {
                    model: SpecializationModel,
                    through: { attributes: ["diploma", "license"] },
                    attributes: ["id", "name"]
                }
            ]
        });

        const sortedDoctors = doctors
            .map(d => ({
                doctor: d,
                matchCount: d.competencies.filter(c => problemIds.includes(c)).length
            }))
            .sort((a, b) => b.matchCount - a.matchCount)
            .map(d => this.mapToDomainDoctor(d.doctor));

        return sortedDoctors;
    }

    async findAll(
        page?: number,
        limit?: number,
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
        const currentPage = page || 1;
        const currentLimit = limit || 10;

        const where: any = {};
        const userWhere: any = {};

        if (filters?.specialization) {
            where['$specializations.name$'] = filters.specialization;
        }

        if (filters?.isActive !== undefined) {
            where.activate = filters.isActive;
        }

        if (filters?.gender) {
            userWhere.gender = filters.gender;
        }

        where.isActivated = true;

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

        const totalPages = Math.ceil(totalCount / currentLimit);

        const queryOptions: any = {
            where,
            include: [
                {
                    model: UserModel,
                    where: userWhere,
                    required: true,
                    attributes: ['id', 'name', 'surname', 'patronymic', 'img', 'gender', 'time_zone']
                },
                {
                    model: SpecializationModel,
                    through: { attributes: ['diploma', 'license'] },
                    attributes: ['name'],
                    where: filters?.specialization ? { name: filters.specialization } : {}
                }
            ],
            order: [['id', 'ASC']]
        };

        if (limit !== undefined) {
            queryOptions.limit = currentLimit;
            queryOptions.offset = (currentPage - 1) * currentLimit;
        }

        const doctors = await DoctorModel.findAll(queryOptions);


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
                },
                isActivated: true
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

    async findByAvailableSlot(date: string, time: string): Promise<Doctor[]> {
        const doctors = await DoctorModel.findAll({
            where: {
                isActivated: true
            },
            include: [
                {
                    model: UserModel,
                    attributes: ["id", "name", "surname", "patronymic", "img", "time_zone"]
                },
                {
                    model: SpecializationModel,
                    through: { attributes: ["diploma", "license"] },
                    attributes: ["id", "name"]
                },
                {
                    model: models.DoctorSlots,
                    where: {
                        date: date,
                        time: time,
                        status: "OPEN"
                    },
                    required: true 
                }
            ]
        });

        return doctors.map(doctor => this.mapToDomainDoctor(doctor));
    }

    async getDoctorsWithSpecializations(userIds: number[]) {
        const doctors = await DoctorModel.findAll({
            where: {
                userId: userIds,
                isActivated: true
            },
            include: [{
                model: SpecializationModel,
                through: { attributes: ['diploma', 'license'] }
            }]
        });
        return doctors.map(doctor => this.mapToDomainDoctor(doctor))
    }

    async update(doctor: Doctor): Promise<Doctor> {
        const transaction = await sequelize.transaction();
        try {
            const [affectedCount, updatedDoctors] = await DoctorModel.update(
                this.mapToPersistence(doctor),
                {
                    where: { id: doctor.id },
                    returning: true,
                    transaction
                }
            );

            const doctorSpecialization = await DoctorSpecialization.findOne({
                where: { doctorId: doctor.id },
                include: [SpecializationModel],
                transaction
            }) as any;

            const currentSpecialization = doctorSpecialization?.specialization

            await DoctorSpecialization.destroy({
                where: {
                    doctorId: doctor.id,
                    specializationId: currentSpecialization?.id
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

    async updateSimple(doctor: Doctor): Promise<void> {
        await DoctorModel.update(
            { isActivated: doctor.isActivated },
            { where: { id: doctor.id } }
        );
    }

    async create(doctor: Doctor): Promise<Doctor> {
        const transaction = await sequelize.transaction();

        try {
            const createdDoctor = await DoctorModel.create(
                this.mapToPersistence(doctor),
                { transaction }
            );

            await transaction.commit();

            const fullDoctor = await DoctorModel.findByPk(createdDoctor.id, {
                include: [{
                    model: SpecializationModel,
                    through: { attributes: ['diploma', 'license'] },
                    attributes: ['name']
                }]
            });

            if (!fullDoctor) {
                return new Doctor(
                    createdDoctor.id,
                    createdDoctor.isActivated,
                    [],
                    createdDoctor.userId,
                    null,
                    []
                );
            }

            return this.mapToDomainDoctor(fullDoctor);

        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async save(doctor: Doctor): Promise<Doctor> {
        return doctor.id ? await this.update(doctor) : await this.create(doctor);
    }

    async saveLisinseDiploma(doctor: Doctor, license: string, diploma: string, specialization: string): Promise<void> {
        let specializationModel = await models.SpecializationModel.findOne({
            where: { name: specialization }
        });

        if (!specializationModel) {
            throw new Error('Специализация не найдена');
        }

        let doctorSpecialization = await models.DoctorSpecialization.findOne({
            where: {
                doctorId: doctor.id,
                specializationId: specializationModel.id
            }
        });

        if (doctorSpecialization) {
            await doctorSpecialization.update({
                diploma,
                license
            });
        } else {
            await models.DoctorSpecialization.create({
                doctorId: doctor.id,
                specializationId: specializationModel.id,
                diploma,
                license
            });
        }
    }

    async deleteLisinseDiploma(doctor: Doctor, license: string, diploma: string, specialization: string): Promise<void> {
        const transaction = await sequelize.transaction();
        try {
            const specializationModel = await models.SpecializationModel.findOne({
                where: { name: specialization },
                transaction
            });

            if (!specializationModel) {
                throw new Error('Специализация не найдена');
            }

            const result = await models.DoctorSpecialization.destroy({
                where: {
                    doctorId: doctor.id,
                    specializationId: specializationModel.id
                },
                transaction
            });

            if (result === 0) {
                throw new Error('Связь доктора со специализацией не найдена');
            }

            await transaction.commit();

        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    private mapToDomainDoctor(doctorModel: any): Doctor {
        const profData = Array.isArray(doctorModel.specializations)
            ? doctorModel.specializations.map((spec: any) => ({
                id: spec.id,
                specialization: spec.name,
                diploma: spec.doctor_specializations?.diploma || null,
                license: spec.doctor_specializations?.license || null
            }))
            : [];

        return new Doctor(
            doctorModel.id,
            doctorModel.isActivated,
            doctorModel.competencies,
            doctorModel.userId,
            doctorModel.user
                ? {
                    img: doctorModel.user.img,
                    id: doctorModel.user.id,
                    name: doctorModel.user.name,
                    surname: doctorModel.user.surname,
                    patronymic: doctorModel.user.patronymic,
                    time_zone: doctorModel.user.time_zone
                }
                : null,
            profData
        );
    }

    private mapToPersistence(doctor: Doctor): IDoctorCreationAttributes {
        return {
            isActivated: doctor.isActivated,
            userId: doctor.userId,
            competencies: doctor.competencies
        };
    }
}