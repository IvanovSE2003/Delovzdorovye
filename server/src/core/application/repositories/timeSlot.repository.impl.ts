import TimeSlot from "../../domain/entities/timeSlot.entity.js";
import TimeSlotRepository from "../../domain/repositories/timeSlot.repository.js";
import models from "../../../infrastructure/persostence/models/models.js";
import { ITimeSlotCreationAttributes, TimeSlotmModelInterface } from "../../../infrastructure/persostence/models/interfaces/timeSlot.model.js";
import { Op } from "sequelize";

export default class TimeSlotRepositoryImpl implements TimeSlotRepository {
    async findById(id: number): Promise<TimeSlot | null> {
        const timeSlot = await models.DoctorSlots.findByPk(id);
        if (!timeSlot) {
            return null;
        }
        return this.mapToDomainTimeSlot(timeSlot);
    }

    async findByDoctorId(id: number): Promise<TimeSlot[]> {
        const timeSlots = await models.DoctorSlots.findAll({
            where: {
                doctorId: id
            }
        })
        return timeSlots.map(timeSlot => this.mapToDomainTimeSlot(timeSlot));
    }

    async findByTimeDate(time: string, doctorId: number, date: string, isAvailable: boolean): Promise<TimeSlot | null> {
        const slotModels = await models.DoctorSlots.findOne({
            where: {
                date: date,
                time: time,
                doctorId: doctorId
            }
        })
        return slotModels ? this.mapToDomainTimeSlot(slotModels) : null
    }

    async findTimeSlotsBetweenDate(startDate: string, endDate: string): Promise<TimeSlot[]>  {
        const slotModels = await models.DoctorSlots.findAll({
            where: {
                isRecurring: false,
                date: {
                    [Op.between]: [startDate, endDate]
                }
            }
        });

        const recurringModels = await models.DoctorSlots.findAll({
            where: {
                isRecurring: true
            }
        });

        const start = new Date(startDate);
        const end = new Date(endDate);

        const recurringSlots: TimeSlot[] = [];
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const jsDay = d.getDay();
            const customDay = (jsDay + 6) % 7;

            const dateStr = d.toISOString().split("T")[0];

            recurringModels.forEach((m: TimeSlotmModelInterface) => {
                if (m.dayWeek === customDay) {
                    recurringSlots.push(
                        new TimeSlot(
                            m.id,
                            m.time,
                            dateStr,
                            m.isRecurring,
                            m.dayWeek,
                            m.status,
                            m.doctorId
                        )
                    );
                }
            });
        }

        return [
            ...slotModels.map((m: TimeSlotmModelInterface) => this.mapToDomainTimeSlot(m)),
            ...recurringSlots
        ];
    }

    async findByDoctorDate(doctorId: number, date: string): Promise<TimeSlot[]> {
        const timeSlots = await models.DoctorSlots.findAll({
            where: {
                date: date,
                doctorId: doctorId
            }
        })
        return timeSlots.map(timsSlot => this.mapToDomainTimeSlot(timsSlot));
    }

    async save(timeSlot: TimeSlot): Promise<TimeSlot> {
        return timeSlot.id ? await this.update(timeSlot) : await this.create(timeSlot);
    }

    async create(timeSlot: TimeSlot): Promise<TimeSlot> {
        const createdTimeSlot = await models.DoctorSlots.create(this.mapToPersistence(timeSlot));
        return this.mapToDomainTimeSlot(createdTimeSlot);
    }

    async update(timeSlot: TimeSlot): Promise<TimeSlot> {
        const [affectedCount, affectedRows] = await models.DoctorSlots.update(this.mapToPersistence(timeSlot), { where: { id: timeSlot.id }, returning: true });
        if (affectedCount === 0 || !affectedRows || affectedRows.length === 0) {
            throw new Error('Пользователь не был обновлен');
        }
        const updatedUser = affectedRows[0];
        return this.mapToDomainTimeSlot(updatedUser);
    }

    async delete(id: number): Promise<void> {
        const deletedCount = await models.DoctorSlots.destroy({
            where: { id },
        });

        if (deletedCount === 0) {
            throw new Error('Ячейка вермени для удаления не найдена');
        }
    }

    private mapToDomainTimeSlot(slotModel: TimeSlotmModelInterface): TimeSlot {
        return new TimeSlot(
            slotModel.id,
            slotModel.time,
            slotModel.date,
            slotModel.isRecurring,
            slotModel.dayWeek,
            slotModel.status,
            slotModel.doctorId
        );
    }

    private mapToPersistence(slot: TimeSlot): ITimeSlotCreationAttributes {
        return {
            time: slot.time,
            date: slot.date,
            isRecurring: slot.isRecurring,
            dayWeek: slot.dayWeek,
            status: slot.status,
            doctorId: slot.doctorId
        };
    }
}