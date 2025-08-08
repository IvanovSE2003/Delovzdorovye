import Patient from '../../domain/entities/patient.entity.js';
import models from '../../../infrastructure/persostence/models/models.js';
import DoctorRepository from '../../domain/repositories/doctor.repository.js';
import { DoctorModelInterface, IDoctorCreationAttributes } from '../../../infrastructure/persostence/models/interfaces/doctor.model.js';
import Doctor from '../../domain/entities/doctor.entity.js';

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
            doctorModel.contacts,
            doctorModel.experience_years,
            doctorModel.activate,
            doctorModel.userId
        );
    }

    private mapToPersistence(doctor: Doctor): IDoctorCreationAttributes {
        return {
            specialization: doctor.specialization,
            contacts: doctor.contacts,
            experience_years: doctor.experienceYears,
            activate: doctor.isActivated,
            userId: doctor.userId
        };
    }
}