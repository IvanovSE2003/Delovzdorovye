import { Router } from "express";
const router: Router = Router(); 

import userRouter from './userRoutes.js'
import doctorRouter from './doctorRoutes.js'
import pacientRouter from './pacientRoutes.js'
import schedulRouter from './doctorsScheduleRoutes.js'

router.use('/user', userRouter);
router.use('/doctor', doctorRouter);
router.use('/pacient', pacientRouter);
router.use('/schedule', schedulRouter);

export default router;

