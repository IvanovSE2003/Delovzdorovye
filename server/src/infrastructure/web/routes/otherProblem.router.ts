import { NextFunction, Response, Request, Router } from "express";
import authMiddlewareInstance from "../middleware/authMiddlewareInstance.js";
import otherProblemController from "../controllers/OtherProblem/otherProblem.controller.interface.js";

const router: Router = Router(); 

router.get('/all',authMiddlewareInstance,  (req: Request, res: Response, next: NextFunction) => otherProblemController.findAll(req, res, next));
router.post('/create',authMiddlewareInstance,  (req: Request, res: Response, next: NextFunction) => otherProblemController.create(req, res, next));

router.get('/user/:userId', authMiddlewareInstance, (req: Request, res: Response, next: NextFunction) => otherProblemController.findByUserId(req, res, next))

export default router;