import { Router, NextFunction, Request, Response } from "express";
import adminController from "../controllers/Admin/admin.controller.interface.js";
import authMiddlewareInstance from "../middleware/authMiddlewareInstance.js";

const router: Router = Router(); 

router.put('/confirm/:id', (req: Request, res: Response, next: NextFunction) => adminController.confirm(req, res, next));
router.put('/reject/:id', authMiddlewareInstance, (req: Request, res: Response, next: NextFunction) => adminController.reject(req, res, next));

router.get('/get-all-user', (req: Request, res: Response, next: NextFunction) => adminController.getAllUser(req, res, next));

router.get('/basicData/all', (req: Request, res: Response, next: NextFunction) => adminController.getAllBasicData(req, res, next));
router.get('/profData/all', (req: Request, res: Response, next: NextFunction) => adminController.getAllProfData(req, res, next));

router.post('/userConsult/all', (req: Request, res: Response, next: NextFunction) => adminController.getUserConsultation(req, res, next));
router.get('/:id', authMiddlewareInstance, (req: Request, res: Response, next: NextFunction) => adminController.getOne(req, res, next));

router.post('consultation/all', (req: Request, res: Response, next: NextFunction) => adminController.getConsultaions(req, res, next));

export default router;