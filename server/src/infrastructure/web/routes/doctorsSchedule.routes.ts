import { Router, Request, Response, NextFunction } from "express";
import scheduleController from "../controllers/DoctorSchedule/doctorSchedule.controller.interface.js";

const router = Router(); 

router.get('/:doctorId', (req: Request<{doctorId: string}>, res: Response, next: NextFunction) => {scheduleController.getByDoctor(req, res, next); });

export default router;