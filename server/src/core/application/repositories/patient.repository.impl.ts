import { Op } from 'sequelize';
import User from '../../domain/entities/user.entity.js';
import Patient from '../../domain/entities/patient.entity.js';
import Doctor from "../../domain/entities/doctor.entity.js";
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
        const user = await UserModel.findByPk(userId);
        const patient = await PatientModel.findByPk(user?.id);
        return patient ? this.mapToDomainPatient(patient) : null;
    }

    async update(patient: Patient): Promise<Patient> {
        if (!patient.id) {
            throw new Error("Patient ID is required for update");
        }

        const [affectedCount, updatedPatients] = await PatientModel.update(
            this.mapToPersistence(patient),
            {
                where: { id: patient.id },
                returning: true 
            }
        );

        if (affectedCount === 0 || !updatedPatients || updatedPatients.length === 0) {
            throw new Error(`Patient with id ${patient.id} not found or not updated`);
        }

        const updatedPatient = updatedPatients[0] as PatientModelInterface;
        return this.mapToDomainPatient(updatedPatient);
    }


    private mapToDomainPatient(patientModel: PatientModelInterface): Patient {
        return new Patient(
            patientModel.id,
            patientModel.general_info,
            patientModel.analyses_examinations,
            patientModel.additionally,
            patientModel.activate
        );
    }

    private mapToPersistence(patient: Patient): IPatientCreationAttributes {
        return {
            general_info: patient.generalInfo,
            analyses_examinations: patient.analysesExaminations,
            additionally: patient.additionally,
            activate: patient.activate 
        };
    }
}