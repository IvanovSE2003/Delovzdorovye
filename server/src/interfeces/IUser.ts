// interfaces/IUser.ts
import { Model, Optional } from 'sequelize';

// Определяем атрибуты, которые будут в таблице
interface IUserAttributes {
    id: number;
    name: string | null;
    surname: string | null;
    patronymic: string | null;
    email: string;
    phone: string | null;
    pin_code: number | null;
    password: string;
    time_zone: number | null;
    date_birth: Date | null;
    gender: string | null;
    role: string;
    createdAt?: Date;
    updatedAt?: Date;
}

// Указываем, какие поля являются опциональными при создании
interface IUserCreationAttributes extends Optional<IUserAttributes, 'id'> {}

// Объединяем с Model
export interface IUserModel extends Model<IUserAttributes, IUserCreationAttributes>, IUserAttributes {}