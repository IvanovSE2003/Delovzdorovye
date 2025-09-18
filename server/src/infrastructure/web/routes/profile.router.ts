import { NextFunction, Response, Request, Router } from "express";
import authMiddlewareInstance from "../middleware/authMiddlewareInstance.js";
import profileController from "../controllers/Profile/profile.controller.interface.js";


const router: Router = Router(); 

router.get('/:id',authMiddlewareInstance,(req: Request, res: Response, next: NextFunction) => profileController.getProfile(req, res, next));

export default router;