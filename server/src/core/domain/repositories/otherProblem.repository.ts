import OtherProblem from "../../domain/entities/otherProblem.entity"

export default interface OhterProblemRepository {
    findById(id: number): Promise<OtherProblem | null>;
    findAll(): Promise<OtherProblem[]>;
    findAllByUser(userId: number): Promise<OtherProblem[]>;
    create(problem: OtherProblem): Promise<OtherProblem>;
    update(problem: OtherProblem): Promise<OtherProblem>;
    save(problem: OtherProblem): Promise<OtherProblem>;
    delete(id: number): Promise<void>;
}