import { Model, Optional } from 'sequelize';

interface IDoctortAttributes {
    id: number;
    specialization: string;
    contacts: string,
    experience_years: number,
    activate: boolean,
    userId?: number
}

export interface IDoctorCreationAttributes extends Optional<IDoctortAttributes, 'id'> {}
export interface DoctorModelInterface extends Model<IDoctortAttributes, IDoctorCreationAttributes>, IDoctortAttributes {}