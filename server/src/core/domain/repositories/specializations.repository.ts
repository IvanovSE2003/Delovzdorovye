import Specialization from "../entities/specialization.entity.js";

export default interface SpecializationRepository {
    findAll(): Promise<Specialization[]>;
    findOrCreate(name: string): Promise<Specialization>;
    findById(id: number) : Promise<Specialization | null>;
    create(specialization: Specialization): Promise<Specialization>;
    update(specialization: Specialization): Promise<Specialization>;
    save(specialization: Specialization): Promise<Specialization>;
    delete(id: number): Promise<void>;
}
