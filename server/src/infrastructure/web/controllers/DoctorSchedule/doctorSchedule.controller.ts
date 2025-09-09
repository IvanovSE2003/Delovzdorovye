import { Request, Response, NextFunction } from "express";
import ApiError from "../../error/ApiError.js";
import UserRepository from "../../../../core/domain/repositories/user.repository.js";
import DoctorRepository from "../../../../core/domain/repositories/doctor.repository.js";
import TimeSlot from "../../../../core/domain/entities/timeSlot.entity.js";
import TimeSlotRepository from "../../../../core/domain/repositories/timeSlot.repository.js";
import { adjustTimeSlotToTimeZone, convertUserTimeToMoscow } from "../../function/transferTime.js"
import normalizeDate from "../../function/normDate.js";
import { addDays, format, isBefore } from "date-fns";

export default class DoctorScheduleController {
    constructor(
        private readonly doctorRepository: DoctorRepository,
        private readonly userRepository: UserRepository,
        private readonly timeSlotRepository: TimeSlotRepository
    ) { }

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const { time, date, dayWeek, userId } = req.body;

            const user = await this.userRepository.findById(Number(userId));
            if (!user) {
                return next(ApiError.badRequest('Пользователь не найден'));
            }

            const doctor = await this.doctorRepository.findByUserId(user.id);
            if (!doctor) {
                return next(ApiError.badRequest('Специалист не найден'));
            }

            const { newTime: moscowTime, newDate: moscowDate } = convertUserTimeToMoscow(date, time, user.timeZone);

            const timeSlot = await this.timeSlotRepository.save(new TimeSlot(0, moscowTime, normalizeDate(moscowDate), dayWeek, "OPEN", doctor.id));
            if (!timeSlot) {
                return next(ApiError.badRequest('Не удалось создать ячейку времени'));
            }

            return res.status(200).json({ success: true, message: "Запрос успешно выполнен" });
        } catch (e: any) {
            return next(ApiError.internal(e.message));
        }
    }

    async createRecurning(req: Request, res: Response, next: NextFunction) {
        try {
            const { time, date, dayWeek, userId } = req.body;

            const user = await this.userRepository.findById(Number(userId));
            if (!user) {
                return next(ApiError.badRequest('Пользователь не найден'));
            }

            const doctor = await this.doctorRepository.findByUserId(user.id);
            if (!doctor) {
                return next(ApiError.badRequest('Специалист не найден'));
            }

            const { newTime: moscowTime, newDate: moscowDate } =
                convertUserTimeToMoscow(date, time, user.timeZone);

            for (let i = 0; i < 10; i++) {
                const slotDate = normalizeDate(addDays(new Date(moscowDate), i * 7).toString());

                const existing = await this.timeSlotRepository.findByTimeDate(
                    moscowTime,
                    doctor.id,
                    slotDate,
                    "OPEN"
                );
                if (existing) continue;

                await this.timeSlotRepository.save(
                    new TimeSlot(
                        0,
                        moscowTime,
                        slotDate,
                        dayWeek,
                        "OPEN",
                        doctor.id
                    )
                );
            }

            return res.status(200).json({ success: true, message: "Слоты созданы на 10 недель вперёд" });
        } catch (e: any) {
            return next(ApiError.internal(e.message));
        }
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            await this.timeSlotRepository.delete(Number(id));
            res.status(204).send();
        } catch (e: any) {
            return next(ApiError.internal(e.message));
        }
    }

    async findTimeSlotsForSpecialist(req: Request, res: Response, next: NextFunction) {
        try {
            const { doctorId, linkerId } = req.query;

            const doctor = await this.doctorRepository.findById(Number(doctorId));
            if (!doctor) {
                return next(ApiError.badRequest('Специалист не найден'));
            }

            const linker = await this.userRepository.findById(Number(linkerId));
            if (!linker) {
                return next(ApiError.badRequest('Пользователь, который получает данные не найден'));
            }

            const timeSlots = await this.timeSlotRepository.findByDoctorId(doctor.id);
            if (!timeSlots || timeSlots.length === 0) {
                return res.status(200).json([]);
            }

            const result = timeSlots.map(slot => {
                const adjustedSlot = adjustTimeSlotToTimeZone(slot, linker.timeZone);
                return {
                    doctorId: adjustedSlot.doctorId,
                    time: adjustedSlot.time,
                    date: adjustedSlot.date,
                    status: adjustedSlot.status
                };
            });

            res.status(200).json(result);
        } catch (e: any) {
            return next(ApiError.internal(e.message));
        }
    }

    async findTimeSlotsBetweenDate(req: Request, res: Response, next: NextFunction) {
        try {
            const startDate = normalizeDate(req.query.startDate as string);
            const endDate = normalizeDate(req.query.endDate as string);
            const userId = req.query.userId as string;

            const user = await this.userRepository.findById(Number(userId));
            if (!user) {
                return next(ApiError.badRequest('Пользователь не найден'));
            }

            if (!startDate || !endDate) {
                return next(ApiError.badRequest('Неверный формат даты'));
            }

            const timeSlots = await this.timeSlotRepository.findTimeSlotsBetweenDate(startDate, endDate);
            const results = timeSlots.map(timeSlot => adjustTimeSlotToTimeZone(timeSlot, user.timeZone));

            return res.status(200).json(results);
        } catch (e: any) {
            return next(ApiError.internal(e.message));
        }
    }

    async getForDateDoctor(req: Request, res: Response, next: NextFunction) {
        try {
            const { doctorId, date } = req.query;

            const normDate = normalizeDate(date as string);

            const doctor = await this.doctorRepository.findById(Number(doctorId));
            if (!doctor) {
                return next(ApiError.badRequest('Специалист не нейден'));
            }

            const user = await this.userRepository.findByDoctorId(doctor.id);
            if (!user) {
                return next(ApiError.badRequest('Пользователь не найден'));
            }

            const timeSlots = await this.timeSlotRepository.findByDoctorDate(doctor.id, normDate);
            const results = timeSlots.map(timeSlot => {
                time: adjustTimeSlotToTimeZone(timeSlot, user.timeZone);
                date: timeSlot.date;
                status: timeSlot.status;
            })
            res.status(200).json(results);
        } catch (e: any) {
            return next(ApiError.internal(e.message));
        }
    }
}
