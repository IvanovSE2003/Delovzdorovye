import { Router, NextFunction, Request, Response } from "express";
import authMiddlewareInstance from "../middleware/authMiddlewareInstance.js";
import consultationController from "../controllers/Consultation/consultation.controller.interface.js";

const router: Router = Router(); 

router.get('problem/all', (req: Request, res: Response, next: NextFunction) => consultationController.findProblmesAll(req, res, next));

export default router;