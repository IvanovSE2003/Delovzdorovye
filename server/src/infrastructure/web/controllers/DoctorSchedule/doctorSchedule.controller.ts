import { Request, Response, NextFunction } from "express";
import ApiError from "../../error/ApiError.js";
import DoctorScheduleRepository from "../../../../core/domain/repositories/doctorSchedule.repository.js";
import UserRepository from "../../../../core/domain/repositories/user.repository.js";
import DoctorRepository from "../../../../core/domain/repositories/doctor.repository.js";
import adjustScheduleToTimeZone from "../../function/adjustScheduleToTimeZone.js"
import DoctorSchedule from "../../../../core/domain/entities/doctorSchedule.entity.js";
import TimeSlot from "../../../../core/domain/entities/timeSlot.entity.js";
import getRussianDayOfWeek from "../../function/getRussianDayOfWeek.js";

export default class DoctorScheduleController {
    constructor(
        private readonly doctorScheduleRepository: DoctorScheduleRepository,
        private readonly doctorRepository: DoctorRepository,
        private readonly userRepository: UserRepository
    ) { }

    async getByDoctor(req: Request<{ userId: string }, any, any, any>, res: Response, next: NextFunction) {
        try {
            const { userId } = req.params;

            const user = await this.userRepository.findById(Number(userId));

            if (!user) {
                return next(ApiError.badRequest('Пользовалель не найден'));
            }

            const doctor = await this.doctorRepository.findByUserId(user.id);
            if (!doctor) {
                return next(ApiError.badRequest('Пользователь не является доктором'));
            }

            const schedules = await this.doctorScheduleRepository.findByDoctorId(Number(doctor.id));

            if (!schedules || schedules.length === 0) {
                return next(ApiError.badRequest('Расписания не найдены'));
            }

            // const userSchedules = schedules.map(s => adjustScheduleToTimeZone(s, user.timeZone));

            return res.status(200).json(schedules);
        } catch (e: any) {
            return next(ApiError.internal(e.message));
        }
    }

    async createSchedule(req: Request, res: Response, next: NextFunction) {
        try {
            const { date, time_start, time_end, userId } = req.body;

            const day_weekly = getRussianDayOfWeek(date);
            
            const user = await this.userRepository.findById(Number(userId));
            if (!user) {
                return next(ApiError.badRequest('Пользователь не найден'));
            }

            const doctor = await this.doctorRepository.findByUserId(user.id);
            if (!doctor) {
                return next(ApiError.badRequest('Пользователь не является специалистом'));
            }

            const schedule = await this.doctorScheduleRepository.create(new DoctorSchedule(0, date, day_weekly, time_start, time_end, doctor.id))
            return res.status(200).json(schedule);
        } catch (e: any) {
            return next(ApiError.internal(e.message));
        }
    }

    async deleteSchedule(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            await this.doctorScheduleRepository.delete(Number(id));
            res.status(204).send();
        } catch (e: any) {
            return next(ApiError.internal(e.message));
        }
    }

    async createTimeSlot(req: Request, res: Response, next: NextFunction) {
        try {
            const { time, scheduleId } = req.body;
            const isAvailable = false;
            const schedule = await this.doctorScheduleRepository.findById(Number(scheduleId));
            if (!schedule) {
                return next(ApiError.badRequest('Расписание не найдено'));
            }
            const time_slot = await this.doctorScheduleRepository.createTimeSlot(new TimeSlot(0, time, isAvailable, undefined, undefined, schedule.id));
            res.status(200).json(time_slot);
        } catch (e: any) {
            return next(ApiError.internal(e.message));
        }
    }

    async deleteTimeSlot(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            await this.doctorScheduleRepository.deleteTimeSlot(Number(id));
            res.status(200).send();
        } catch (e: any) {
            return next(ApiError.internal(e.message));
        }
    }
}
