import { NextFunction, Response, Request, Router } from "express";
import authMiddlewareInstance from "../middleware/authMiddlewareInstance.js";
import notificationContorller from "../controllers/Notification/notification.contorller.interface.js";

const router: Router = Router(); 

router.get('/all', (req: Request, res: Response, next: NextFunction) => notificationContorller.getAll(req, res, next));
router.get('/user', (req: Request, res: Response, next: NextFunction) => notificationContorller.getUserId(req, res, next))

export default router;