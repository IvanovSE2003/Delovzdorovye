import { Model, Optional } from 'sequelize';

interface ITokenAttributes {
    id: number;
    userId: number;
    refreshToken: string;
}

export interface ITokenCreationAttributes extends Optional<ITokenAttributes, 'id'> {}
export interface TokenModelInterface extends Model<ITokenAttributes, ITokenCreationAttributes>, ITokenAttributes {}