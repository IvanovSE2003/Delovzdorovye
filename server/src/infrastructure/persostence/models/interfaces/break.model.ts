import { Model, Optional } from 'sequelize';

interface IBreakAttributes {
    id: number;
    startDate: string;
    endDate: string;
    doctorId: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IBreakCreationAttributes extends Optional<IBreakAttributes, 'id'> {}
export interface BreakModelInterface extends Model<IBreakAttributes, IBreakCreationAttributes>, IBreakAttributes {}