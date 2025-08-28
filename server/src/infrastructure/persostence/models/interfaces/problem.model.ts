import { Model, Optional } from 'sequelize';
import { SpecializationModelInterface } from './specializations.model.js';

interface IProblemAttributes {
    id: number;
    name: string;
}

export interface IProblemCreationAttributes extends Optional<IProblemAttributes, 'id'> {}
export interface ProblemModelInterface extends Model<IProblemAttributes, IProblemCreationAttributes>, IProblemAttributes {
    specializations?: SpecializationModelInterface[];
}