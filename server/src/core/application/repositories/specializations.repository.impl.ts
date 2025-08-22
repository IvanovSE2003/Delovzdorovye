import Specialization from "../../domain/entities/specialization.entity.js";
import SpecializationReposotory from "../../domain/repositories/specializations.repository.js";
import models from "../../../infrastructure/persostence/models/models.js";
import { ISpecializationCreationAttributes, SpecializationModelInterface } from "../../../infrastructure/persostence/models/interfaces/specializations.model.js";

const { SpecializationModel } = models;

export default class SpecializationsRepositoryImpl implements SpecializationReposotory {
    async findAll(): Promise<{ id: number; name: string }[]> {
        const specializations = await SpecializationModel.findAll();
        return specializations.map((s) => this.mapToDomainSpecializations(s.get() as SpecializationModelInterface));
    }

    async findOrCreate(name: string): Promise<Specialization> {
        const [specModel] = await SpecializationModel.findOrCreate({
            where: { name },
            defaults: { name }
        });
        return this.mapToDomainSpecializations(specModel.get() as SpecializationModelInterface);
    }

    private mapToDomainSpecializations(specializationModel: SpecializationModelInterface) {
        return new Specialization(
            specializationModel.id,
            specializationModel.name
        ) as Specialization;
    }

    private mapToPersistence(specialization: Specialization): ISpecializationCreationAttributes {
        return {
            name: specialization.name
        };
    }
}
