import Specialization from "../../domain/entities/specialization.entity.js";
import SpecializationReposotory from "../../domain/repositories/specializations.repository.js";
import models from "../../../infrastructure/persostence/models/models.js";
import { ISpecializationCreationAttributes, SpecializationModelInterface } from "../../../infrastructure/persostence/models/interfaces/specializations.model.js";


export default class SpecializationsRepositoryImpl implements SpecializationReposotory {
    async findAll(): Promise<Specialization[]> {
        const specializations = await models.SpecializationModel.findAll();
        return specializations.map((s) => this.mapToDomainSpecializations(s.get() as SpecializationModelInterface));
    }

    async findOrCreate(name: string): Promise<Specialization> {
        const [specModel] = await models.SpecializationModel.findOrCreate({
            where: { name },
            defaults: { name }
        });
        return this.mapToDomainSpecializations(specModel.get() as SpecializationModelInterface);
    }

    async findById(id: number): Promise<Specialization | null> {
        const specialization = await models.SpecializationModel.findByPk(id);
        return specialization ? this.mapToDomainSpecializations(specialization) : null;
    }

    async create(specialization: Specialization): Promise<Specialization> {
        const createdSpecialization = await models.SpecializationModel.create(this.mapToPersistence(specialization));
        return this.mapToDomainSpecializations(createdSpecialization);
    }

    async update(specialization: Specialization): Promise<Specialization> {
        const [affectedCount, affectedRows] = await models.SpecializationModel.update(this.mapToPersistence(specialization), { where: { id: specialization.id }, returning: true });
        if (affectedCount === 0 || !affectedRows || affectedRows.length === 0) {
            throw new Error('Специализация не была обновлена');
        }
        const updatedSpecialization = affectedRows[0];
        return this.mapToDomainSpecializations(updatedSpecialization);
    }

    async save(specialization: Specialization): Promise<Specialization> {
        return specialization.id ? await this.update(specialization) : await this.create(specialization);
    }

    async delete(id: number): Promise<void> {
        await models.SpecializationModel.destroy({where: {id}});
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
