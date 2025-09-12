import { NextFunction, Request, Response } from "express";
import VideoConferenceService from "../../../../core/domain/services/videoConference.service";
import ApiError from "../../error/ApiError";

export default class VideoConferenceController {
    constructor(
        private readonly videoConferenceService: VideoConferenceService
    ) {}

    async createRoom(req: Request, res: Response, next: NextFunction) {
        try {
            const { consultationId } = req.params;
            const { userId, userRole } = req.body;

            const hasAccess = await this.videoConferenceService.validateAccess(Number(userId), Number(consultationId), userRole);

            if (!hasAccess) {
                return next(ApiError.internal("Доступ к консультации запрещен"));
            }

            const roomId = await this.videoConferenceService.startConsultation(Number(consultationId));

            return res.status(201).json({ roomId: roomId, consultationId: Number(consultationId), message: "Комната создана" });
        } catch (e: any) {
            next(ApiError.internal(e.message));
        }
    }

    async getRoom(req: Request, res: Response, next: NextFunction) {
        try {
            const { consultationId } = req.params;
            const { userId, userRole } = req.query;

            const hasAccess = await this.videoConferenceService.validateAccess(Number(userId), Number(consultationId), String(userRole));

            if (!hasAccess) {
                return next(ApiError.internal("Доступ к консультации запрещен"));
            }

            return res.json({ consultationId: Number(consultationId), hasAccess: true, message: "Доступ к консультации подтвержден" });
        } catch (e: any) {
            next(ApiError.internal(e.message));
        }
    }

    async startRoom(req: Request, res: Response, next: NextFunction) {
        try {
            const { consultationId } = req.params;
            const { userId, userRole } = req.body;

            if (userRole !== 'DOCTOR') {
                return next(ApiError.internal("Только доктор может начать консультацию"));
            }

            const hasAccess = await this.videoConferenceService.validateAccess(Number(userId), Number(consultationId), userRole);

            if (!hasAccess) {
                return next(ApiError.internal("Доступ к консультации запрещен"));
            }

            const roomId = await this.videoConferenceService.startConsultation(Number(consultationId));

            return res.json({ roomId, message: "Консультация начата" });
        } catch (e: any) {
            next(ApiError.internal(e.message));
        }
    }

    async endRoom(req: Request, res: Response, next: NextFunction) {
        try {
            const { consultationId } = req.params;
            const { userId, userRole } = req.body;

            if (userRole !== 'DOCTOR') {
                return next(ApiError.internal("Только доктор может завершить консультацию"));
            }

            const hasAccess = await this.videoConferenceService.validateAccess(Number(userId), Number(consultationId), userRole);

            if (!hasAccess) {
                return next(ApiError.internal("Доступ к консультации запрещен"));
            }

            // Здесь нужно добавить метод завершения консультации в сервис

            return res.json({ message: "Завершение консультации (функционал в разработке)" });
        } catch (e: any) {
            next(ApiError.internal(e.message));
        }
    }

    async checkAccess(req: Request, res: Response, next: NextFunction) {
        try {
            const { consultationId } = req.params;
            const { userId, userRole } = req.body;

            const hasAccess = await this.videoConferenceService.validateAccess(Number(userId), Number(consultationId), userRole);

            if (!hasAccess) {
                return next(ApiError.internal("Доступ к консультации запрещен"));
            }

            return res.json({
                hasAccess: true,
                userId: userId,
                userRole: userRole,
                consultationId: Number(consultationId),
                message: "Доступ разрешен"
            });
        } catch (e: any) {
            next(ApiError.internal(e.message));
        }
    }

    async getParticipants(req: Request, res: Response, next: NextFunction) {
        try {
            const consultationId = Number(req.params.consultationId);
            const participants = await this.videoConferenceService.getParticipants(consultationId);

            return res.json({ participants });
        } catch (e: any) {
            next(ApiError.internal(e.message));
        }
    }

}