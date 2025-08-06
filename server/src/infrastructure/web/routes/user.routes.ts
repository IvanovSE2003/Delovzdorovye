import { Request, Response, NextFunction, Router } from "express";
import userController from "../controllers/User/user.controller.interface.js";
import authMiddleware from "../middleware/authMidleware.js"
import {body} from 'express-validator'

const router: Router = Router(); 

router.post('/registration', 
    body('email').isEmail(),
    body('password').isLength({min: 7, max: 50}),
    (req: Request, res: Response, next: NextFunction) => userController.registration(req, res, next));
router.post('/login', (req: Request, res: Response, next: NextFunction) => userController.login(req, res, next));
router.post('/logout', (req: Request, res: Response, next: NextFunction) => userController.logout(req, res, next));
router.get('/auth', authMiddleware, (req: Request, res: Response, next: NextFunction) => userController.check(req, res, next));

router.get('/activate/:link', (req: Request, res: Response, next: NextFunction) => userController.activate(req, res, next));
router.get('/refresh', (req: Request, res: Response, next: NextFunction) => userController.refresh(req, res, next));

router.get('/:id', (req: Request, res: Response, next: NextFunction) => userController.getOne(req, res, next));

router.post('/check', (req: Request, res: Response, next: NextFunction) => userController.check(req, res, next));
router.post('/checkPinCode', (req: Request, res: Response, next: NextFunction) => userController.checkPinCode(req, res, next));

router.post('/twoFactorSend', (req: Request, res: Response, next: NextFunction) => userController.sendTwoFactor(req, res, next));
router.post('/checkVarifyCode', (req: Request, res: Response, next: NextFunction) => userController.checkVarifyCode(req, res, next))

export default router;

