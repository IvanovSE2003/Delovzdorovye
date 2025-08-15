import Batch from "../entities/batch.entity.js";

export default interface BatchRepository {
    findById(id: number): Promise<Batch | null>;
    findAll(page: number, limit: number): Promise<{batches: Batch[], totalCount: number, totalPage: number}>;
    create(batch: Batch): Promise<Batch>;
    update(batch: Batch): Promise<Batch>;
    save(batch: Batch): Promise<Batch>;
}