import Patient from '../../domain/entities/patient.entity.js';
import models from '../../../infrastructure/persostence/models/models.js';
import PatientRepository from '../../domain/repositories/patient.repository.js';
import { IPatientCreationAttributes, PatientModelInterface } from '../../../infrastructure/persostence/models/interfaces/patient.model.js';
import sequelize from '../../../infrastructure/persostence/db/db.js';

const { UserModel, PatientModel } = models;

export default class PatientRepositoryImpl implements PatientRepository {

    async findById(id: number) {
        const patient = await PatientModel.findByPk(id);
        return patient ? this.mapToDomainPatient(patient) : null;
    }

    async findByUserId(userId: number) {
        const patient = await PatientModel.findOne({
            where: { userId },
            include: [
                UserModel
            ]
        });
        return patient ? this.mapToDomainPatient(patient) : null;
    }

    async findAll(
        page: number = 1,
        limit: number = 10,
        filters?: {
            isActive?: boolean;
            gender?: string;
        }
    ): Promise<{
        patients: Patient[];
        totalCount: number;
        totalPages: number;
    }> {
        const where: any = {};
        const userWhere: any = {};

        if (filters?.isActive !== undefined) {
            where.activate = filters.isActive;
        }

        if (filters?.gender) {
            userWhere.gender = filters.gender;
        }

        const totalCount = await PatientModel.count({
            where,
            include: [{
                model: UserModel,
                where: userWhere,
                required: true
            }]
        });

        const totalPages = Math.ceil(totalCount / limit);

        const patients = await PatientModel.findAll({
            where,
            include: [
                {
                    model: UserModel,
                    where: userWhere,
                    required: true
                },
            ],
            limit,
            offset: (page - 1) * limit,
            order: [['id', 'ASC']]
        });

        return {
            patients: patients.map(patient => this.mapToDomainPatient(patient)),
            totalCount,
            totalPages
        };
    }

    async update(patient: Patient): Promise<Patient> {
        if (!patient.id) {
            throw new Error("ID пациента не найдено для обновления");
        }

        const transaction = await sequelize.transaction();

        try {
            const [affectedCount, updatedPatients] = await PatientModel.update(
                { activate: patient.isActivated },
                { where: { id: patient.id }, returning: true, transaction }
            );

            if (affectedCount === 0 || !updatedPatients || updatedPatients.length === 0) {
                throw new Error(`Пациент не найден`);
            }

            await transaction.commit();

            const updatedPatient = await this.findById(patient.id);
            if (!updatedPatient) {
                throw new Error("Ошибка при получении обновленного пациента");
            }

            return updatedPatient;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async create(patient: Patient): Promise<Patient | null> {
        const createdPatient = await PatientModel.create({ userId: patient.userId, activate: patient.isActivated });
        return this.findById(createdPatient.id);
    }

    private mapToDomainPatient(patientModel: PatientModelInterface): Patient {
        return new Patient(
            patientModel.id,
            patientModel.activate,
            patientModel.userId
        )
    }

    private mapToPersistence(patient: Patient): IPatientCreationAttributes {
        return {
            activate: patient.isActivated,
            userId: patient.userId
        };
    }
}