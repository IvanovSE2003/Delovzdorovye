import { Router } from "express";
import userController from "../controllers/User/user.controller.interface.js";
import {body} from 'express-validator'
import authMiddlewareInstance from "../middleware/authMiddlewareInstance.js";
import adminMiddleware from "../middleware/admin.middleware.js";
import catchAsync from "../middleware/catchAsync.js";

const router: Router = Router(); 

router.post('/upload-avatar', authMiddlewareInstance, catchAsync(userController.uploadAvatar.bind(userController)));
router.post('/delete-avatar', authMiddlewareInstance, catchAsync(userController.deleteAvatar.bind(userController)));

router.post('/registration', body('email').isEmail(), catchAsync(userController.registration.bind(userController)));
router.post('/complete/registration', catchAsync(userController.completeRegistration.bind(userController)));

router.post('/login', catchAsync(userController.login.bind(userController)));
router.post('/complete/login', catchAsync(userController.completeLogin.bind(userController)));

router.post('/logout', catchAsync(userController.logout.bind(userController)));
router.get('/auth', authMiddlewareInstance, catchAsync(userController.check.bind(userController)));

router.get('/refresh', catchAsync(userController.refresh.bind(userController)));

router.post('/check', catchAsync(userController.checkUser.bind(userController)));
router.post('/twoFactorSend', catchAsync(userController.sendTwoFactor.bind(userController)));
router.post('/checkVarifyCodeSMS', catchAsync(userController.sendLoginNotification.bind(userController)));

router.get('/activate', authMiddlewareInstance, catchAsync(userController.activate.bind(userController)));
router.post('/sendChangeEmail', authMiddlewareInstance, catchAsync(userController.sendActivationEmail.bind(userController)));

router.post('/activateLinkTg/:userId', authMiddlewareInstance, catchAsync(userController.linkTelegram.bind(userController)));

router.post('/request-pin-reset', authMiddlewareInstance, catchAsync(userController.requestPinReset.bind(userController)));
router.post('/reset-pin', authMiddlewareInstance, body('token').notEmpty(), catchAsync(userController.resetPin.bind(userController)));
router.post('/role/update', authMiddlewareInstance, catchAsync(userController.changeRole.bind(userController)));

router.post('/block-account', authMiddlewareInstance, adminMiddleware(), catchAsync(userController.blockAccount.bind(userController)));
router.post('/unblock-account', authMiddlewareInstance, adminMiddleware(), catchAsync(userController.unblockAccount.bind(userController)));

router.get('/getRecomendation', catchAsync(userController.getRecomendation.bind(userController)));

router.get('/:id',authMiddlewareInstance, catchAsync(userController.getOne.bind(userController)));
router.put('/:id',authMiddlewareInstance, catchAsync(userController.update.bind(userController)));
router.delete('/:id',authMiddlewareInstance, catchAsync(userController.delete.bind(userController)));

export default router;