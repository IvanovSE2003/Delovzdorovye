import Patient from '../../domain/entities/patient.entity.js';
import models from '../../../infrastructure/persostence/models/models.js';
import DoctorRepository from '../../domain/repositories/doctor.repository.js';
import { DoctorModelInterface, IDoctorCreationAttributes } from '../../../infrastructure/persostence/models/interfaces/doctor.model.js';
import Doctor from '../../domain/entities/doctor.entity.js';
import { Op } from 'sequelize';

const {UserModel, DoctorModel} = models;

export default class DoctorRepositoryImpl implements DoctorRepository {

    async findById(id: number): Promise<Doctor | null> {
        const doctor = await DoctorModel.findByPk(id);
        return doctor ? this.mapToDomainDoctor(doctor) : null;
    }

    async findByUserId(userId: number) {
        const user = await UserModel.findByPk(userId);
        const doctor = await DoctorModel.findByPk(user?.id);
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
            where.specialization = filters.specialization;
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
            include: [{
                model: UserModel,
                where: userWhere,
                required: true
            }]
        });
        
        const totalPages = Math.ceil(totalCount / limit);
        
        const doctors = await DoctorModel.findAll({
            where,
            include: [{
                model: UserModel,
                where: userWhere,
                required: true,
                attributes: { exclude: ['pin_code', 'activationLink'] } 
            }],
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
            }
        });
        
        return doctors.map(doctor => this.mapToDomainDoctor(doctor));
    }

    async update(doctor: Doctor): Promise<Doctor> {
        if (!doctor.id) {
            throw new Error("ID пациента не найдено для обновления");
        }

        const [affectedCount, updatedPatients] = await DoctorModel.update(
            this.mapToPersistence(doctor),
            {
                where: { id: doctor.id },
                returning: true 
            }
        );

        if (affectedCount === 0 || !updatedPatients || updatedPatients.length === 0) {
            throw new Error(`Пациент с id ${doctor.id} не найден`);
        }

        const updatedDoctor = updatedPatients[0] as DoctorModelInterface;
        return this.mapToDomainDoctor(updatedDoctor);
    }

    async create(doctor: Doctor): Promise<Doctor> {
        const createdDoctor = await DoctorModel.create(this.mapToPersistence(doctor));
        return this.mapToDomainDoctor(createdDoctor);
    }

    private mapToDomainDoctor(doctorModel: DoctorModelInterface): Doctor {
        return new Doctor(
            doctorModel.id,
            doctorModel.specialization,
            doctorModel.experience_years,
            doctorModel.diploma,
            doctorModel.license,
            doctorModel.activate,
            doctorModel.userId
        );
    }

    private mapToPersistence(doctor: Doctor): IDoctorCreationAttributes {
        return {
            specialization: doctor.specialization,
            experience_years: doctor.experienceYears,
            diploma: doctor.diploma,
            license: doctor.license,
            activate: doctor.isActivated,
            userId: doctor.userId
        };
    }
}