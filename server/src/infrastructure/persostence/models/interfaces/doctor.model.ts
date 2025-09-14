import { Model, Optional } from 'sequelize';

interface IDoctortAttributes {
    id: number;
    isActivated: boolean;
    userId?: number;
    competencies: number[];
}

export interface IDoctorCreationAttributes extends Optional<IDoctortAttributes, 'id'> { }

export interface DoctorModelInterface extends Model<IDoctortAttributes, IDoctorCreationAttributes>, IDoctortAttributes {}