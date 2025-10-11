import { NextFunction, Response, Request, Router } from "express";
import authMiddlewareInstance from "../middleware/authMiddlewareInstance.js";
import notificationContorller from "../controllers/Notification/notification.contorller.interface.js";

const router: Router = Router(); 

router.get('/all', authMiddlewareInstance, (req: Request, res: Response, next: NextFunction) => notificationContorller.findAll(req, res, next));
router.get('/user',authMiddlewareInstance,  (req: Request, res: Response, next: NextFunction) => notificationContorller.getUserId(req, res, next));

router.put('/read', authMiddlewareInstance, (req: Request, res: Response, next: NextFunction) => notificationContorller.readNotification(req, res, next));
router.put('/read/all/:userId',authMiddlewareInstance,  (req: Request, res: Response, next: NextFunction) => notificationContorller.readAllNotification(req, res, next))
router.get('/count/:userId',authMiddlewareInstance,  (req: Request, res: Response, next: NextFunction) => notificationContorller.getCountNotification(req, res, next));

router.delete("/delete/:id",authMiddlewareInstance,  (req: Request, res: Response, next: NextFunction) => notificationContorller.delete(req, res, next));
router.delete("/delete/all/:userId",authMiddlewareInstance,  (req: Request, res: Response, next: NextFunction) => notificationContorller.deleteAllNotification(req, res, next));

export default router;