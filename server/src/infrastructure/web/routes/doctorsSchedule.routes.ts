import { Router, Request, Response, NextFunction } from "express";
import scheduleController from "../controllers/DoctorSchedule/doctorSchedule.controller.interface.js";

const router = Router(); 

router.get('/findSchedule', (req: Request, res: Response, next: NextFunction) => scheduleController.findTimeSlotsForSpecialist(req, res, next));

router.get('/getBetweenSchedule', (req: Request, res: Response, next: NextFunction) => scheduleController.findTimeSlotsBetweenDate(req, res, next));
router.get('/getForDateDoctor', (req: Request, res: Response, next: NextFunction) => scheduleController.getForDateDoctor(req, res, next))
router.post('/createWithRepetitions', (req: Request, res: Response, next: NextFunction) => scheduleController.create(req, res, next));

router.post('/timeSlot/create', (req: Request, res: Response, next: NextFunction) => scheduleController.create(req, res, next));
router.delete('/timeSlot/delete/:id', (req: Request, res: Response, next: NextFunction) => scheduleController.delete(req, res, next))

export default router