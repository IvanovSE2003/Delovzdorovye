import { Router, NextFunction, Request, Response } from "express";
import authMiddlewareInstance from "../middleware/authMiddlewareInstance.js";
import consultationController from "../controllers/Consultation/consultation.controller.interface.js";

const router: Router = Router(); 

router.post('/findDay', (req: Request, res: Response, next: NextFunction) => consultationController.findDateForProblem(req, res, next));
router.post('/findTimeSlot', (req: Request, res: Response, next: NextFunction) => consultationController.findTimeSlotForDateProblem(req, res, next));
router.post('/appointment', (req: Request, res: Response, next: NextFunction) => consultationController.appointment(req, res, next));
router.post('/all', (req: Request, res: Response, next: NextFunction) => consultationController.findAllConsultation(req, res, next));
router.post('/specialist/all', (req: Request, res: Response, next: NextFunction) => consultationController.findSpecialistAll(req, res, next));
router.post('/resheduleConsultation/:id', (req: Request, res: Response, next: NextFunction) => consultationController.resheduleConsultation(req, res, next));
router.post('/cancelConsultation/:id', (req: Request, res: Response, next: NextFunction) => consultationController.cancelConsultation(req, res, next));
router.post('/repeatConsultation/:id', (req: Request, res: Response, next: NextFunction) => consultationController.repeatConsultation(req, res, next))
router.get('/getTimeLeft/:id', (req: Request, res: Response, next: NextFunction) => consultationController.getTimeLeft(req, res, next));

router.post('/specialistForProblems', (req: Request, res: Response, next: NextFunction) => consultationController.findSpecialistForProblem(req, res, next));
router.post('/findSchedule', (req: Request, res: Response, next: NextFunction) => consultationController.findScheduleForSpecialist(req, res, next));
// router.post()

router.get('/problem/all', (req: Request, res: Response, next: NextFunction) => consultationController.findProblmesAll(req, res, next));
router.put('/problem/:id', (req: Request, res: Response, next: NextFunction) => consultationController.updateProblem(req, res, next));
router.delete('/problem/:id', (req: Request, res: Response, next: NextFunction) => consultationController.deleteProblem(req, res, next));
router.post('/problem/create', (req: Request, res: Response, next: NextFunction) => consultationController.createProblem(req, res, next));

export default router;