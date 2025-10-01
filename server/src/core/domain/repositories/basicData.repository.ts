import BasicData from "../entities/basicData.entity";

export default interface BasicDataRepository {
    findById(id: number): Promise<BasicData | null>;
    findAll(page?: number, limit?: number): Promise<{batches: BasicData[], totalCount: number, totalPage: number}>;
    findAllByUserId(userId: number): Promise<BasicData[]>;

    create(basicData: BasicData): Promise<BasicData>;
    update(basicData: BasicData): Promise<BasicData>;
    save(basicData: BasicData): Promise<BasicData>;
    delete(basicDataId: number): Promise<void>;

    createBatchWithChangesUser(userId: number, changes: Array<{field_name: string;  old_value: string | null;  new_value: string;}>): Promise<BasicData[]>;
    getCount(): Promise<number>;
}