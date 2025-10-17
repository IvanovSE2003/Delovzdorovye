import { Router, Request, Response, NextFunction } from "express";
import scheduleController from "../controllers/DoctorSchedule/doctorSchedule.controller.interface.js";
import authMiddlewareInstance from "../middleware/authMiddlewareInstance.js";

const router = Router(); 

router.get('/findSchedule', (req: Request, res: Response, next: NextFunction) => scheduleController.findTimeSlotsForSpecialist(req, res, next));

router.get('/getBetweenSchedule', authMiddlewareInstance, (req: Request, res: Response, next: NextFunction) => scheduleController.findTimeSlotsBetweenDate(req, res, next));
router.get('/getForDateDoctor', authMiddlewareInstance, (req: Request, res: Response, next: NextFunction) => scheduleController.getForDateDoctor(req, res, next))
router.post('/createWithRepetitions',authMiddlewareInstance,  (req: Request, res: Response, next: NextFunction) => scheduleController.create(req, res, next));

router.post('/timeSlot/create',authMiddlewareInstance,  (req: Request, res: Response, next: NextFunction) => scheduleController.create(req, res, next));
router.post('/timeSlot/create/recurning',authMiddlewareInstance,  (req: Request, res: Response, next: NextFunction) => scheduleController.createRecurring(req, res, next));
router.delete('/timeSlot/delete/:id',authMiddlewareInstance,  (req: Request, res: Response, next: NextFunction) => scheduleController.delete(req, res, next));

router.post('/timeSlot/create/gap',authMiddlewareInstance,  (req: Request, res: Response, next: NextFunction) => scheduleController.createGap(req, res, next));
router.post('/timeSlot/create/recurning/gap',authMiddlewareInstance,  (req: Request, res: Response, next: NextFunction) => scheduleController.createRecurringGap(req, res, next));
router.get('/findSheduleSpecialist/:userId', authMiddlewareInstance, (req: Request, res: Response, next: NextFunction) => scheduleController.findSheduleSpecialist(req, res, next));

export default router