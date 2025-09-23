import { IProblemCreationAttributes, ProblemModelInterface } from "../../../infrastructure/persostence/models/interfaces/problem.model.js";
import Problem from "../../domain/entities/problem.entity.js";
import ProblemRepository from "../../domain/repositories/problem.repository.js";
import models from "../../../infrastructure/persostence/models/models.js";

export default class ProblemRepositoryImpl implements ProblemRepository {
    async findAll(): Promise<Problem[]> {
        const problems = await models.ProblemModel.findAll({
            order: [['id', 'ASC']]
        });
        return problems.map((p) => this.mapToDomainProblem(p.get() as ProblemModelInterface));
    }

    async findById(id: number): Promise<Problem | null> {
        const problem = await models.ProblemModel.findByPk(id);
        return problem ? this.mapToDomainProblem(problem) : null;
    }

    async create(problem: Problem): Promise<Problem> {
        const createdProblem = await models.ProblemModel.create(this.mapToPersistence(problem));
        return this.mapToDomainProblem(createdProblem);
    }

    async update(problem: Problem): Promise<Problem> {
        const [affectedCount, affectedRows] = await models.ProblemModel.update(this.mapToPersistence(problem), { where: { id: problem.id }, returning: true });
        if (affectedCount === 0 || !affectedRows || affectedRows.length === 0) {
            throw new Error('Проблема не была обновлена');
        }
        const updatedProblem = affectedRows[0];
        return this.mapToDomainProblem(updatedProblem);
    }

    async save(problem: Problem): Promise<Problem> {
        return problem.id ? await this.update(problem) : await this.create(problem);
    }

    async delete(id: number): Promise<void> {
        await models.ProblemModel.destroy({ where: { id } });
    }

    private mapToDomainProblem(problemModel: ProblemModelInterface) {
        return new Problem(
            problemModel.id,
            problemModel.name
        );
    }

    private mapToPersistence(problem: Problem): IProblemCreationAttributes {
        return {
            name: problem.name
        };
    }
}