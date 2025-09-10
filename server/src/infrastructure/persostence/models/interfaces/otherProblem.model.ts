import { Model, Optional } from 'sequelize';

interface IOtherProblemAttributes {
    id: number;
    time: string;
    date: string;
    description_problem: string;
    userId?: number;
}

export interface IOtherProblemCreationAttributes extends Optional<IOtherProblemAttributes, 'id'> {}
export interface OtherProblemModelInterface extends Model<IOtherProblemAttributes, IOtherProblemCreationAttributes>, IOtherProblemAttributes {}