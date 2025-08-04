import { Model, Optional } from 'sequelize';

interface IUserAttributes {
    id: number;
    name: string;
    surname: string;
    patronymic: string;
    email: string;
    phone: string;
    pin_code: number | null;
    password: string;
    time_zone: number;
    date_birth: Date;
    gender: string;
    role: string;
    img: string,
    createdAt?: Date;
    updatedAt?: Date;
    isActivated: Boolean;
    activationLink: string;
    resetPasswordToken: string | null;
    resetPasswordExpires: Date | null;
}

interface IUserCreationAttributes extends Optional<IUserAttributes, 'id'> {}
export interface IUserModel extends Model<IUserAttributes, IUserCreationAttributes>, IUserAttributes {}