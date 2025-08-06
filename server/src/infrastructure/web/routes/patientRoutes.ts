import { Router } from "express";
import PacientController from "../../../controllers/pacientController.js"

const router: Router = Router(); 

router.get('/:id', PacientController.getOne);
// router.get('/patients', PacientController.getAll);
// router.get('/:userId', PacientController.getPatientByUser);
// router.put('/:id', PacientController.updatePatient)

export default router;