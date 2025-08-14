import { Request, Response, NextFunction } from "express";
import ApiError from "../../error/ApiError.js";
import DoctorScheduleRepository from "../../../../core/domain/repositories/doctorSchedule.repository.js";

export default class DoctorScheduleController {
    constructor(
        private readonly doctorScheduleRepository: DoctorScheduleRepository
    ) {}
    
    async getByDoctor(req: Request<{doctorId: string}, any, any, any>, res: Response, next: NextFunction) {
        try {
            const {doctorId} = req.params;
            const schedule = await this.doctorScheduleRepository.findByDoctorId(Number(doctorId));
            
            if(!schedule) {
                next(ApiError.badRequest('Расписание не найдено'));
                return;
            }
            
            res.status(200).json(schedule);
        } catch(e: any) {
            next(ApiError.badRequest(e.message));
        }
    }
}