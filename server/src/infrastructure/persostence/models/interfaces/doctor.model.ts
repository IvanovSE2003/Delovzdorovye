import { Model, Optional } from 'sequelize';

interface IDoctortAttributes {
    id: number;
    specialization: string;
    experience_years: number;
    diploma: string;
    license: string;
    activate: boolean;
    userId?: number;
}

export interface IDoctorCreationAttributes extends Optional<IDoctortAttributes, 'id'> {}
export interface DoctorModelInterface extends Model<IDoctortAttributes, IDoctorCreationAttributes>, IDoctortAttributes {}