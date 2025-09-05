import models from '../../../infrastructure/persostence/models/models.js';
import DoctorScheduleRepository from '../../domain/repositories/doctorSchedule.repository.js';
import DoctorSchedule from '../../domain/entities/doctorSchedule.entity.js';
import { DoctorScheduleModelInterface, IDoctorScheduleCreationAttributes } from '../../../infrastructure/persostence/models/interfaces/doctorSchedule.model.js';
import TimeSlotsArray from '../../../infrastructure/web/types/timeSlot.type.js';
import sequelize from '../../../infrastructure/persostence/db/db.js';
import { Op } from "sequelize";

const { DoctorsSchedule } = models;

export default class DoctorScheduleRepositoryImpl implements DoctorScheduleRepository {
    async findByDoctorId(doctorId: number): Promise<DoctorSchedule[] | null> {
        const schedules = await DoctorsSchedule.findAll({
            where: { doctorId },
            include: [{
                model: models.TimeSlot,
                where: {
                    isAvailable: true
                },
                as: 'time_slots',
                foreignKey: 'schedule_id'
            }]
        });

        return schedules.map(schedule => this.mapToDomainSchedule(schedule));
    }

    async findById(id: number): Promise<DoctorSchedule | null> {
        const schedule = await DoctorsSchedule.findByPk(id, {
            include: [{
                model: models.TimeSlot,
                as: 'time_slots',
                foreignKey: 'schedule_id'
            }]
        });
        return schedule ? this.mapToDomainSchedule(schedule) : null;
    }

    async getBetweenSchedule(startDate: string, endDate: string): Promise<DoctorSchedule[]> {
        const schedules = await DoctorsSchedule.findAll({
            where: {
                date: {
                    [Op.between]: [startDate, endDate]
                }
            },
            include: [{
                model: models.TimeSlot,
                as: 'time_slots',
                foreignKey: 'doctorsScheduleId',
                required: false
            }]
        });

        return schedules.map(schedule => this.mapToDomainSchedule(schedule));
    }

    async create(schedule: DoctorSchedule): Promise<DoctorSchedule> {
        const createdSchedule = await DoctorsSchedule.create(this.mapToPersistence(schedule));
        return this.mapToDomainSchedule(createdSchedule);
    }

    async update(schedule: DoctorSchedule): Promise<DoctorSchedule> {
        const [updatedCount] = await DoctorsSchedule.update(this.mapToPersistence(schedule), {
            where: { id: schedule.id }
        });

        if (updatedCount === 0) {
            throw new Error('Расписание не найдено');
        }

        return this.findById(schedule.id) as Promise<DoctorSchedule>;
    }

    async save(schedule: DoctorSchedule): Promise<DoctorSchedule> {
        return schedule.id ? await this.update(schedule) : await this.create(schedule);
    }

    async delete(id: number): Promise<void> {
        const transaction = await sequelize.transaction();
        try {

            await models.TimeSlot.destroy({
                where: { doctorsScheduleId: id },
                transaction
            });

            const deletedCount = await DoctorsSchedule.destroy({
                where: { id },
                transaction
            });

            if (deletedCount === 0) {
                throw new Error('Расписание не найдено');
            }

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async createWithTimeSlots(schedule: DoctorSchedule, time_slots: TimeSlotsArray): Promise<DoctorSchedule> {
        const transaction = await sequelize.transaction();

        try {
            const createdSchedule = await DoctorsSchedule.create(this.mapToPersistence(schedule), { transaction });

            if (time_slots.length > 0) {
                await models.TimeSlot.bulkCreate(
                    time_slots.map(slot => ({
                        ...slot,
                        doctorScheduleId: createdSchedule.id,
                        isAvailable: false
                    })),
                    { transaction }
                );
            }

            await transaction.commit();
            return this.findById(createdSchedule.id) as Promise<DoctorSchedule>;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async findByDate(doctorId: number, date: Date | string): Promise<DoctorSchedule | null> {
        const normalizedDate =
            typeof date === "string"
                ? new Date(date).toISOString().slice(0, 10)
                : date.toISOString().slice(0, 10);

        const schedule = await DoctorsSchedule.findOne({
            where: {
                doctorId,
                date: normalizedDate
            },
            include: [{
                model: models.TimeSlot,
                as: 'time_slots',
                foreignKey: 'doctorsScheduleId'
            }]
        });

        return schedule ? this.mapToDomainSchedule(schedule) : null;
    }


    private mapToDomainSchedule(scheduleModel: DoctorScheduleModelInterface & { time_slots?: any[] }): DoctorSchedule {
        const time_slots: TimeSlotsArray | undefined = scheduleModel.time_slots?.map(slot => ({
            id: slot.id,
            time: slot.time,
            is_available: slot.isAvailable
        }));

        return new DoctorSchedule(
            scheduleModel.id,
            scheduleModel.date,
            scheduleModel.day_weekly,
            scheduleModel.doctorId,
            time_slots
        );
    }

    private mapToPersistence(schedule: DoctorSchedule): IDoctorScheduleCreationAttributes {
        return {
            date: schedule.date,
            day_weekly: schedule.day_weekly,
            doctorId: schedule.doctorId
        };
    }
}