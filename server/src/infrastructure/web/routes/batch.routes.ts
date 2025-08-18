import { Router, NextFunction, Request, Response } from "express";
import batchController from "../controllers/Batch/batch.controller.interface.js";

const router: Router = Router(); 

router.put('/confirm/:id', (req: Request, res: Response, next: NextFunction) => batchController.confirm(req, res, next));
router.put('/reject/:id', (req: Request, res: Response, next: NextFunction) => batchController.reject(req, res, next));

router.get('/get-all-user', (req: Request, res: Response, next: NextFunction) => batchController.getAllUser(req, res, next));

router.post('/all', (req: Request, res: Response, next: NextFunction) => batchController.getAll(req, res, next))
router.get('/:id', (req: Request, res: Response, next: NextFunction) => batchController.getOne(req, res, next));

export default router;