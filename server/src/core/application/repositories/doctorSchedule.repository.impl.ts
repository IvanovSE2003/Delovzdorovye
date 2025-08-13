import models from '../../../infrastructure/persostence/models/models.js';
import { IPatientCreationAttributes, PatientModelInterface } from '../../../infrastructure/persostence/models/interfaces/patient.model.js';
import sequelize from '../../../infrastructure/persostence/db/db.js';
import DoctorScheduleRepository from '../../domain/repositories/doctorSchedule.repository.js';
import DoctorSchedule from '../../domain/entities/doctorSchedule.entity.js';

const {DoctorsSchedule, TimeSlot} = models;


export default class DoctorScheduleRepositoryImpl implements DoctorScheduleRepository {
    async findByDoctorId(doctorId: number): Promise<DoctorSchedule | null> {
        throw "";
    }

    async create(doctor: DoctorSchedule): Promise<DoctorSchedule> {
        throw "";
    }

    async update(doctor: DoctorSchedule): Promise<DoctorSchedule> {
        throw "";
    }
}