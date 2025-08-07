import { Model, Optional } from 'sequelize';

interface IUserAttributes  {
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
    role: "PACIENT" | "DOCTOR" | "ADMIN";
    img: string,
    createdAt?: Date;
    updatedAt?: Date;
    isActivated: boolean;
    activationLink: string;
    twoFactorCode: string | null;
    twoFactorCodeExpires: Date | null;
}

interface IUserCreationAttributes extends Optional<IUserAttributes , 'id'> {}
export interface UserModelInterface extends Model<IUserAttributes , IUserCreationAttributes>, IUserAttributes  {}