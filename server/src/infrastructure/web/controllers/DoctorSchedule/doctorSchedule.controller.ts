import { Request, Response, NextFunction } from "express";
import ApiError from "../../error/ApiError.js";
import UserRepository from "../../../../core/domain/repositories/user.repository.js";
import DoctorRepository from "../../../../core/domain/repositories/doctor.repository.js";
import TimeSlot from "../../../../core/domain/entities/timeSlot.entity.js";
import TimeSlotRepository from "../../../../core/domain/repositories/timeSlot.repository.js";
import { adjustTimeSlotToTimeZone, convertUserTimeToMoscow } from "../../function/transferTime.js"
import normalizeDate from "../../function/normDate.js";

export default class DoctorScheduleController {
    constructor(
        private readonly doctorRepository: DoctorRepository,
        private readonly userRepository: UserRepository,
        private readonly timeSlotRepository: TimeSlotRepository
    ) { }

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const { time, date, isRecurring, dayWeek, userId } = req.body;

            const user = await this.userRepository.findById(Number(userId));
            if (!user) {
                return next(ApiError.badRequest('Пользователь не найден'));
            }

            const doctor = await this.doctorRepository.findByUserId(user.id);
            if (!doctor) {
                return next(ApiError.badRequest('Специалист не найден'));
            }

            const moscowTime = convertUserTimeToMoscow(time, user.timeZone);
            console.log(normalizeDate(date))
            const timeSlot = await this.timeSlotRepository.save(new TimeSlot(0, moscowTime, normalizeDate(date), isRecurring, dayWeek, "OPEN", doctor.id));
            if (!timeSlot) {
                return next(ApiError.badRequest('Не удалось создать ячейку времени'));
            }

            return res.status(200).json({ success: true, message: "Запрос успешно выполнен" });
        } catch (e: any) {
            return next(ApiError.internal(e.message));
        }
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            await this.timeSlotRepository.delete(Number(id));
            res.status(200).send();
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

            const userTimeSlots = timeSlots.map(slot =>
                adjustTimeSlotToTimeZone(slot, linker.timeZone)
            );

            const result = userTimeSlots.map(slot => ({
                doctorId: slot.doctorId,
                time: slot.time,
                date: slot.date
            }));

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
