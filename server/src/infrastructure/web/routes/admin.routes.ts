import { Router } from "express";
import adminController from "../controllers/Admin/admin.controller.interface.js";
import authMiddlewareInstance from "../middleware/authMiddlewareInstance.js";
import catchAsync from "../middleware/catchAsync.js";

const router: Router = Router();

router.put('/basicData/confirm/:id', catchAsync(adminController.confirmBasicData.bind(adminController)));
router.put('/basicData/reject/:id', authMiddlewareInstance, catchAsync(adminController.rejectBasicData.bind(adminController)));

router.put('/profData/confirm/:id', catchAsync(adminController.confirmProfData.bind(adminController)));
router.put('/profData/reject/:id', catchAsync(adminController.rejectProfData.bind(adminController)));

router.get('/user/all', catchAsync(adminController.getAllUser.bind(adminController)));

router.get('/basicData/all', catchAsync(adminController.getAllBasicData.bind(adminController)));
router.get('/profData/all', catchAsync(adminController.getAllProfData.bind(adminController)));

router.get('/userConsult/all', catchAsync(adminController.getUserConsultation.bind(adminController)));
router.get('/:id', authMiddlewareInstance, catchAsync(adminController.getOneBasicData.bind(adminController)));

router.get('/consultation/all', catchAsync(adminController.getConsultaions.bind(adminController)));

export default router;
