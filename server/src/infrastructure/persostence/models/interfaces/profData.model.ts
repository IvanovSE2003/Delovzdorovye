import { Model, Optional } from 'sequelize';

interface IProfDataAttributes {
    id: number;
    new_diploma?: string | null;
    new_license?: string | null;
    new_experience_years?: number | null;
    new_specialization?: string | null;
    comment?: string | null;
    type?: "ADD" | "DELETE" | null;
    userId?: number | null;
}

export interface IProfDataCreationAttributes extends Optional<IProfDataAttributes, 'id'> {}
export interface ProfDataModelInterface extends Model<IProfDataAttributes, IProfDataCreationAttributes>, IProfDataAttributes {}