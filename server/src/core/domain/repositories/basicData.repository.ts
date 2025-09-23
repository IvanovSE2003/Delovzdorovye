import BasicData from "../entities/basicData.entity";

export default interface BasicDataRepository {
    findById(id: number): Promise<BasicData | null>;
    findAll(page?: number, limit?: number): Promise<{batches: BasicData[], totalCount: number, totalPage: number}>;
    findAllByUserId(userId: number): Promise<BasicData[]>;
    create(batch: BasicData): Promise<BasicData>;
    update(batch: BasicData): Promise<BasicData>;
    save(batch: BasicData): Promise<BasicData>;
    delete(batchId: number): Promise<void>;
    createBatchWithChangesUser(userId: number, changes: Array<{field_name: string;  old_value: string | null;  new_value: string;}>): Promise<BasicData[]>;
}