import { Router } from "express";
const router: Router = Router(); 

import userRouter from './user.routes.js'
import doctorRouter from './doctorRoutes.js'
import pacientRouter from './patientRoutes.js'
import schedulRouter from './doctorsScheduleRoutes.js'

router.use('/user', userRouter);
router.use('/doctor', doctorRouter);
router.use('/patient', pacientRouter);
router.use('/schedule', schedulRouter);

export default router;

