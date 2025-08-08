import Patient from '../../domain/entities/patient.entity.js';
import models from '../../../infrastructure/persostence/models/models.js';
import PatientRepository from '../../domain/repositories/patient.repository.js';
import { IPatientCreationAttributes, PatientModelInterface } from '../../../infrastructure/persostence/models/interfaces/patient.model.js';

const {UserModel, PatientModel} = models;

export default class PatientRepositoryImpl implements PatientRepository {

    async findById(id: number) {
        const patient = await PatientModel.findByPk(id);
        return patient ? this.mapToDomainPatient(patient) : null;
    }

    async findByUserId(userId: number) {
        if (isNaN(userId)) {
            return null;
        }
        const user = await UserModel.findByPk(userId);
        const patient = await PatientModel.findOne({where: {userId: user?.id}})
        return patient ? this.mapToDomainPatient(patient) : null;
    }

    async findAll(
        page: number = 1,
        limit: number = 10,
        filters?: {
            bloodType?: string;
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
        
        if (filters?.bloodType) {
            where.general_info = { bloodType: filters.bloodType };
        }
        
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
            include: [{
                model: UserModel,
                where: userWhere,
                required: true
            }],
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

        const [affectedCount, updatedPatients] = await PatientModel.update(
            this.mapToPersistence(patient),
            {
                where: { id: patient.id },
                returning: true 
            }
        );

        if (affectedCount === 0 || !updatedPatients || updatedPatients.length === 0) {
            throw new Error(`Пациент с id ${patient.id} не найден`);
        }

        const updatedPatient = updatedPatients[0] as PatientModelInterface;
        return this.mapToDomainPatient(updatedPatient);
    }

    async create(patient: Patient): Promise<Patient> {
        const createdPatient = await PatientModel.create(this.mapToPersistence(patient));
        return this.mapToDomainPatient(createdPatient);
    }

    private mapToDomainPatient(patientModel: PatientModelInterface): Patient {
        return new Patient(
            patientModel.id,
            patientModel.general_info,
            patientModel.analyses_examinations,
            patientModel.additionally,
            patientModel.activate,
            patientModel.userId
        );
    }

    private mapToPersistence(patient: Patient): IPatientCreationAttributes {
        return {
            general_info: patient.generalInfo,
            analyses_examinations: patient.analysesExaminations,
            additionally: patient.additionally,
            activate: patient.isActivated,
            userId: patient.userId
        };
    }
}