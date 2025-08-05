import { Router } from "express";
import doctorScheduleController from "../../../controllers/doctorScheduleController.js"

const router: Router = Router(); 

router.get('/getAll', doctorScheduleController.getAll);

export default router;