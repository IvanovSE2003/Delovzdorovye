import Specialization from "../entities/specialization.entity.js";

export default interface SpecializationRepository {
    findAll(): Promise<Specialization[]>;
    findOrCreate(name: string): Promise<Specialization>;
}
