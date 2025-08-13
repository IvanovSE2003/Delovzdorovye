import Patient from '../../domain/entities/patient.entity.js';
import models from '../../../infrastructure/persostence/models/models.js';
import PatientRepository from '../../domain/repositories/patient.repository.js';
import { IPatientCreationAttributes, PatientModelInterface } from '../../../infrastructure/persostence/models/interfaces/patient.model.js';
import sequelize from '../../../infrastructure/persostence/db/db.js';

const { UserModel, PatientModel, ChronicDiseaseModel, SurgeryModel, AllergyModel, MedicationModel, AnalysisModel, ExaminationModel, HereditaryDiseaseModel} = models;

export default class PatientRepositoryImpl implements PatientRepository {

    async findById(id: number) {
        const patient = await PatientModel.findByPk(id, {
            include: [
                ChronicDiseaseModel,
                SurgeryModel,
                AllergyModel,
                MedicationModel,
                AnalysisModel,
                ExaminationModel,
                HereditaryDiseaseModel
            ]
        });
        return patient ? this.mapToDomainPatient(patient) : null;
    }

    async findByUserId(userId: number) {
        const patient = await PatientModel.findOne({
            where: { userId },
            include: [
                ChronicDiseaseModel,
                SurgeryModel,
                AllergyModel,
                MedicationModel,
                AnalysisModel,
                ExaminationModel,
                HereditaryDiseaseModel,
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
                ChronicDiseaseModel,
                SurgeryModel,
                AllergyModel,
                MedicationModel,
                AnalysisModel,
                ExaminationModel,
                HereditaryDiseaseModel
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
                { where: { id: patient.id }, returning: true, transaction}
            );

            if (affectedCount === 0 || !updatedPatients || updatedPatients.length === 0) {
                throw new Error(`Пациент не найден`);
            }

            await this.updateRelatedEntities(patient, transaction);

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
        const transaction = await sequelize.transaction();

        try {
            const createdPatient = await PatientModel.create(
                { userId: patient.userId, activate: patient.isActivated },
                { transaction }
            );

            await this.createEmptyRelatedEntities(createdPatient.id, transaction);

            await transaction.commit();

            return this.findById(createdPatient.id);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    private async createEmptyRelatedEntities(patientId: number, transaction: any) {
        await ChronicDiseaseModel.create({ 
            patientId, 
            name: "" 
        }, { transaction });

        await SurgeryModel.create({ 
            patientId, 
            year: new Date().getFullYear(), 
            description: "" 
        }, { transaction });

        await AllergyModel.create({ 
            patientId, 
            type: "", 
            description: "" 
        }, { transaction });

        await MedicationModel.create({ 
            patientId, 
            name: "", 
            dosage: "" 
        }, { transaction });

        await AnalysisModel.create({ 
            patientId, 
            name: "", 
            file: "" 
        }, { transaction });

        await ExaminationModel.create({ 
            patientId, 
            name: "", 
            file: "" 
        }, { transaction });

        await HereditaryDiseaseModel.create({ 
            patientId, 
            name: "" 
        }, { transaction });
    }

    private async updateRelatedEntities(patient: Patient, transaction: any) {
        await ChronicDiseaseModel.destroy({
            where: { patientId: patient.id },
            transaction
        });

        if (patient.chronicDiseases?.length) {
            await ChronicDiseaseModel.bulkCreate(
                patient.chronicDiseases.map(d => ({ ...d, patientId: patient.id })),
                { transaction }
            );
        }

        await SurgeryModel.destroy({
            where: { patientId: patient.id },
            transaction
        });
        if (patient.surgeries?.length) {
            await SurgeryModel.bulkCreate(
                patient.surgeries.map(s => ({ ...s, patientId: patient.id })),
                { transaction }
            );
        }

        await AllergyModel.destroy({
            where: { patientId: patient.id },
            transaction
        });
        if (patient.allergies?.length) {
            await AllergyModel.bulkCreate(
                patient.allergies.map(a => ({ ...a, patientId: patient.id })),
                { transaction }
            );
        }

        await MedicationModel.destroy({
            where: { patientId: patient.id },
            transaction
        });
        if (patient.medications?.length) {
            await MedicationModel.bulkCreate(
                patient.medications.map(m => ({ ...m, patientId: patient.id })),
                { transaction }
            );
        }

        await AnalysisModel.destroy({
            where: { patientId: patient.id },
            transaction
        });
        if (patient.analyses?.length) {
            await AnalysisModel.bulkCreate(
                patient.analyses.map(a => ({ ...a, patientId: patient.id })),
                { transaction }
            );
        }

        await ExaminationModel.destroy({
            where: { patientId: patient.id },
            transaction
        });
        if (patient.examinations?.length) {
            await ExaminationModel.bulkCreate(
                patient.examinations.map(e => ({ ...e, patientId: patient.id })),
                { transaction }
            );
        }

        await HereditaryDiseaseModel.destroy({
            where: { patientId: patient.id },
            transaction
        });
        if (patient.hereditaryDiseases?.length) {
            await HereditaryDiseaseModel.bulkCreate(
                patient.hereditaryDiseases.map(h => ({ ...h, patientId: patient.id })),
                { transaction }
            );
        }
    }

    private async createRelatedEntities(patient: Patient, patientId: number, transaction: any) {
        if (patient.chronicDiseases?.length) {
            await ChronicDiseaseModel.bulkCreate(
                patient.chronicDiseases.map(d => ({ ...d, patientId })),
                { transaction }
            );
        }

        if (patient.surgeries?.length) {
            await SurgeryModel.bulkCreate(
                patient.surgeries.map(s => ({ ...s, patientId })),
                { transaction }
            );
        }

        if (patient.allergies?.length) {
            await AllergyModel.bulkCreate(
                patient.allergies.map(a => ({ ...a, patientId })),
                { transaction }
            );
        }

        if (patient.medications?.length) {
            await MedicationModel.bulkCreate(
                patient.medications.map(m => ({ ...m, patientId })),
                { transaction }
            );
        }

        if (patient.analyses?.length) {
            await AnalysisModel.bulkCreate(
                patient.analyses.map(a => ({ ...a, patientId })),
                { transaction }
            );
        }

        if (patient.examinations?.length) {
            await ExaminationModel.bulkCreate(
                patient.examinations.map(e => ({ ...e, patientId })),
                { transaction }
            );
        }

        if (patient.hereditaryDiseases?.length) {
            await HereditaryDiseaseModel.bulkCreate(
                patient.hereditaryDiseases.map(h => ({ ...h, patientId })),
                { transaction }
            );
        }
    }

    private mapToDomainPatient(patientModel: PatientModelInterface & {
        chronicDiseases?: any[];
        surgeries?: any[];
        allergies?: any[];
        medications?: any[];
        analyses?: any[];
        examinations?: any[];
        hereditaryDiseases?: any[];
        user?: any;
    }): Patient {
        return new Patient(
            patientModel.id,
            patientModel.activate,
            patientModel.userId,
            {
                chronicDiseases: patientModel.chronicDiseases?.map(d => ({
                    id: d.id,
                    name: d.name
                })),
                surgeries: patientModel.surgeries?.map(s => ({
                    id: s.id,
                    year: s.year,
                    description: s.description
                })),
                allergies: patientModel.allergies?.map(a => ({
                    id: a.id,
                    type: a.type,
                    description: a.description
                })),
                medications: patientModel.medications?.map(m => ({
                    id: m.id,
                    name: m.name,
                    dosage: m.dosage
                })),
                analyses: patientModel.analyses?.map(a => ({
                    id: a.id,
                    name: a.name,
                    file: a.file
                })),
                examinations: patientModel.examinations?.map(e => ({
                    id: e.id,
                    name: e.name,
                    file: e.file
                })),
                hereditaryDiseases: patientModel.hereditaryDiseases?.map(h => ({
                    id: h.id,
                    name: h.name
                })),
                user: patientModel.user ? {
                    name: patientModel.user.name,
                    surname: patientModel.user.surname,
                    patronymic: patientModel.user.patronymic,
                    gender: patientModel.user.gender,
                    dateBirth: patientModel.user.date_birth
                } : undefined
            }
        );
    }

    private mapToPersistence(patient: Patient): IPatientCreationAttributes {
        return {
            activate: patient.isActivated,
            userId: patient.userId
        };
    }
}