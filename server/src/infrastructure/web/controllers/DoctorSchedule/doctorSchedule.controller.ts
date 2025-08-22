import { Request, Response, NextFunction } from "express";
import ApiError from "../../error/ApiError.js";
import DoctorScheduleRepository from "../../../../core/domain/repositories/doctorSchedule.repository.js";
import UserRepository from "../../../../core/domain/repositories/user.repository.js";

export default class DoctorScheduleController {
    constructor(
        private readonly doctorScheduleRepository: DoctorScheduleRepository,
        private readonly userRepository: UserRepository
    ) {}
    
    async getByDoctor(req: Request<{doctorId: string}, any, any, any>, res: Response, next: NextFunction) {
        try {
            const { doctorId } = req.params;
            const { userId } = req.body;

            const user = await this.userRepository.findById(Number(userId));

            if(!user) {
                return next(ApiError.badRequest('Пользовалель не найден'));
            }

            const schedule = await this.doctorScheduleRepository.findByDoctorId(Number(doctorId));
            
            if(!schedule) {
                return next(ApiError.badRequest('Расписание не найдено'));
            }

            // относительно базы знаний по временным поясам сделать расчет времени для пользователя, который получает данное расписание
            
            return res.status(200).json(schedule);
        } catch(e: any) {
            return next(ApiError.internal(e.message));
        }
    }
}