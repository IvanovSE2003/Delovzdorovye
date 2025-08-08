import { Router } from "express";
const router: Router = Router(); 

import userRouter from './user.routes.js'
import doctorRouter from './doctor.router.js'
import pacientRouter from './patient.routes.js'
import schedulRouter from './doctorsScheduleRoutes.js'

router.use('/user', userRouter);
router.use('/doctor', doctorRouter);
router.use('/patient', pacientRouter);
router.use('/schedule', schedulRouter);

export default router;

