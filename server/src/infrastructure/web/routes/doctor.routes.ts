import { Router, NextFunction, Request, Response } from "express";
import docotrController from "../controllers/Doctor/doctor.controller.interface.js";
import authMiddlewareInstance from "../middleware/authMiddlewareInstance.js";

const router: Router = Router(); 

router.get('/all', authMiddlewareInstance, (req: Request, res: Response, next: NextFunction) => docotrController.getAllDoctors(req, res, next));

export default router;