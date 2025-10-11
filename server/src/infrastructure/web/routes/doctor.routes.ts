import { Router} from "express";
import docotrController from "../controllers/Doctor/doctor.controller.interface.js";
import authMiddlewareInstance from "../middleware/authMiddlewareInstance.js";
import catchAsync from "../middleware/catchAsync.js";

const router: Router = Router(); 

router.get('/all', authMiddlewareInstance, catchAsync(docotrController.getAllDoctors.bind(docotrController)));
router.get('/:id', authMiddlewareInstance, catchAsync(docotrController.findOne.bind(docotrController)));
router.put('/:id', authMiddlewareInstance, catchAsync(docotrController.updateDoctor.bind(docotrController)));

router.post('/break/create/:userId', catchAsync(docotrController.TakeBreak.bind(docotrController)));

export default router;