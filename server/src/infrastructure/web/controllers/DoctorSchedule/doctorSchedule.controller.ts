import { Request, Response, NextFunction } from "express";
import ApiError from "../../error/ApiError.js";
import UserRepository from "../../../../core/domain/repositories/user.repository.js";
import DoctorRepository from "../../../../core/domain/repositories/doctor.repository.js";
import TimeSlot from "../../../../core/domain/entities/timeSlot.entity.js";
import TimeSlotRepository from "../../../../core/domain/repositories/timeSlot.repository.js";
import { adjustTimeSlotToTimeZone, convertMoscowToUserTime, convertUserTimeToMoscow } from "../../function/transferTime.js"
import normalizeDate from "../../function/normDate.js";
import { addDays, isBefore } from "date-fns";
import { formatTime, parseTime } from "../../function/formatTime.js"

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

            return res.status(201).json({ success: true, message: "Запрос успешно выполнен" });
        } catch (e: any) {
            return next(ApiError.internal(e.message));
        }
    }

    async createRecurring(req: Request, res: Response, next: NextFunction) {
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

            return res.status(201).json({ success: true, message: "Слоты созданы на 10 недель вперёд" });
        } catch (e: any) {
            return next(ApiError.internal(e.message));
        }
    }

    async createGap(req: Request, res: Response, next: NextFunction) {
        try {
            const { timeStart, timeEnd, date, dayWeek, userId } = req.body;

            const user = await this.userRepository.findById(Number(userId));
            if (!user) return next(ApiError.badRequest('Пользователь не найден'));

            const doctor = await this.doctorRepository.findByUserId(user.id);
            if (!doctor) return next(ApiError.badRequest('Специалист не найден'));

            const { newTime: moscowTimeStart, newDate: moscowDateStart } = convertUserTimeToMoscow(date, timeStart, user.timeZone);
            const { newTime: moscowTimeEnd } = convertUserTimeToMoscow(date, timeEnd, user.timeZone);

            const timeSlots = this.generateTimeSlots(
                moscowTimeStart,
                moscowTimeEnd,
                normalizeDate(moscowDateStart),
                dayWeek,
                doctor.id
            );

            for (const slot of timeSlots) {
                const existing = await this.timeSlotRepository.findByTimeDate(
                    slot.time,
                    slot.doctorId!,
                    slot.date,
                    "OPEN"
                );
                if (!existing) {
                    await this.timeSlotRepository.save(slot);
                }
            }

            return res.status(201).json({
                success: true,
                message: "Запрос успешно выполнен"
            });
        } catch (e: any) {
            return next(ApiError.internal(e.message));
        }
    }

    async createRecurringGap(req: Request, res: Response, next: NextFunction) {
        try {
            const { timeStart, timeEnd, date, dayWeek, userId } = req.body;

            const user = await this.userRepository.findById(Number(userId));
            if (!user) return next(ApiError.badRequest('Пользователь не найден'));

            const doctor = await this.doctorRepository.findByUserId(user.id);
            if (!doctor) return next(ApiError.badRequest('Специалист не найден'));

            const { newTime: moscowTimeStart, newDate: moscowDateStart } = convertUserTimeToMoscow(date, timeStart, user.timeZone);
            const { newTime: moscowTimeEnd } = convertUserTimeToMoscow(date, timeEnd, user.timeZone);

            const startDate = new Date(moscowDateStart);
            const endDate = addDays(startDate, 61);
            const jsDayWeek = dayWeek === 6 ? 0 : dayWeek + 1;

            for (let currentDate = new Date(startDate); isBefore(currentDate, endDate); currentDate = addDays(currentDate, 1)) {
                if (currentDate.getDay() === jsDayWeek) {
                    const slotDate = normalizeDate(currentDate.toString());

                    const timeSlots = this.generateTimeSlots(
                        moscowTimeStart,
                        moscowTimeEnd,
                        slotDate,
                        dayWeek,
                        doctor.id
                    );

                    for (const slot of timeSlots) {
                        const existing = await this.timeSlotRepository.findByTimeDate(
                            slot.time,
                            slot.doctorId!,
                            slot.date,
                            "OPEN"
                        );
                        if (!existing) {
                            await this.timeSlotRepository.save(slot);
                        }
                    }
                }
            }

            return res.status(201).json({
                success: true,
                message: "Слоты созданы на 2 месяца вперед"
            });
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

            const result = timeSlots
                .map(slot => adjustTimeSlotToTimeZone(slot, linker.timeZone))
                .map(adjustedSlot => ({
                    doctorId: adjustedSlot.doctorId,
                    time: adjustedSlot.time,
                    date: adjustedSlot.date,
                    status: adjustedSlot.status
                }))
                .sort((a, b) => a.time.localeCompare(b.time));

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

            const doctor = await this.doctorRepository.findByUserId(user.id);
            if (!doctor) {
                return next(ApiError.badRequest('Специалист не найден'));
            }

            if (!startDate || !endDate) {
                return next(ApiError.badRequest('Неверный формат даты'));
            }

            const timeSlots = await this.timeSlotRepository.findTimeSlotsBetweenDate(startDate, endDate, doctor.id);
            const results = timeSlots.map(timeSlot => adjustTimeSlotToTimeZone(timeSlot, user.timeZone));

            return res.status(200).json(results);
        } catch (e: any) {
            return next(ApiError.internal(e.message));
        }
    }

    async findSheduleSpecialist(req: Request, res: Response, next: NextFunction) {
        try {
            const {userId} = req.params;

            const user = await this.userRepository.findById(Number(userId));
            if(!user) return ApiError.badRequest('Пользователь не найден');

            const doctors = await this.doctorRepository.findAll();
            if (!doctors || doctors.doctors.length === 0) {
                return next(ApiError.badRequest('Специалисты не найдены'));
            }

            const doctorIds = doctors.doctors.map(doctor => doctor.id);
            const allSlotDoctor = await this.timeSlotRepository.findTimeSlotsForDoctor(doctorIds);

            const doctorWorkload = new Map();
            for (const slot of allSlotDoctor) {
                if (slot.status === "OPEN") {
                    doctorWorkload.set(slot.doctorId, (doctorWorkload.get(slot.doctorId) || 0) + 1);
                }
            }

            const slotsByDateTime = new Map();

            for (const slot of allSlotDoctor) {
                const { newDate,  newTime }  = convertMoscowToUserTime(slot.date, slot.time, user.timeZone);
                const dateTimeKey = `${slot.date}_${slot.time}`;
                const currentWorkload = doctorWorkload.get(slot.doctorId) || 0;

                if (!slotsByDateTime.has(dateTimeKey)) {
                    slotsByDateTime.set(dateTimeKey, {
                        date: newDate,
                        dayWeek: slot.dayWeek,
                        doctorId: slot.doctorId,
                        id: slot.id,
                        status: slot.status,
                        time: newTime,
                        workload: currentWorkload
                    });
                } else {
                    const existingSlot = slotsByDateTime.get(dateTimeKey);
                    if (currentWorkload < existingSlot.workload) {
                        slotsByDateTime.set(dateTimeKey, {
                            date: newDate,
                            dayWeek: slot.dayWeek,
                            doctorId: slot.doctorId,
                            id: slot.id,
                            status: slot.status,
                            time: newTime,
                            workload: currentWorkload
                        });
                    }
                }
            }

            const result = Array.from(slotsByDateTime.values()).map(slot => {
                return {
                    date: slot.date,
                    dayWeek: slot.dayWeek,
                    doctorId: slot.doctorId,
                    id: slot.id,
                    status: slot.status,
                    time: slot.time
                };
            }).sort((a, b) => {
                if (a.date !== b.date) {
                    return a.date.localeCompare(b.date);
                }
                return a.time.localeCompare(b.time);
            });

            return res.json(result);
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
                return next(ApiError.badRequest('Специалист не найден'));
            }

            const user = await this.userRepository.findByDoctorId(doctor.id);
            if (!user) {
                return next(ApiError.badRequest('Пользователь не найден'));
            }

            const timeSlots = await this.timeSlotRepository.findByDoctorDate(doctor.id, normDate);
            const results = timeSlots.map(timeSlot => {
                const adjustedSlot = adjustTimeSlotToTimeZone(timeSlot, user.timeZone);
                return {
                    time: adjustedSlot.time,
                    date: adjustedSlot.date,
                    status: timeSlot.status
                };
            });

            res.status(200).json(results);
        } catch (e: any) {
            return next(ApiError.internal(e.message));
        }
    }

    private generateTimeSlots(
        startTime: string,
        endTime: string,
        date: string,
        dayWeek: number,
        doctorId: number
    ): TimeSlot[] {
        const slots: TimeSlot[] = [];
        const start = parseTime(startTime);
        const end = parseTime(endTime);

        let currentTime = new Date(start);

        while (currentTime <= end) {
            const timeString = formatTime(currentTime);

            slots.push(new TimeSlot(
                0,
                timeString,
                date,
                dayWeek,
                "OPEN",
                doctorId
            ));

            currentTime = new Date(currentTime.getTime() + 60 * 60000);
        }

        return slots;
    }
}
