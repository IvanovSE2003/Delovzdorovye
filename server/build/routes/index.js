import { Router } from "express";
const router = Router();
import userRouter from './userRoutes.js';
import doctorRouter from './doctorRoutes.js';
router.use('/user', userRouter);
router.use('/doctor', doctorRouter);
export default router;
//# sourceMappingURL=index.js.map