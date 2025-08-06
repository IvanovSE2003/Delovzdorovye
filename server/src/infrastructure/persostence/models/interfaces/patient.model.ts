import { Model, Optional } from 'sequelize';

interface IPatientAttributes {
    id: number;
    general_info: Record<string, any> | null;
    analyses_examinations: Record<string, any> | null;
    additionally: Record<string, any> | null;
    userId?: number;
    activate: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IPatientCreationAttributes extends Optional<IPatientAttributes, 'id'> {}
export default interface PatientModelInterface extends Model<IPatientAttributes, IPatientCreationAttributes>, IPatientAttributes {}