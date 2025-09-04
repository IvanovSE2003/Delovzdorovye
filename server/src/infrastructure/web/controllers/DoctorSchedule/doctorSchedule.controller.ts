import { Request, Response, NextFunction } from "express";
import ApiError from "../../error/ApiError.js";
import DoctorScheduleRepository from "../../../../core/domain/repositories/doctorSchedule.repository.js";
import UserRepository from "../../../../core/domain/repositories/user.repository.js";
import DoctorRepository from "../../../../core/domain/repositories/doctor.repository.js";
import DoctorSchedule from "../../../../core/domain/entities/doctorSchedule.entity.js";
import TimeSlot from "../../../../core/domain/entities/timeSlot.entity.js";
import getRussianDayOfWeek from "../../function/getRussianDayOfWeek.js";
import { ITimeZones } from '../../../../../../frontend/src/models/TimeZones.js'
import TimeSlotRepository from "../../../../core/domain/repositories/timeSlot.repository.js";

const STORAGE_TIMEZONE = ITimeZones.MOSCOW;

export default class DoctorScheduleController {
    constructor(
        private readonly doctorScheduleRepository: DoctorScheduleRepository,
        private readonly doctorRepository: DoctorRepository,
        private readonly userRepository: UserRepository,
        private readonly timeSlotRepository: TimeSlotRepository
    ) { }

    async getByDoctor(req: Request<{ userId: string }, any, any, any>, res: Response, next: NextFunction) {
        try {
            const { userId } = req.query;

            const user = await this.userRepository.findById(Number(userId));
            if (!user) {
                return next(ApiError.badRequest('Пользователь не найден'));
            }

            // const linker = await this.userRepository.findById(Number(userIdLinker));
            // if (!linker) {
            //     return next(ApiError.badRequest('Пользователь, который получает данные не найден'));
            // }

            const doctor = await this.doctorRepository.findByUserId(user.id);
            if (!doctor) {
                return next(ApiError.badRequest('Пользователь не является доктором'));
            }

            const schedules = await this.doctorScheduleRepository.findByDoctorId(Number(doctor.id));
            if (!schedules || schedules.length === 0) {
                return next(ApiError.badRequest('Расписания не найдены'));
            }

            // const userSchedules = schedules.map(s =>
            //     this.adjustScheduleToTimeZone(s, linker.timeZone)
            // );

            return res.status(200).json(schedules);
        } catch (e: any) {
            return next(ApiError.internal(e.message));
        }
    }

    async createSchedule(req: Request, res: Response, next: NextFunction) {
        try {
            const { date, userId } = req.body;

            const day_weekly = getRussianDayOfWeek(date);

            const user = await this.userRepository.findById(Number(userId));
            if (!user) {
                return next(ApiError.badRequest('Пользователь не найден'));
            }

            const doctor = await this.doctorRepository.findByUserId(user.id);
            if (!doctor) {
                return next(ApiError.badRequest('Пользователь не является специалистом'));
            }

            const schedule = await this.doctorScheduleRepository.create(new DoctorSchedule(0, date, day_weekly, doctor.id))
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

            const schedule = await this.doctorScheduleRepository.findById(Number(scheduleId));
            if (!schedule) {
                return next(ApiError.badRequest('Расписание не найдено'));
            }

            const doctor = await this.doctorRepository.findById(schedule.doctorId || 0);
            if (!doctor || !doctor.userId) {
                return next(ApiError.badRequest('Доктор не найден'));
            }

            const user = await this.userRepository.findById(doctor.userId);
            if (!user) {
                return next(ApiError.badRequest('Пользователь-доктор не найден'));
            }

            const timeInMoscow = this.convertDoctorTimeToMoscow(time, user.timeZone);

            const newTimeSLot = new TimeSlot(0, timeInMoscow, true, schedule.id);
            const result = await this.timeSlotRepository.save(newTimeSLot);

            res.status(200).json(result);
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

    async findScheduleForSpecialist(req: Request, res: Response, next: NextFunction) {
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

            const schedules = await this.doctorScheduleRepository.findByDoctorId(doctor.id);
            if (!schedules || schedules.length === 0) {
                return next(ApiError.badRequest('Расписание для данного врача не найдено'));
            }

            const userSchedules = schedules.map(s =>
                this.adjustScheduleToTimeZone(s, linker.timeZone)
            );

            const result = userSchedules.flatMap(schedule => {
                return schedule.timeSlot?.map(time => ({
                    doctorId: doctor.id,
                    date: schedule.date,
                    time: time.time
                })) || [];
            });

            res.status(200).json(result);
        } catch (e: any) {
            return next(ApiError.internal(e.message));
        }
    }

    private adjustScheduleToTimeZone(schedule: DoctorSchedule, userTimeZone: ITimeZones): DoctorSchedule {
        const timeDifference = userTimeZone - STORAGE_TIMEZONE;

        return {
            ...schedule,
            date: this.adjustDate(schedule.date, timeDifference),
            timeSlot: schedule.timeSlot?.map(slot => ({
                ...slot,
                time: this.adjustTime(slot.time, timeDifference)
            }))
        };
    }

    private adjustTime(time: string, hoursDiff: number): string {
        const [hours, minutes] = time.split(':').map(Number);
        let newHours = hours + hoursDiff;

        // Обработка перехода через сутки
        if (newHours >= 24) {
            newHours -= 24;
        } else if (newHours < 0) {
            newHours += 24;
        }

        return `${newHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }

    private adjustDate(date: string, hoursDiff: number): string {
        if (hoursDiff === 0) return date;

        const jsDate = new Date(date);
        jsDate.setHours(jsDate.getHours() + hoursDiff);
        return jsDate.toISOString().split('T')[0];
    }

    private convertDoctorTimeToMoscow(time: string, doctorTimeZone: ITimeZones): string {
        const hoursDiff = STORAGE_TIMEZONE - doctorTimeZone;
        return this.adjustTime(time, hoursDiff);
    }
}
