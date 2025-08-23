import { Request, Response, NextFunction } from "express";
import ApiError from "../../error/ApiError.js";
import DoctorScheduleRepository from "../../../../core/domain/repositories/doctorSchedule.repository.js";
import UserRepository from "../../../../core/domain/repositories/user.repository.js";
import DoctorRepository from "../../../../core/domain/repositories/doctor.repository.js";
import adjustScheduleToTimeZone from "../../function/adjustScheduleToTimeZone.js"

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
}