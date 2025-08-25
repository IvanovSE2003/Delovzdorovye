import { Model, Optional } from 'sequelize';

interface IProblemAttributes {
    id: number;
    name: string;
}

export interface IProblemCreationAttributes extends Optional<IProblemAttributes, 'id'> {}
export interface ProblemModelInterface extends Model<IProblemAttributes, IProblemCreationAttributes>, IProblemAttributes {}