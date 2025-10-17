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
                doctorId: id,
                status: "OPEN"
            }
        })
        return timeSlots.map(timeSlot => this.mapToDomainTimeSlot(timeSlot));
    }

    async findByTimeDate(time: string, doctorId: number, date: string, status: "OPEN" | "CLOSE" | "BOOKED"): Promise<TimeSlot | null> {
        const slotModels = await models.DoctorSlots.findOne({
            where: {
                date: date,
                time: time,
                doctorId: doctorId,
                status: status
            }
        })
        return slotModels ? this.mapToDomainTimeSlot(slotModels) : null
    }

    async findTimeSlotsBetweenDate(startDate: string, endDate: string, doctorId: number): Promise<TimeSlot[]> {
        const slotModels = await models.DoctorSlots.findAll({
            where: {
                date: {
                    [Op.between]: [startDate, endDate]
                },
                doctorId
            }
        });

        return slotModels.map((m: TimeSlotmModelInterface) => this.mapToDomainTimeSlot(m));
    }

    async findTimeSlotsForDoctor(doctorIds: number[]): Promise<TimeSlot[]> {
        const slotModels = await models.DoctorSlots.findAll({
            where: {
                doctorId: {
                    [Op.in]: doctorIds
                },
                status: "OPEN",
                date: {
                    [Op.gte]: new Date().toISOString().split('T')[0]
                }
            },
            order: [
                ['date', 'ASC'],
                ['time', 'ASC']
            ]
        });

        return slotModels.map(model => this.mapToDomainTimeSlot(model));
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

    // async takeBreak(startDate: string, endDate: string, doctorId: number): Promise<void> {
    //     await models.BreakModel.create({
    //         startDate,
    //         endDate,
    //         doctorId
    //     });
    //     await models.DoctorSlots.update(
    //         { status: "CLOSE" },
    //         {
    //             where: {
    //                 doctorId: doctorId,
    //                 date: {
    //                     [Op.between]: [startDate, endDate]
    //                 },
    //                 status: "OPEN"
    //             }
    //         }
    //     );
    // }

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

    async findByTimeRangeDate(
        startTime: string,
        endTime: string,
        doctorId: number,
        date: string,
        status: "OPEN" | "CLOSE" | "BOOKED"
    ): Promise<TimeSlot[]> {
        const slotModels = await models.DoctorSlots.findAll({
            where: {
                date: date,
                time: {
                    [Op.between]: [startTime, endTime]
                },
                doctorId: doctorId,
                status: status
            }
        })
        return slotModels.map(model => this.mapToDomainTimeSlot(model));
    }

    private mapToDomainTimeSlot(slotModel: TimeSlotmModelInterface): TimeSlot {
        return new TimeSlot(
            slotModel.id,
            slotModel.time,
            slotModel.date,
            slotModel.dayWeek,
            slotModel.status,
            slotModel.doctorId
        );
    }

    private mapToPersistence(slot: TimeSlot): ITimeSlotCreationAttributes {
        return {
            time: slot.time,
            date: slot.date,
            dayWeek: slot.dayWeek,
            status: slot.status,
            doctorId: slot.doctorId
        };
    }
}