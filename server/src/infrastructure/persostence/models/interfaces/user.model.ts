import { Model, Optional } from 'sequelize';

interface IUserAttributes {
    id: number;
    name: string;
    surname: string;
    patronymic: string;
    email: string;
    phone: string;
    pin_code: number;
    password: string;
    time_zone: number;
    date_birth: Date;
    gender: string;
    isActivated: boolean;
    activationLink: string;
    img: string;
    role: 'PACIENT' | 'DOCTOR' | 'ADMIN';
    resetPasswordToken: string | null;
    resetPasswordExpires: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IUserCreationAttributes extends Optional<IUserAttributes, 'id'> {}
export interface UserModelInterface extends Model<IUserAttributes, IUserCreationAttributes>, IUserAttributes {}