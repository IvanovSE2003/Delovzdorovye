import BasicData from "../../domain/entities/basicData.entity.js";
import BatchRepository from "../../domain/repositories/basicData.repository.js";
import models from "../../../infrastructure/persostence/models/models.js";
import { BatchModelInterface, IBatchCreationAttributes } from "../../../infrastructure/persostence/models/interfaces/batch.model.js";
import { broadcastNotificationCount } from "../../../infrastructure/web/function/countDataAll.js";

export default class BatchRepositoryImpl implements BatchRepository {
    async findById(id: number): Promise<BasicData | null> {
        const basicDataModel = await models.BasicDataModel.findByPk(id);
        return basicDataModel ? this.mapToDomainBasicData(basicDataModel) : null;
    }

    async findAllByUserId(userId: number): Promise<BasicData[]> {
        const basicDataModel = await models.BasicDataModel.findAll({ where: { userId } });
        return basicDataModel.map(data => this.mapToDomainBasicData(data));
    }

    async findAll(page?: number, limit?: number): Promise<{ batches: BasicData[]; totalCount: number; totalPage: number; }> {
        const options: any = {
            include: [{
                model: models.UserModel,
                attributes: ['name', 'surname', 'patronymic']
            }]
        };

        if (page && limit) {
            options.limit = limit;
            options.offset = (page - 1) * limit;
        }

        const result = await models.BasicDataModel.findAndCountAll(options);

        return {
            batches: result.rows.map(batch => this.mapToDomainBasicData(batch)),
            totalCount: result.count,
            totalPage: limit ? Math.ceil(result.count / limit) : 1
        };
    }

    async create(basicData: BasicData): Promise<BasicData> {
        const basicDataModel = await models.BasicDataModel.create(this.mapToPersistence(basicData));

        const countProf = await models.ProfDataModel.count();
        const countBasic = await this.getCount();
        await broadcastNotificationCount(countProf + countBasic, "changes_count");

        return this.mapToDomainBasicData(basicDataModel);
    }

    async update(basicData: BasicData): Promise<BasicData> {
        const [affectedCount] = await models.BasicDataModel.update(this.mapToPersistence(basicData), {
            where: { id: basicData.id }
        });

        if (affectedCount === 0) {
            throw new Error("Изменение базовых данных не найдено");
        }

        const updatedBasicData = await models.BasicDataModel.findByPk(basicData.id);
        return this.mapToDomainBasicData(updatedBasicData!);
    }

    async save(basicData: BasicData): Promise<BasicData> {
        const existingData = await models.BasicDataModel.findOne({
            where: {
                userId: basicData.userId,
                field_name: basicData.field_name
            }
        });

        if (existingData) {
            basicData.id = existingData.id; 
            return this.update(basicData);
        } else {
            return this.create(basicData);
        }
    }
    async delete(id: number): Promise<void> {
        const deleteCount = await models.BasicDataModel.destroy({ where: { id } });
        if (deleteCount !== 0) {
            const countProf = await models.ProfDataModel.count();
            const countBasic = await this.getCount();
            await broadcastNotificationCount(countProf + countBasic, "changes_count");
        }
    }

    async createBatchWithChangesUser(userId: number, changes: Array<{
        field_name: string;
        old_value: string | null;
        new_value: string;
    }>): Promise<BasicData[]> {
        const transaction = await models.BasicDataModel.sequelize!.transaction();
        try {
            const filteredChanges = changes.filter(change => {
                const oldVal = change.old_value?.trim() ?? '';
                const newVal = change.new_value?.trim() ?? '';
                return oldVal !== newVal;
            });

            if (filteredChanges.length === 0) {
                await transaction.rollback();
                return [];
            }

            const createdBasicDatas: BasicData[] = [];

            for (const change of filteredChanges) {
                const existingBatch = await models.BasicDataModel.findOne({
                    where: {
                        userId: userId,
                        field_name: change.field_name,
                        status: 'pending'
                    },
                    transaction,
                    include: [models.UserModel]
                });

                if (existingBatch) {
                    await existingBatch.update({
                        old_value: change.old_value ?? '',
                        new_value: change.new_value
                    }, { transaction });
                    createdBasicDatas.push(this.mapToDomainBasicData(existingBatch));
                } else {
                    const newBatch = await models.BasicDataModel.create({
                        userId: userId,
                        status: 'pending',
                        is_urgent: false,
                        field_name: change.field_name,
                        old_value: change.old_value ?? '',
                        new_value: change.new_value,
                        rejection_reason: ''
                    }, { transaction, include: [models.UserModel] });

                    createdBasicDatas.push(this.mapToDomainBasicData(newBatch));
                }
            }

            await transaction.commit();

            const countProf = await models.ProfDataModel.count();
            const countBasic = await this.getCount();
            await broadcastNotificationCount(countProf + countBasic, "changes_count")

            return createdBasicDatas;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async getCount(): Promise<number> {
        const count = await models.BasicDataModel.count();
        return count;
    }

    private mapToDomainBasicData(basicDataModel: BatchModelInterface): BasicData {
        const basicData = new BasicData(
            basicDataModel.id,
            basicDataModel.status,
            basicDataModel.rejection_reason,
            basicDataModel.is_urgent,
            basicDataModel.field_name,
            basicDataModel.old_value,
            basicDataModel.new_value,
            basicDataModel.userId
        );

        if (basicDataModel.user) {
            basicData.userName = basicDataModel.user.name ?? "";
            basicData.userSurname = basicDataModel.user.surname ?? "";
            basicData.userPatronymic = basicDataModel.user.patronymic ?? "";
        }

        return basicData;
    }

    private mapToPersistence(basicData: BasicData): IBatchCreationAttributes {
        return {
            status: basicData.status,
            rejection_reason: basicData.rejection_reason || null,
            is_urgent: basicData.is_urgent,
            field_name: basicData.field_name,
            old_value: basicData.old_value || null,
            new_value: basicData.new_value,
            userId: basicData.userId
        } as IBatchCreationAttributes;
    }
}