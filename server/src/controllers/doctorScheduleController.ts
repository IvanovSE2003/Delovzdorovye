import { NextFunction, Response, Request } from "express";
import models from "../infrastructure/persostence/models/models.js";

const { DoctorsSchedule } = models;

class doctorScheduleController {
    static async getAll(req: Request, res: Response, next: NextFunction) {
        const schedules = DoctorsSchedule.findAll();
        return res.status(200).json(schedules);
    }
}

export default doctorScheduleController;