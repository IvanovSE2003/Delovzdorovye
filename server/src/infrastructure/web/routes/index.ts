import { Router } from "express";
const router: Router = Router(); 

import userRouter from './user.routes.js'
import doctorRouter from './doctor.routes.js'
import pacientRouter from './patient.routes.js'
import schedulRouter from './doctorsSchedule.routes.js'
import batchRouter from './batch.routes.js'

router.use('/user', userRouter);
router.use('/doctor', doctorRouter);
router.use('/patient', pacientRouter);
router.use('/schedule', schedulRouter);
router.use('/batch', batchRouter);

export default router;

