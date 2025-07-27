import { Router } from "express";
import UserController from "../controllers/userController.js";
import authMiddleware from "../midlewares/authMidleware.js";
const router = Router();
router.post('/registration', UserController.registrations);
router.post('/login', UserController.login);
router.get('/auth', authMiddleware, UserController.check);
export default router;
//# sourceMappingURL=userRoutes.js.map