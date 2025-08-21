import { Router, NextFunction, Request, Response } from "express";
import specializationController from "../controllers/Specializations/specializations.controller.interface.js";

const router: Router = Router(); 

router.get('/all', (req: Request, res: Response, next: NextFunction) => specializationController.findAll(req, res, next));

export default router;