import { NextFunction, Response, Request, Router } from "express";
import PatientController from "../controllers/Patient/patient.controller.js";
import authMiddleware from "../middleware/authMidleware.js"
import TokenServiceImpl from "../../../core/application/services/token.service.impl.js";

const tokenService = new TokenServiceImpl(
    process.env.SECRET_KEY_ACCESS!,
    process.env.SECRET_KEY_REFRESH!,
    '15m',
    '24h'
);

const authMiddlewareInstance = authMiddleware(tokenService);

const router: Router = Router(); 

// router.get('/:id', authMiddlewareInstance, (req: Request, res: Response, next: NextFunction) => PatientController.getOne(req, res, next));

export default router;