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
    createdAt: string;
    updatedAt: string;
}

export type LoginData = {
    // pin_code: number,
    password: string,
    phone?: string,
    email?: string
}