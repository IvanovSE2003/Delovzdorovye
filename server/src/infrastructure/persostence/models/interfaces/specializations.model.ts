import { Model, Optional } from 'sequelize';

interface ISpecializationAttributes {
    id: number;
    name: string;
}

export interface ISpecializationCreationAttributes extends Optional<ISpecializationAttributes, 'id'> {}
export interface SpecializationModelInterface extends Model<ISpecializationAttributes, ISpecializationCreationAttributes>, ISpecializationAttributes {}