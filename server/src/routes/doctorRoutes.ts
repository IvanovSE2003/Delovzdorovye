import { Router } from "express";
import DoctorController from "../controllers/doctorController.js";

const router: Router = Router(); 

router.get('/get/:id', DoctorController.getOne);
router.get('/get', DoctorController.getAll);
router.get('/:id', DoctorController.getOne);
router.get('/:userId', DoctorController.getDoctorByUser);
router.post('/create', DoctorController.create);

export default router;