import { Router } from "express";
import PatientController from "../controllers/patientController.js";

const router: Router = Router(); 

router.get('/get/:id', PatientController.getOne);
router.get('/get', PatientController.getAll);
router.get('/:userId', PatientController.getPatientByUser);
router.post('/create', PatientController.create);

export default router;