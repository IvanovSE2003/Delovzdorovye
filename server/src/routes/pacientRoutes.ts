import { Router } from "express";
import PacientController from "../controllers/pacientController.js";

const router: Router = Router(); 

router.get('/get/:id', PacientController.getOne);
router.get('/get', PacientController.getAll);
router.get('/:userId', PacientController.getPatientByUser);
router.put('/:userId', PacientController.updatePatient)

export default router;