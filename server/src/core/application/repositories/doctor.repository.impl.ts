import models from '../../../infrastructure/persostence/models/models.js';
import DoctorRepository from '../../domain/repositories/doctor.repository.js';
import { DoctorModelInterface, IDoctorCreationAttributes } from '../../../infrastructure/persostence/models/interfaces/doctor.model.js';
import Doctor from '../../domain/entities/doctor.entity.js';
import sequelize from '../../../infrastructure/persostence/db/db.js';
import TimeSlot from '../../domain/entities/timeSlot.entity.js';
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
                    attributes: ['id', 'name', 'surname', 'patronymic', 'img', 'gender', 'time_zone']
                },
                {
                    model: SpecializationModel,
                    through: { attributes: ['diploma', 'license'] },
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

    async getDoctorsWithSpecializations(userIds: number[]) {
        const doctors = await DoctorModel.findAll({
            where: { userId: userIds },
            include: [{
                model: SpecializationModel,
                through: { attributes: ['diploma', 'license'] }
            }]
        });
        return doctors.map(doctor => this.mapToDomainDoctor(doctor))
    }

    async update(doctor: Doctor): Promise<Doctor> {
        if (!doctor.id) {
            throw new Error("ID доктора не найдено для обновления");
        }

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
                    createdDoctor.experience_years,
                    createdDoctor.isActivated,
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
            specializationModel = await models.SpecializationModel.create({ name: specialization });
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
            doctorModel.experience_years,
            doctorModel.isActivated,
            doctorModel.userId,
            doctorModel.user
                ? {
                    img: doctorModel.user.img,
                    id: doctorModel.user.id,
                    name: doctorModel.user.name,
                    surname: doctorModel.user.surname,
                    patronymic: doctorModel.user.patronymic
                }
                : null,
            profData
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