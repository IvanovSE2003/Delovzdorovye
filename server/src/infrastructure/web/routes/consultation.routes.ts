import { Router } from "express";
import authMiddlewareInstance from "../middleware/authMiddlewareInstance.js";
import consultationController from "../controllers/Consultation/consultation.controller.interface.js";
import catchAsync from "../middleware/catchAsync.js";

const router: Router = Router(); 

router.get('/all',authMiddlewareInstance, catchAsync(consultationController.findAll.bind(consultationController)));
router.get('/getTimeLeft/:id',authMiddlewareInstance, catchAsync(consultationController.getTimeLeft.bind(consultationController)));

router.post('/appointment',authMiddlewareInstance, catchAsync(consultationController.appointment.bind(consultationController)));
router.post('/resheduleConsultation/:id',authMiddlewareInstance, catchAsync(consultationController.resheduleConsultation.bind(consultationController)));
router.post('/cancelConsultation/:id',authMiddlewareInstance, catchAsync(consultationController.cancelConsultation.bind(consultationController)));
router.post('/repeatConsultation/:id',authMiddlewareInstance, catchAsync(consultationController.repeatConsultation.bind(consultationController)));
router.put('/update/:id',authMiddlewareInstance, catchAsync(consultationController.updateConsulation.bind(consultationController)))

router.get('/specialistForProblems',authMiddlewareInstance, catchAsync(consultationController.findSpecialistForProblem.bind(consultationController)));

router.get('/problem/all', catchAsync(consultationController.findProblmesAll.bind(consultationController)));
router.put('/problem/:id',authMiddlewareInstance, catchAsync(consultationController.updateProblem.bind(consultationController)));
router.delete('/problem/:id',authMiddlewareInstance, catchAsync(consultationController.deleteProblem.bind(consultationController)));
router.post('/problem/create',authMiddlewareInstance, catchAsync(consultationController.createProblem.bind(consultationController)));

router.post('/rating/create/:id',authMiddlewareInstance, catchAsync(consultationController.sendRatingComment.bind(consultationController)));

export default router;
