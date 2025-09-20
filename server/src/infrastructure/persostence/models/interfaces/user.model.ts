import { Model, Optional } from 'sequelize';

interface IUserAttributes {
    id: number;
    name: string | null;
    surname: string | null;
    patronymic: string | null;
    email: string;
    phone: string;
    pin_code: number;
    time_zone: number;
    date_birth: string | null;
    gender: string | null;
    isActivated: boolean;
    isActivatedSMS: boolean;
    activationLink: string;
    img: string;
    role: 'PATIENT' | 'DOCTOR' | 'ADMIN';
    createdAt?: Date;
    updatedAt?: Date;
    twoFactorCode: string | null;
    twoFactorCodeExpires: Date | null;
    resetToken: string | null;
    resetTokenExpires: Date | null;
    pinAttempts: number;
    isBlocked: boolean;
    blockedUntil: Date | null;
    sentChanges: boolean | null;
    doctorId?: number;
    isAnonymous: boolean | null;
}

export interface IUserCreationAttributes extends Optional<IUserAttributes, 'id'> {}
export interface UserModelInterface extends Model<IUserAttributes, IUserCreationAttributes>, IUserAttributes {}