import { NextFunction, Response, Request, Router } from "express";
import patientController from "../controllers/Patient/patient.controller.interface.js";
import authMiddlewareInstance from "../middleware/authMiddlewareInstance.js";


const router: Router = Router(); 

router.get('/all', authMiddlewareInstance, (req: Request, res: Response, next: NextFunction) => patientController.getAllPatient(req, res, next));
router.get('/:id', authMiddlewareInstance, (req: Request, res: Response, next: NextFunction) => patientController.getOne(req, res, next));

export default router;