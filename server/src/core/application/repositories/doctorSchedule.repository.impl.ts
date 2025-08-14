import models from '../../../infrastructure/persostence/models/models.js';
import { IPatientCreationAttributes, PatientModelInterface } from '../../../infrastructure/persostence/models/interfaces/patient.model.js';
import sequelize from '../../../infrastructure/persostence/db/db.js';
import DoctorScheduleRepository from '../../domain/repositories/doctorSchedule.repository.js';
import DoctorSchedule from '../../domain/entities/doctorSchedule.entity.js';
import { DoctorScheduleModelInterface, IDoctorScheduleCreationAttributes } from '../../../infrastructure/persostence/models/interfaces/doctorSchedule.model.js';

const {DoctorsSchedule, TimeSlot} = models;


export default class DoctorScheduleRepositoryImpl implements DoctorScheduleRepository {
    async findByDoctorId(doctorId: number): Promise<DoctorSchedule | null> {
        const schedule = await DoctorsSchedule.findOne({where: {doctorId}});
        return schedule ? this.mapToDomainSchedule(schedule) : null;
    }

    async create(doctor: DoctorSchedule): Promise<DoctorSchedule> {
        throw "";
    }

    async update(doctor: DoctorSchedule): Promise<DoctorSchedule> {
        throw "";
    }

    private mapToDomainSchedule(scheduleModel: DoctorScheduleModelInterface): DoctorSchedule {
        return new DoctorSchedule(
            scheduleModel.id,
            scheduleModel.date,
            scheduleModel.day_weekly,
            scheduleModel.time_start,
            scheduleModel.time_end
        );
    }

    private mapToPersistence(schedule: DoctorSchedule): IDoctorScheduleCreationAttributes {
        return {
            date: schedule.date,
            day_weekly: schedule.day_weekly,
            time_start: schedule.time_start,
            time_end: schedule.time_end
        };
    }
}