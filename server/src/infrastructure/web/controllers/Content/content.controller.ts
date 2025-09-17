import { NextFunction, Request, Response } from "express";
import Content from "../../../../core/domain/entities/content.entity";
import ApiError from "../../error/ApiError"
import ContentRepository from "../../../../core/domain/repositories/content.repository"

export default class ContentController {
    constructor(
        private readonly contentRepository: ContentRepository
    ) { }

    async createContent(req: Request, res: Response, next: NextFunction) {
        try {
            const { title, content, type, hasTitle } = req.body;

            const newContent = new Content(
                0,
                content,
                type,
                hasTitle ? title : null
            )

            const created = await this.contentRepository.save(newContent);
            return res.status(201).json(created);
        } catch (e: any) {
            next(ApiError.internal(e.message));
        }
    }

    async getContentById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const content = await this.contentRepository.findById(Number(id))

            if (!content) {
                return next(ApiError.badRequest("Контент не найден"));
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
            const { page, limit, type } = req.query;
            const typeFilter = type ? type.toString() : ""
            const contents = await this.contentRepository.findAll(Number(page), Number(limit), {type: typeFilter});

            const results = contents.contents.map(c => ({
                id: c.id,
                header: c.label,
                text: c.text_content
            }));

            return res.json({
                contents: results,
                totalCount: contents.totalCount,
                totalPages: contents.totalPages
            });
        } catch (e: any) {
            next(ApiError.internal(e.message));
        }
    }

    async updateContent(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { title, content, type } = req.body;

            const contentModel = await this.contentRepository.findById(Number(id));
            if(!contentModel) {
                return next(ApiError.badRequest('Контент не найден'));
            }

            if(title && title !== undefined) {
                contentModel.label = title;
            }

            if(content && content !== undefined) {
                contentModel.text_content = content;
            }

            if(type && type !== undefined) {
                contentModel.type = type;
            }

            const updated = await this.contentRepository.save(contentModel);
            return res.status(200).json(updated);
        } catch (e: any) {
            next(ApiError.internal(e.message));
        }
    }

    async deleteContent(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;

            const content = await this.contentRepository.findById(Number(id));
            if(!content) {
                return next(ApiError.badRequest('Контент не найден'));
            }

            await this.contentRepository.delete(content.id);
            return res.status(204).send();
        } catch (e: any) {
            next(ApiError.internal(e.message));
        }
    }
}
