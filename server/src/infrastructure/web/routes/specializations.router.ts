import { Router, NextFunction, Request, Response } from "express";
import specializationController from "../controllers/Specializations/specializations.controller.interface.js";
import authMiddlewareInstance from "../middleware/authMiddlewareInstance.js";

const router: Router = Router(); 

router.get('/all', authMiddlewareInstance, (req: Request, res: Response, next: NextFunction) => specializationController.findAll(req, res, next));
router.post('/create',authMiddlewareInstance,  (req: Request, res: Response, next: NextFunction) => specializationController.createSpecialization(req, res, next));
router.put('/:id',authMiddlewareInstance,  (req: Request, res: Response, next: NextFunction) => specializationController.updateSpecialization(req, res, next));
router.delete('/:id',authMiddlewareInstance,  (req: Request, res: Response, next: NextFunction) => specializationController.deleteSpecialization(req, res, next));

export default router;