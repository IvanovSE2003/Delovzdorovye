// batch.model.ts (интерфейс)
import { Model, Optional } from 'sequelize';

interface IBatchAttributes {
    id: number;
    status: string;
    rejection_reason: string;
    is_urgent: boolean;
    field_name: string;
    old_value: string;
    new_value: string;
    doctorId?: number;
    userId?: number;
}

export interface IBatchCreationAttributes extends Optional<IBatchAttributes, 'id'> {}
export interface BatchModelInterface extends Model<IBatchAttributes, IBatchCreationAttributes>, IBatchAttributes {}