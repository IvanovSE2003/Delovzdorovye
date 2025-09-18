import Content from "../../domain/entities/content.entity";
import ContentRepository from "../../domain/repositories/content.repository";
import models from "../../../infrastructure/persostence/models/models";
import { ContentModelInterface, IContentCreationAttributes } from "../../../infrastructure/persostence/models/interfaces/content.model";
import { Op } from "sequelize";

export default class ContentRepositoryImpl implements ContentRepository {
    async findById(id: number): Promise<Content | null> {
        const content = await models.ContentModel.findByPk(id);
        return content ? this.mapToDomainContent(content) : null
    }

    async findAll(page?: number, limit?: number, filters?: { type?: string }): Promise<{ contents: Content[]; totalCount: number; totalPages: number }> {
        const where: any = {};

        if (filters?.type) {
            where.type = {
                [Op.iLike]: filters.type 
            };
        }

        const totalCount = await models.ContentModel.count({ where });

        let contents;
        let totalPages = 1;

        if (page != null && limit != null) {
            totalPages = Math.ceil(totalCount / limit);

            contents = await models.ContentModel.findAll({
                where,
                limit,
                offset: (page - 1) * limit,
                order: [["id", "ASC"]],
            });
        } else {
            contents = await models.ContentModel.findAll({
                where,
                order: [["id", "ASC"]],
            });
        }

        return {
            contents: contents.map((content) => this.mapToDomainContent(content)),
            totalCount,
            totalPages,
        };
    }

    async create(content: Content): Promise<Content> {
        const createdContent = await models.ContentModel.create(this.mapToPersistence(content));
        return this.mapToDomainContent(createdContent);
    }

    async update(content: Content): Promise<Content> {
        const [affectedCount, affectedRows] = await models.ContentModel.update(this.mapToPersistence(content), { where: { id: content.id }, returning: true });
        if (affectedCount === 0 || !affectedRows || affectedRows.length === 0) {
            throw new Error('Контент не был обновлен');
        }
        const updatedContent = affectedRows[0];
        return this.mapToDomainContent(updatedContent);
    }

    async save(content: Content): Promise<Content> {
        return content.id ? await this.update(content) : await this.create(content);
    }

    async delete(id: number): Promise<void> {
        await models.ContentModel.destroy({ where: { id } });
    }

    private mapToDomainContent(content: ContentModelInterface) {
        return new Content(
            content.id,
            content.type,
            content.text_content,
            content.label
        );
    }

    private mapToPersistence(content: Content): IContentCreationAttributes {
        return {
            type: content.type,
            text_content: content.text_content,
            label: content.label
        };
    }
}