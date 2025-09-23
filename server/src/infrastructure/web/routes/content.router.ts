import { Router } from "express";
import contentController from "../controllers/Content/content.controller.interface";
import catchAsync from "../middleware/catchAsync.js";

const router = Router();

router.post("/create", catchAsync(contentController.createContent.bind(contentController)));
router.get("/all", catchAsync(contentController.getAllContent.bind(contentController)));

router.get("/:id", catchAsync(contentController.getContentById.bind(contentController)));
router.put("/:id", catchAsync(contentController.updateContent.bind(contentController)));
router.delete("/:id", catchAsync(contentController.deleteContent.bind(contentController)));

export default router;