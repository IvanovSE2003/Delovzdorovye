import models from '../../../infrastructure/persostence/models/models.js';
import DataContent from '../../../infrastructure/web/types/dataContent.js';
import ContentService from '../../domain/services/content.service.js';

export default class ContentServiceImpl implements ContentService {
    async create(content: DataContent): Promise<DataContent> {
        if (content.hasTitle) {
            const created = await models.ContentWithTitleModel.create({
                label: content.label,
                text_content: content.text_content,
                type: content.type,
            });
            return created.get();
        } else {
            const created = await models.ContentModel.create({
                text_content: content.text_content,
                type: content.type,
            });
            return created.get();
        }
    }

    async getById(id: number, hasTitle: boolean = false): Promise<DataContent | null> {
        const model = hasTitle ? models.ContentWithTitleModel : models.ContentModel;
        const found = await model.findByPk(id);
        return found ? found.get() : null;
    }

    async getAll(type?: string): Promise<DataContent[]> {
        const simple = await models.ContentModel.findAll(type ? { where: { type } } : {});
        const withTitle = await models.ContentWithTitleModel.findAll(type ? { where: { type } } : {});
        return [...simple.map(s => s.get()), ...withTitle.map(w => w.get())];
    }

    async update(id: number, content: Partial<DataContent>, hasTitle: boolean = false): Promise<DataContent | null> {
        const model = hasTitle ? models.ContentWithTitleModel : models.ContentModel;
        const record = await model.findByPk(id);
        if (!record) return null;
        await record.update(content);
        return record.get();
    }

    async delete(id: number, hasTitle: boolean = false): Promise<boolean> {
        const model = hasTitle ? models.ContentWithTitleModel : models.ContentModel;
        const deleted = await model.destroy({ where: { id } });
        return !!deleted;
    }
}
