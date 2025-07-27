import { Router } from "express";
const router: Router = Router(); 

import userRouter from './userRoutes.js'
import doctorRouter from './doctorRoutes.js'

router.use('/user', userRouter);
router.use('/doctor', doctorRouter);

export default router;

