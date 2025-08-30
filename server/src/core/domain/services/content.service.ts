import DataContent from "../../../infrastructure/web/types/dataContent";

export default interface ContentService {
    create(content: DataContent): Promise<DataContent>;
    getById(id: number, hasTitle?: boolean): Promise<DataContent | null>;
    getAll(type?: string): Promise<DataContent[]>;
    update(id: number, content: Partial<DataContent>, hasTitle?: boolean): Promise<DataContent | null>;
    delete(id: number, hasTitle?: boolean): Promise<boolean>;
}
