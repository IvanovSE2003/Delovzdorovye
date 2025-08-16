import { Router, NextFunction, Request, Response } from "express";
import batchController from "../controllers/Batch/batch.controller.interface.js";

const router: Router = Router(); 

router.post('/all', (req: Request, res: Response, next: NextFunction) => batchController.getAll(req, res, next))
router.get('/:id', (req: Request, res: Response, next: NextFunction) => batchController.getOne(req, res, next));

export default router;