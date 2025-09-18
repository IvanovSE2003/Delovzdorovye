import { Router } from "express";
import authMiddlewareInstance from "../middleware/authMiddlewareInstance.js";
import consultationController from "../controllers/Consultation/consultation.controller.interface.js";
import catchAsync from "../middleware/catchAsync.js";

const router: Router = Router(); 

router.get('/all', catchAsync(consultationController.findAll.bind(consultationController)));
router.get('/getTimeLeft/:id', catchAsync(consultationController.getTimeLeft.bind(consultationController)));

router.post('/appointment', catchAsync(consultationController.appointment.bind(consultationController)));
router.post('/resheduleConsultation/:id', catchAsync(consultationController.resheduleConsultation.bind(consultationController)));
router.post('/cancelConsultation/:id', catchAsync(consultationController.cancelConsultation.bind(consultationController)));
router.post('/repeatConsultation/:id', catchAsync(consultationController.repeatConsultation.bind(consultationController)));

router.get('/specialistForProblems', catchAsync(consultationController.findSpecialistForProblem.bind(consultationController)));

router.get('/problem/all', catchAsync(consultationController.findProblmesAll.bind(consultationController)));
router.put('/problem/:id', catchAsync(consultationController.updateProblem.bind(consultationController)));
router.delete('/problem/:id', catchAsync(consultationController.deleteProblem.bind(consultationController)));
router.post('/problem/create', catchAsync(consultationController.createProblem.bind(consultationController)));

router.post('/rating/create/:id', catchAsync(consultationController.sendRatingComment.bind(consultationController)));

export default router;
