import ProfData from "../entities/profData.entity";

export default interface ProfDataRepository {
    findAll(page: number, limit: number, filters: any): Promise<{ profData: ProfData[]; totalCount: number; totalPages: number }>;
    findById(id: number): Promise<ProfData | null>;
    create(profData: ProfData): Promise<ProfData>;
    update(profData: ProfData): Promise<ProfData>;
    save(ProfData: ProfData): Promise<ProfData>;
    delete(id: number): Promise<void>;
}