import Problem from "../entities/problem.entity.js";

export default interface ProblemRepository {
    findAll(): Promise<Problem[]>;
    findById(id: number): Promise<Problem | null>;
    create(problem: Problem): Promise<Problem>;
    update(problem: Problem): Promise<Problem>;
    save(problem: Problem): Promise<Problem>;
    delete(id: number): Promise<void>;
}
