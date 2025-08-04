import { Router } from "express";
import UserController from "../controllers/userController.js";
import authMiddleware from "../midlewares/authMidleware.js";
import {body} from 'express-validator'

const router: Router = Router(); 

router.post('/registration', 
    body('email').isEmail(),
    body('password').isLength({min: 7, max: 50}),
    UserController.registrations);
router.post('/login', UserController.login);
router.post('/logout', UserController.logout);
router.get('/auth', authMiddleware, UserController.check);
router.get('/activate/:link', UserController.activate);
router.get('/refresh', UserController.refresh);
router.get('/:id', UserController.getUser);
router.put('/:id', UserController.updateUser);
router.post('/check', UserController.checkUser);
router.post('/checkPinCode', UserController.verifyPinCode);

router.post('/request-password-reset', UserController.requestPasswordReset);
router.post('/reset-password/:token', UserController.resetPassword);

export default router;

