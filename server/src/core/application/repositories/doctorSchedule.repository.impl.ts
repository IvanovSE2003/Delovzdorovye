import models from '../../../infrastructure/persostence/models/models.js';
import DoctorScheduleRepository from '../../domain/repositories/doctorSchedule.repository.js';
import DoctorSchedule from '../../domain/entities/doctorSchedule.entity.js';
import { DoctorScheduleModelInterface, IDoctorScheduleCreationAttributes } from '../../../infrastructure/persostence/models/interfaces/doctorSchedule.model.js';
import TimeSlotsArray from '../../../infrastructure/web/types/timeSlot.type.js';
import sequelize from '../../../infrastructure/persostence/db/db.js';

const {DoctorsSchedule, TimeSlot} = models;

export default class DoctorScheduleRepositoryImpl implements DoctorScheduleRepository {
    async findByDoctorId(doctorId: number): Promise<DoctorSchedule | null> {
        const schedule = await DoctorsSchedule.findOne({
            where: {doctorId},
            include: [{
                model: TimeSlot,
                as: 'timeSlots'
            }]
        });
        return schedule ? this.mapToDomainSchedule(schedule) : null;
    }

    async findById(id: number): Promise<DoctorSchedule | null> {
        const schedule = await DoctorsSchedule.findByPk(id, {
            include: [{
                model: TimeSlot,
                as: 'time_slots'
            }]
        });
        return schedule ? this.mapToDomainSchedule(schedule) : null;
    }

    async create(schedule: DoctorSchedule): Promise<DoctorSchedule> {
        const createdSchedule = await DoctorsSchedule.create(this.mapToPersistence(schedule));
        return this.mapToDomainSchedule(createdSchedule);
    }

    async update(schedule: DoctorSchedule): Promise<DoctorSchedule> {
        const [updatedCount] = await DoctorsSchedule.update(this.mapToPersistence(schedule), {
            where: {id: schedule.id}
        });
        
        if (updatedCount === 0) {
            throw new Error('Расписание не найдено');
        }
        
        return this.findById(schedule.id) as Promise<DoctorSchedule>;
    }

    async delete(id: number): Promise<void> {
        const deletedCount = await DoctorsSchedule.destroy({where: {id}});
        if (deletedCount === 0) {
            throw new Error('Расписание не найдено');
        }
    }

    async createWithTimeSlots(schedule: DoctorSchedule, timeSlots: TimeSlotsArray): Promise<DoctorSchedule> {
        const transaction = await sequelize.transaction();
        
        try {
            const createdSchedule = await DoctorsSchedule.create(this.mapToPersistence(schedule), {transaction});
            
            if (timeSlots.length > 0) {
                await TimeSlot.bulkCreate(
                    timeSlots.map(slot => ({
                        ...slot,
                        doctorScheduleId: createdSchedule.id
                    })),
                    {transaction}
                );
            }
            
            await transaction.commit();
            return this.findById(createdSchedule.id) as Promise<DoctorSchedule>;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    private mapToDomainSchedule(scheduleModel: DoctorScheduleModelInterface & {timeSlots?: any[]}): DoctorSchedule {
        const timeSlots: TimeSlotsArray | undefined = scheduleModel.timeSlots?.map(slot => ({
            time: slot.time,
            is_available: slot.is_available
        }));
        
        return new DoctorSchedule(
            scheduleModel.id,
            scheduleModel.date,
            scheduleModel.day_weekly,
            scheduleModel.time_start,
            scheduleModel.time_end,
            scheduleModel.doctorId,
            timeSlots
        );
    }

    private mapToPersistence(schedule: DoctorSchedule): IDoctorScheduleCreationAttributes {
        return {
            date: schedule.date,
            day_weekly: schedule.day_weekly,
            time_start: schedule.time_start,
            time_end: schedule.time_end,
            doctorId: schedule.doctorId
        };
    }
}