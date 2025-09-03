import { NextFunction, Request, Response } from "express";
import ContentService from "../../../../core/domain/services/content.service";
import DataContent from "../../types/dataContent";
import ApiError from "../../error/ApiError"

export default class ContentController {
    constructor(
        private readonly contentService: ContentService
    ) { }

    async createContent(req: Request, res: Response, next: NextFunction) {
        try {
            const { title, content, type, hasTitle } = req.body;

            const newContent: DataContent = {
                text_content: content,
                type,
                hasTitle: !!hasTitle,
                label: hasTitle ? title : undefined
            };

            const created = await this.contentService.create(newContent);
            return res.status(201).json(created);

        } catch (e: any) {
            next(ApiError.internal(e.message));
        }
    }

    async getContentById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { hasTitle } = req.query;

            const content = await this.contentService.getById(
                Number(id),
                hasTitle === "true"
            );

            if (!content) {
                return res.status(404).json({ message: "Контент не найден" });
            }

            return res.json({
                header: content.label,
                text: content.text_content,
                type: content.type
            });
        } catch (e: any) {
            next(ApiError.internal(e.message));
        }
    }

    async getAllContent(req: Request, res: Response, next: NextFunction) {
        try {
            const { type } = req.query;
            const contents = await this.contentService.getAll(type ? String(type) : undefined);

            const results = contents.map(c => ({
                header: c.label,
                text: c.text_content
            }));

            return res.json(results);
        } catch (e: any) {
            next(ApiError.internal(e.message));
        }
    }

    async updateContent(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { title, content, type, hasTitle } = req.body;

            const updated = await this.contentService.update(
                Number(id),
                {
                    text_content: content,
                    type,
                    label: hasTitle ? title : undefined
                },
                !!hasTitle
            );

            if (!updated) {
                return res.status(404).json({ message: "Контент для обновления не найден" });
            }

            return res.json(updated);
        } catch (e: any) {
            next(ApiError.internal(e.message));
        }
    }

    async deleteContent(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { hasTitle } = req.query;

            const deleted = await this.contentService.delete(Number(id), hasTitle === "true");

            if (!deleted) {
                return res.status(404).json({ message: "Контент не найден" });
            }

            return res.status(204).send();
        } catch (e: any) {
            next(ApiError.internal(e.message));
        }
    }
}
