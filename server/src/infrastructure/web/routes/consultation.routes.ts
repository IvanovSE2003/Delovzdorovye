import { Router, NextFunction, Request, Response } from "express";
import authMiddlewareInstance from "../middleware/authMiddlewareInstance.js";
import consultationController from "../controllers/Consultation/consultation.controller.interface.js";

const router: Router = Router(); 

router.post('/findDay', (req: Request, res: Response, next: NextFunction) => consultationController.findDateForProblem(req, res, next));
router.post('/findTimeSlot', (req: Request, res: Response, next: NextFunction) => consultationController.findTimeSlotForDateProblem(req, res, next));
router.post('/appointment', (req: Request, res: Response, next: NextFunction) => consultationController.appointment(req, res, next));
router.get('/problem/all', (req: Request, res: Response, next: NextFunction) => consultationController.findProblmesAll(req, res, next));

export default router;