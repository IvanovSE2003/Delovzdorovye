import { NextFunction, Response, Request, Router } from "express";
import authMiddlewareInstance from "../middleware/authMiddlewareInstance.js";
import otherProblemController from "../controllers/OtherProblem/otherProblem.controller.interface.js";

const router: Router = Router(); 

router.get('/all', (req: Request, res: Response, next: NextFunction) => otherProblemController.findAll(req, res, next));

export default router;