import { Model, Optional } from 'sequelize';

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
    img: string,
    createdAt?: Date;
    updatedAt?: Date;
}

interface IUserCreationAttributes extends Optional<IUserAttributes, 'id'> {}
export interface IUserModel extends Model<IUserAttributes, IUserCreationAttributes>, IUserAttributes {}