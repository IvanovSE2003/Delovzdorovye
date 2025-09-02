import Batch from "../entities/batch.entity.js";
import ProfData from "../entities/profData.entity.js";

export default interface BatchRepository {
    findById(id: number): Promise<Batch | null>;
    findAll(page: number, limit: number): Promise<{batches: Batch[], totalCount: number, totalPage: number}>;
    findAllByUserId(userId: number): Promise<Batch[]>;
    findAllProfData(page: number, limit: number, filters: any): Promise<{ profData: ProfData[]; totalCount: number; totalPages: number }>
    create(batch: Batch): Promise<Batch>;
    createBasicData(profData: ProfData): Promise<ProfData>;
    update(batch: Batch): Promise<Batch>;
    save(batch: Batch): Promise<Batch>;
    delete(batchId: number): Promise<void>;
    createBatchWithChangesUser(userId: number, changes: Array<{field_name: string;  old_value: string | null;  new_value: string;}>): Promise<Batch[]>;
}