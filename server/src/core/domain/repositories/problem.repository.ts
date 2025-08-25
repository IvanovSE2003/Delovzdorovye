import Problem from "../entities/problem.entity.js";

export default interface ProblemRepository {
    findAll(): Promise<Problem[]>;
    create(problem: Problem): Promise<Problem>;
    update(problem: Problem): Promise<Problem>;
}
