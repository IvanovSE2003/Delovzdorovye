import { Model, Optional } from 'sequelize';

interface IUserAttributes {
    id: number;
    name: string;
    surname: string;
    patronymic: string;
    email: string;
    phone: string;
    pin_code: number;
    time_zone: number;
    date_birth: Date;
    gender: string;
    isActivated: boolean;
    activationLink: string;
    img: string;
    role: 'PACIENT' | 'DOCTOR' | 'ADMIN';
    createdAt?: Date;
    updatedAt?: Date;
    twoFactorCode: string | null;
    twoFactorCodeExpires: Date | null
}

export interface IUserCreationAttributes extends Optional<IUserAttributes, 'id'> {}
export interface UserModelInterface extends Model<IUserAttributes, IUserCreationAttributes>, IUserAttributes {}