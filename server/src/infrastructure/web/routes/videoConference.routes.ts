import { Router, Request, Response, NextFunction } from "express";
import videoConferenceController from "../controllers/VideoConference/videoConference.controller.interface";

const router = Router();

router.post("/room/:consultationId", (req: Request<{ consultationId: string }>, res: Response, next: NextFunction) => videoConferenceController.createRoom(req, res, next));

router.get("/room/:consultationId", (req: Request<{ consultationId: string }>, res: Response, next: NextFunction) => videoConferenceController.getRoom(req, res, next));

router.post("/room/:consultationId/start", (req: Request<{ consultationId: string }>, res: Response, next: NextFunction) => videoConferenceController.startRoom(req, res, next));

router.post("/room/:consultationId/end", (req: Request<{ consultationId: string }>, res: Response, next: NextFunction) => videoConferenceController.endRoom(req, res, next));

router.get("/room/:consultationId/participants", (req: Request<{ consultationId: string }>, res: Response, next: NextFunction) => videoConferenceController.getParticipants(req, res, next));

router.get("/consultation/:consultationId/access", (req: Request<{ consultationId: string }>, res: Response, next: NextFunction) => videoConferenceController.checkAccess(req, res, next));

router.get("/users/:consultationId", (req: Request, res: Response, next: NextFunction) => videoConferenceController.getParticipants(req, res, next));

router.post("/room/:consultationId/participants", (req: Request<{ consultationId: string }>, res: Response, next: NextFunction) => videoConferenceController.addParticipant(req, res, next));

router.get("/rooms", (req: Request, res: Response, next: NextFunction) => videoConferenceController.getAllRooms(req, res, next));

router.post("/room/:consultationId/leave", (req: Request<{ consultationId: string }>, res: Response, next: NextFunction) => videoConferenceController.removeParticipant(req, res, next));


export default router;