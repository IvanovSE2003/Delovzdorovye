import Batch from "../../domain/entities/basicData.entity.js";
import BatchRepository from "../../domain/repositories/basicData.repository.js";
import models from "../../../infrastructure/persostence/models/models.js";
import { BatchModelInterface, IBatchCreationAttributes } from "../../../infrastructure/persostence/models/interfaces/batch.model.js";
const { ModerationBatchModel, UserModel } = models;

export default class BatchRepositoryImpl implements BatchRepository {
    async findById(id: number): Promise<Batch | null> {
        const batchModel = await ModerationBatchModel.findByPk(id);
        return batchModel ? this.mapToDomainBatch(batchModel) : null;
    }

    async findAllByUserId(userId: number): Promise<Batch[]> {
        const batchesModel = await models.ModerationBatchModel.findAll({ where: { userId } });

        const batches: Batch[] = batchesModel.map(batch => this.mapToDomainBatch(batch));

        return batches;
    }

    async findAll(page: number, limit: number): Promise<{ batches: Batch[]; totalCount: number; totalPage: number; }> {
        const offset = (page - 1) * limit;
        const { count, rows } = await ModerationBatchModel.findAndCountAll({
            limit,
            offset,
            include: [{
                model: UserModel,
                attributes: ['name', 'surname', 'patronymic']
            }]
        });

        return {
            batches: rows.map(batch => this.mapToDomainBatch(batch)),
            totalCount: count,
            totalPage: Math.ceil(count / limit)
        };
    }

    async create(batch: Batch): Promise<Batch> {
        const batchModel = await ModerationBatchModel.create(this.mapToPersistence(batch));
        return this.mapToDomainBatch(batchModel);
    }

    async update(batch: Batch): Promise<Batch> {
        const [affectedCount] = await ModerationBatchModel.update(this.mapToPersistence(batch), {
            where: { id: batch.id }
        });

        if (affectedCount === 0) {
            throw new Error("Batch not found");
        }

        const updatedBatch = await ModerationBatchModel.findByPk(batch.id);
        return this.mapToDomainBatch(updatedBatch!);
    }

    async save(batch: Batch): Promise<Batch> {
        return batch.id ? this.update(batch) : this.create(batch);
    }

    async delete(batchId: number): Promise<void> {
        await ModerationBatchModel.destroy({ where: { id: batchId } });
    }

    async createBatchWithChangesUser(userId: number, changes: Array<{
        field_name: string;
        old_value: string | null;
        new_value: string;
    }>): Promise<Batch[]> {
        const transaction = await ModerationBatchModel.sequelize!.transaction();
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

            const createdBatches: Batch[] = [];

            for (const change of filteredChanges) {
                const existingBatch = await ModerationBatchModel.findOne({
                    where: {
                        userId: userId,
                        field_name: change.field_name,
                        status: 'pending'
                    },
                    transaction,
                    include: [UserModel]
                });

                if (existingBatch) {
                    await existingBatch.update({
                        old_value: change.old_value ?? '',
                        new_value: change.new_value
                    }, { transaction });
                    createdBatches.push(this.mapToDomainBatch(existingBatch));
                } else {
                    const newBatch = await ModerationBatchModel.create({
                        userId: userId,
                        status: 'pending',
                        is_urgent: false,
                        field_name: change.field_name,
                        old_value: change.old_value ?? '',
                        new_value: change.new_value,
                        rejection_reason: ''
                    }, { transaction, include: [UserModel] });

                    createdBatches.push(this.mapToDomainBatch(newBatch));
                }
            }

            await transaction.commit();
            return createdBatches;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    private mapToDomainBatch(batchModel: BatchModelInterface): Batch {
        const batch = new Batch(
            batchModel.id,
            batchModel.status,
            batchModel.rejection_reason,
            batchModel.is_urgent,
            batchModel.field_name,
            batchModel.old_value,
            batchModel.new_value,
            batchModel.userId
        );

        if (batchModel.user) {
            batch.userName = batchModel.user.name ?? "";
            batch.userSurname = batchModel.user.surname ?? "";
            batch.userPatronymic = batchModel.user.patronymic ?? "";
        }

        return batch;
    }

    private mapToPersistence(batch: Batch): IBatchCreationAttributes {
        return {
            status: batch.status,
            rejection_reason: batch.rejection_reason || null,
            is_urgent: batch.is_urgent,
            field_name: batch.field_name,
            old_value: batch.old_value || null,
            new_value: batch.new_value,
            userId: batch.userId
        } as IBatchCreationAttributes;
    }
}