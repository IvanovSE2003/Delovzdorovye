import { Router, Request, Response, NextFunction } from "express";
import contentController from "../controllers/Content/content.controller.interface";

const router = Router();

router.post("/create", (req: Request, res: Response, next: NextFunction) => contentController.createContent(req, res, next));
router.get("/all", (req: Request, res: Response, next: NextFunction) => contentController.getAllContent(req, res, next));

router.get("/:id", (req: Request<{ id: string }>, res: Response, next: NextFunction) => contentController.getContentById(req, res, next));
router.put("/:id", (req: Request<{ id: string }>, res: Response, next: NextFunction) => contentController.updateContent(req, res, next));
router.delete("/:id", (req: Request<{ id: string }>, res: Response, next: NextFunction) => contentController.deleteContent(req, res, next));

export default router;
