import { Router } from "express";
import adminController from "../controllers/Admin/admin.controller.interface.js";
import authMiddlewareInstance from "../middleware/authMiddlewareInstance.js";
import catchAsync from "../middleware/catchAsync.js";

const router: Router = Router();

router.put('/basicData/confirm/:id',authMiddlewareInstance,  catchAsync(adminController.confirmBasicData.bind(adminController)));
router.put('/basicData/reject/:id', authMiddlewareInstance, catchAsync(adminController.rejectBasicData.bind(adminController)));

router.put('/profData/confirm/:id',authMiddlewareInstance,  catchAsync(adminController.confirmProfData.bind(adminController)));
router.put('/profData/reject/:id',authMiddlewareInstance,  catchAsync(adminController.rejectProfData.bind(adminController)));

router.get('/user/all', authMiddlewareInstance, catchAsync(adminController.getAllUser.bind(adminController)));

router.get('/basicData/all', authMiddlewareInstance, catchAsync(adminController.getAllBasicData.bind(adminController)));
router.get('/profData/all', authMiddlewareInstance, catchAsync(adminController.getAllProfData.bind(adminController)));

router.get('/userConsult/all',authMiddlewareInstance,  catchAsync(adminController.getUserConsultation.bind(adminController)));
router.get('/:id', authMiddlewareInstance, catchAsync(adminController.getOneBasicData.bind(adminController)));

router.get('/consultation/all',authMiddlewareInstance, catchAsync(adminController.getConsultaions.bind(adminController)));

router.get('/count/sidebar',authMiddlewareInstance,  catchAsync(adminController.countAdminData.bind(adminController)));

export default router;
