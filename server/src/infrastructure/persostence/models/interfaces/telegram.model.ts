import { Model, Optional } from 'sequelize';

interface ITelegramAttributes {
    id: number;
    telegram_chat_id: string;
    userId?: number;
}

export interface ITelegramCreationAttributes extends Optional<ITelegramAttributes, 'id'> {}
export interface TelegramModelInterface extends Model<ITelegramAttributes, ITelegramCreationAttributes>, ITelegramAttributes {}