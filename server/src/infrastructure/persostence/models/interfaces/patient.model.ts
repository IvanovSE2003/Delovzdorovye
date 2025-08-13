import { Model, Optional } from 'sequelize';

interface IPatientAttributes {
    id: number;
    userId?: number;
    activate: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IPatientCreationAttributes extends Optional<IPatientAttributes, 'id'> {}
export interface PatientModelInterface extends Model<IPatientAttributes, IPatientCreationAttributes>, IPatientAttributes {}