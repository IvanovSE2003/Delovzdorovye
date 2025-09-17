import Content from "../entities/content.entity"

export default interface ContentRepository {
    findById(id: number): Promise<Content | null>;
    findAll(page: number, limit: number, filters: {type: string}): Promise<{contents: Content[], totalCount: number, totalPages: number}>;
    create(content: Content): Promise<Content>;
    save(content: Content): Promise<Content>;
    update(content: Content): Promise<Content>;
    delete(id: number): Promise<void>;
}
