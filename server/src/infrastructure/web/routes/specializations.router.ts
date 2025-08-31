import { Router, NextFunction, Request, Response } from "express";
import specializationController from "../controllers/Specializations/specializations.controller.interface.js";

const router: Router = Router(); 

router.get('/all', (req: Request, res: Response, next: NextFunction) => specializationController.findAll(req, res, next));
router.post('/create', (req: Request, res: Response, next: NextFunction) => specializationController.createSpecialization(req, res, next));
router.put('/:id', (req: Request, res: Response, next: NextFunction) => specializationController.updateSpecialization(req, res, next));
router.delete('/:id', (req: Request, res: Response, next: NextFunction) => specializationController.deleteSpecialization(req, res, next));

export default router;