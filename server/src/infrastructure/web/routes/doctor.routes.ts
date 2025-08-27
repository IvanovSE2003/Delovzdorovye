import { Router, NextFunction, Request, Response } from "express";
import docotrController from "../controllers/Doctor/doctor.controller.interface.js";
import authMiddlewareInstance from "../middleware/authMiddlewareInstance.js";

const router: Router = Router(); 

router.get('/all',(req: Request, res: Response, next: NextFunction) => docotrController.getAllDoctors(req, res, next));
router.get('/:id',authMiddlewareInstance,(req: Request, res: Response, next: NextFunction) => docotrController.getOne(req, res, next));
router.put('/:id', (req: Request, res: Response, next: NextFunction) => docotrController.updateDoctor(req, res, next));
router.get('/timeSlot/:id', (req: Request, res: Response, next: NextFunction) => docotrController.getTimeSlotByDoctorId(req, res, next))

export default router;