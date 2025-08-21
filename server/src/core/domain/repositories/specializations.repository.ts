import Specialization from "../entities/specialization.entity.js";

export default interface SpecializationReposotory {
    findAll(): Promise<Specialization[]>;
}
