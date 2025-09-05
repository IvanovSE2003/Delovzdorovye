import TimeSlot from "../../domain/entities/timeSlot.entity.js";
import TimeSlotRepository from "../../domain/repositories/timeSlot.repository.js";
import models from "../../../infrastructure/persostence/models/models.js";
import { ITimeSlotCreationAttributes, TimeSlotmModelInterface } from "../../../infrastructure/persostence/models/interfaces/timeSlot.model.js";
import { Op } from "sequelize";

export default class TimeSlotRepositoryImpl implements TimeSlotRepository {
    async findByTimeDate(time: string, doctorId: number, date: string, isAvailable: boolean): Promise<TimeSlot | null> {
        const targetDate = new Date(date);
        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);

        const doctorSchedule = await models.DoctorsSchedule.findOne({
            where: {
                doctorId: doctorId,
                date: { [Op.between]: [startOfDay, endOfDay] },
            },
            include: [{
                model: models.TimeSlot,
                where: {
                    time: time,
                    isAvailable: isAvailable
                }
            }]
        });

        if (!doctorSchedule || !doctorSchedule.time_slots || doctorSchedule.time_slots.length === 0) {
            return null;
        }

        return this.mapToDomainTimeSlot(doctorSchedule.time_slots[0]);
    }

    async findById(id: number): Promise<TimeSlot | null> {
        const timeSlot = await models.TimeSlot.findByPk(id);
        if (!timeSlot) {
            return null;
        }
        return this.mapToDomainTimeSlot(timeSlot);
    }

    async save(timeSlot: TimeSlot): Promise<TimeSlot> {
        return timeSlot.id ? await this.update(timeSlot) : await this.create(timeSlot);
    }

    async create(timeSlot: TimeSlot): Promise<TimeSlot> {
        const createdTimeSlot = await models.TimeSlot.create(this.mapToPersistence(timeSlot));
        return this.mapToDomainTimeSlot(createdTimeSlot);
    }

    async update(timeSlot: TimeSlot): Promise<TimeSlot> {
        const [affectedCount, affectedRows] = await models.TimeSlot.update(this.mapToPersistence(timeSlot), { where: { id: timeSlot.id }, returning: true });
        if (affectedCount === 0 || !affectedRows || affectedRows.length === 0) {
            throw new Error('Пользователь не был обновлен');
        }
        const updatedUser = affectedRows[0];
        return this.mapToDomainTimeSlot(updatedUser);
    }

    async delete(id: number): Promise<void> {
        const deletedCount = await models.TimeSlot.destroy({
            where: { id },
        });

        if (deletedCount === 0) {
            throw new Error('Ячейка вермени для удаления не найдена');
        }
    }
    
    private mapToDomainTimeSlot(slotModel: TimeSlotmModelInterface) {
        return new TimeSlot(
            slotModel.id,
            slotModel.time,
            slotModel.isAvailable
        );
    }

    private mapToPersistence(slot: TimeSlot): ITimeSlotCreationAttributes {
        return {
            time: slot.time,
            isAvailable: slot.isAvailable,
            doctorsScheduleId: slot.doctorsScheduleId
        };
    }
}