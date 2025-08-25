import { IProblemCreationAttributes, ProblemModelInterface } from "../../../infrastructure/persostence/models/interfaces/problem.model.js";
import Problem from "../../domain/entities/problem.entity.js";
import ProblemRepository from "../../domain/repositories/problem.repository.js";
import models from "../../../infrastructure/persostence/models/models.js";

export default class ProblemRepositoryImpl implements ProblemRepository {
    async findAll(): Promise<Problem[]> {
        const problems = await models.ProblemModel.findAll();
        return problems.map((p) => this.mapToDomainProblem(p.get() as ProblemModelInterface));
    }

    async create(problem: Problem): Promise<Problem> {
        throw "";
    }

    async update(problem: Problem): Promise<Problem> {
        throw "";
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