import { Model, Optional } from 'sequelize';

interface ITokenAttributes {
    id: number;
    refreshToken: string;
    userId: number;
}

interface ITokenCreationAttributes extends Optional<ITokenAttributes, 'id'> {}
export interface ITokenModel extends Model<ITokenAttributes, ITokenCreationAttributes>, ITokenAttributes {}