import { Model, Optional } from 'sequelize';

interface IProfDataAttributes {
    id: number;
    new_diploma: string;
    new_license: string;
    new_experience_years: number;
    new_specialization: string;
    comment: string | null;
    type: "ADD" | "DELETE";
    userId?: number | null;
}

export interface IProfDataCreationAttributes extends Optional<IProfDataAttributes, 'id'> {}
export interface ProfDataModelInterface extends Model<IProfDataAttributes, IProfDataCreationAttributes>, IProfDataAttributes {}