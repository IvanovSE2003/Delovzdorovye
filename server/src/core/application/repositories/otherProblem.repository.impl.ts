import OtherProblem from "../../domain/entities/otherProblem.entity";
import OhterProblemRepository from "../../domain/repositories/otherProblem.repository";
import models from "../../../infrastructure/persostence/models/models";
import { IOtherProblemCreationAttributes, OtherProblemModelInterface } from "../../../infrastructure/persostence/models/interfaces/otherProblem.model";

export default class OtherProblemReposiotoryImpl implements OhterProblemRepository {
    async findById(id: number): Promise<OtherProblem | null> {
        const otherProblem = await models.OtherProblem.findByPk(id);
        return otherProblem ? this.mapToDomainOtherProblem(otherProblem) : null
    }

    async findAllByUser(userId: number): Promise<OtherProblem[]> {
        const otherProblems = await models.OtherProblem.findAll({
            where: {
                userId: userId,
            }
        })
        return otherProblems.map(problem => this.mapToDomainOtherProblem(problem));
    }

    async findAll(): Promise<OtherProblem[]> {
        const otherProblems = await models.OtherProblem.findAll();
        return otherProblems.map(problem => this.mapToDomainOtherProblem(problem));
    }

    async create(problem: OtherProblem): Promise<OtherProblem> {
        const createdOtherProblem = await models.OtherProblem.create(this.mapToPersistence(problem));
        return this.mapToDomainOtherProblem(createdOtherProblem);
    }

    async update(problem: OtherProblem): Promise<OtherProblem> {
        const [affectedCount, affectedRows] = await models.OtherProblem.update(this.mapToPersistence(problem), { where: { id: problem.id }, returning: true });
        if (affectedCount === 0 || !affectedRows || affectedRows.length === 0) {
            throw new Error('Записать другой проблемы не была обновлена');
        }
        const updatedOtherProblem = affectedRows[0];
        return this.mapToDomainOtherProblem(updatedOtherProblem);
    }

    async save(problem: OtherProblem): Promise<OtherProblem> {
        return problem.id ? await this.update(problem) : await this.create(problem);
    }

    async delete(id: number): Promise<void> {
        const deletedCount = await models.OtherProblem.destroy({ where: { id } });
        if (deletedCount === 0) {
            throw new Error('Запись другой проблемы не найдена или не удалена');
        }
    }

    private mapToDomainOtherProblem(problemModel: OtherProblemModelInterface) {
        return new OtherProblem(
            problemModel.id,
            problemModel.time,
            problemModel.date,
            problemModel.description_problem
        );
    }

    private mapToPersistence(problem: OtherProblem): IOtherProblemCreationAttributes {
        return {
            time: problem.time,
            date: problem.date,
            description_problem: problem.description_problem
        };
    }
}