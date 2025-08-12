import { Request, Response, NextFunction, Router } from "express";
import userController from "../controllers/User/user.controller.interface.js";
import {body} from 'express-validator'
import authMiddlewareInstance from "../middleware/authMiddlewareInstance.js";
import adminMiddleware from "../middleware/admin.middleware.js";


const router: Router = Router(); 

router.post('/registration', 
    body('email').isEmail(),
    body('password').isLength({min: 7, max: 50}),
    (req: Request, res: Response, next: NextFunction) => userController.registration(req, res, next));
    
router.post('/login', (req: Request, res: Response, next: NextFunction) => userController.login(req, res, next));
router.post('/logout', (req: Request, res: Response, next: NextFunction) => userController.logout(req, res, next));
router.get('/auth', authMiddlewareInstance, (req: Request, res: Response, next: NextFunction) => userController.check(req, res, next));

router.get('/activate/:link', (req: Request, res: Response, next: NextFunction) => userController.activate(req, res, next));
router.get('/refresh', (req: Request, res: Response, next: NextFunction) => userController.refresh(req, res, next));

router.get('/:id', (req: Request, res: Response, next: NextFunction) => userController.getOne(req, res, next));
router.put('/:id', (req: Request, res: Response, next: NextFunction) => userController.update(req, res, next));
router.delete('/:id', (req: Request, res: Response, next: NextFunction) => userController.delete(req, res, next));

router.post('/check', (req: Request, res: Response, next: NextFunction) => userController.checkUser(req, res, next));
router.post('/checkPinCode', (req: Request, res: Response, next: NextFunction) => userController.checkPinCode(req, res, next));

router.post('/twoFactorSend', (req: Request, res: Response, next: NextFunction) => userController.sendTwoFactor(req, res, next));
router.post('/checkVarifyCode', (req: Request, res: Response, next: NextFunction) => userController.checkVarifyCode(req, res, next));
router.post('/checkVarifyCodeSMS',(req: Request, res: Response, next: NextFunction) => userController.sendLoginNotification(req, res, next));

router.post('/activateLinkTg/:userId', (req: Request, res: Response, next: NextFunction) => userController.linkTelegram(req, res, next));

router.post('/request-pin-reset', body('emailOrPhone').notEmpty(), (req: Request, res: Response, next: NextFunction) => userController.requestPinReset(req, res, next));

router.post('/reset-pin', body('token').notEmpty(), (req: Request, res: Response, next: NextFunction) => userController.resetPin(req, res, next));

router.post('/unblock-account', authMiddlewareInstance, adminMiddleware(), (req: Request, res: Response, next: NextFunction) => userController.unblockAccount(req, res, next))
router.post('/sendActivationEmail',(req: Request, res: Response, next: NextFunction) => userController.sendActivationEmail(req, res, next));

export default router;

