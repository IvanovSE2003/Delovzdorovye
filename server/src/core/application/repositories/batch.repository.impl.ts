import Batch from "../../domain/entities/batch.entity.js";
import BatchRepository from "../../domain/repositories/batch.repository.js";
import models from "../../../infrastructure/persostence/models/models.js";
import { BatchModelInterface, IBatchCreationAttributes } from "../../../infrastructure/persostence/models/interfaces/batch.model.js";

const { ModerationBatchModel } = models;

export default class BatchRepositoryImpl implements BatchRepository {
    async findById(id: number): Promise<Batch | null> {
        throw "";
    }

    async findAll(page: number, limit: number): Promise<{ batches: Batch[]; totalCount: number; totalPage: number; }> {
        throw "";
    }

    async create(batch: Batch): Promise<Batch> {
        throw "";
    }

    async update(batch: Batch): Promise<Batch> {
        throw "";
    }

    async save(batch: Batch): Promise<Batch> {
        return batch.id ? this.update(batch) : this.create(batch);
    }

    private mapToDomainUser(batchModel: BatchModelInterface): Batch {
        return new Batch(
            batchModel.id,
            batchModel.status,
            batchModel.rejection_reason,
            batchModel.is_urgent,
            batchModel.field_name,
            batchModel.old_value,
            batchModel.new_value
        );
    }

    private mapToPersistence(batch: Batch): IBatchCreationAttributes {
        return {
            status: batch.status,
            rejection_reason: batch.rejection_reason,
            is_urgent: batch.is_urgent,
            field_name: batch.field_name,
            old_value: batch.old_value,
            new_value: batch.new_value
        };
    }
}