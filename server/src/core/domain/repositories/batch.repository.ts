import Batch from "../entities/batch.entity.js";

export default interface BatchRepository {
    findById(id: number): Promise<Batch | null>;
    findAll(page: number, limit: number): Promise<{batches: Batch[], totalCount: number, totalPage: number}>;
    create(batch: Batch): Promise<Batch>;
    update(batch: Batch): Promise<Batch>;
    save(batch: Batch): Promise<Batch>;
    createBatchWithChanges(doctorId: number, changes: Array<{field_name: string;  old_value: string | null;  new_value: string;}>): Promise<void>;
    createBatchWithChangesUser(userId: number, changes: Array<{field_name: string;  old_value: string | null;  new_value: string;}>): Promise<void>;
}