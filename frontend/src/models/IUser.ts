export interface IUser {
    id: number;
    name: string;
    surname: string;
    patronymic: string | null;
    email: string;
    phone: string;
    pin_code: number;
    password: string;
    time_zone: number;
    date_birth: string | null;
    gender: string;
    isActivated: boolean;
    activationLink: string;
    img: string;
    role: "PACIENT" | "DOCTOR" | "ADMIN";
}

export type ResetPassword = {
    message: string;
    success: boolean;
}

export type LoginData = {
    pin_code: number,
    password: string,
    phone?: string,
    email?: string
}

export type RegistrationData = {
    name: string;
    surname: string;
    patronymic: string;
    email: string;
    phone: string;
    pin_code: string;
    password: string;
    time_zone: string;
    date_birth: string;
    gender: "мужчина"|"женщина"| "";
    role: "PACIENT" | "DOCTOR" | "ADMIN"| "";
};