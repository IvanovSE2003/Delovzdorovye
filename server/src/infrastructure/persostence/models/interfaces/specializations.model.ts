import { Model, Optional } from 'sequelize';

interface ISpecializationAttributes {
    id: number;
    name: string;
}

export interface IDoctorSpecializationAttributes {
    diploma: string | null;
    license: string | null;
    doctorId: number;
    specializationId: number;
}

export interface ISpecializationCreationAttributes extends Optional<ISpecializationAttributes, 'id'> {}
export interface SpecializationModelInterface extends Model<ISpecializationAttributes, ISpecializationCreationAttributes>, ISpecializationAttributes {
    doctor_specializations: IDoctorSpecializationAttributes;
}

