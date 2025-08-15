import Batch from "../../domain/entities/batch.entity.js";
import BatchRepository from "../../domain/repositories/batch.repository.js";

export default class BatchRepositoryImpl implements BatchRepository {
    findById(id: number): Promise<Batch | null> {
        throw "";
    }

    findAll(page: number, limit: number): Promise<{ batches: Batch[]; totalCount: number; totalPage: number; }> {
        throw "";
    }

    create(batch: Batch): Promise<Batch> {
        throw "";
    }

    update(batch: Batch): Promise<Batch> {
        throw "";
    }
}