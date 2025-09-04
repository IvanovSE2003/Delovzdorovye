import { Router, Request, Response, NextFunction } from "express";
import scheduleController from "../controllers/DoctorSchedule/doctorSchedule.controller.interface.js";

const router = Router(); 

router.get('/doctor', (req: Request<{userId: string}>, res: Response, next: NextFunction) => scheduleController.getByDoctor(req, res, next));
router.get('/findSchedule', (req: Request<{userId: string}>, res: Response, next: NextFunction) => scheduleController.findScheduleForSpecialist(req, res, next));

router.post('/create', (req: Request<{userId: string}>, res: Response, next: NextFunction) => scheduleController.createSchedule(req, res, next));
router.delete('/delete/:id', (req: Request<{userId: string}>, res: Response, next: NextFunction) => scheduleController.deleteSchedule(req, res, next));
router.post('/timeSlot/create', (req: Request, res: Response, next: NextFunction) => scheduleController.createTimeSlot(req, res, next));
router.delete('/timeSlot/delete/:id', (req: Request<{userId: string}>, res: Response, next: NextFunction) => scheduleController.deleteTimeSlot(req, res, next))

export default router