import { Router } from "express";
const router: Router = Router(); 

import userRouter from './user.routes.js';
import doctorRouter from './doctor.routes.js';
import pacientRouter from './patient.routes.js';
import schedulRouter from './doctorsSchedule.routes.js';
import batchRouter from './batch.routes.js';
import profileRouter from './profile.router.js'
import specializationRouter from './specializations.router.js'
import consultationRouter from './consultation.routes.js'

router.use('/user', userRouter);
router.use('/doctor', doctorRouter);
router.use('/patient', pacientRouter);
router.use('/schedule', schedulRouter);
router.use('/batch', batchRouter);
router.use('/profile', profileRouter);
router.use('/specialization', specializationRouter);
router.use('/consultation', consultationRouter);

export default router;

