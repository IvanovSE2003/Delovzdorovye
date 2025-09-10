import { Router } from "express";
const router: Router = Router(); 

import userRouter from './user.routes.js';
import doctorRouter from './doctor.routes.js';
import schedulRouter from './doctorsSchedule.routes.js';
import batchRouter from './admin.routes.js';
import profileRouter from './profile.router.js'
import specializationRouter from './specializations.router.js'
import consultationRouter from './consultation.routes.js'
import contentRouter from './content.router.js'
import notificationRouter from './notification.route.js'
import otherProblemRouter from './otherProblem.router.js'

router.use('/user', userRouter);
router.use('/doctor', doctorRouter);
router.use('/schedule', schedulRouter);
router.use('/admin', batchRouter);
router.use('/profile', profileRouter);
router.use('/specialization', specializationRouter);
router.use('/consultation', consultationRouter);
router.use('/content', contentRouter);
router.use('/notification', notificationRouter);
router.use('/otherProblem', otherProblemRouter);


export default router;

