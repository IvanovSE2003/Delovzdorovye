import type { Dispatch, SetStateAction } from "react";

export type Gender = "Мужчина" | "Женщина" | "";
export type Role = "PATIETN" | "DOCTOR" | "ADMIN" | "";
export interface IUser {
    id: number;
    name: string;
    surname: string;
    patronymic: string;
    email: string;
    phone: string;
    pin_code: number;
    password: string;
    timeZone: number;
    dateBirth: string;
    gender: Gender;
    role: Role;
    isActivated: boolean;
    isActivatedSMS: boolean;
    activationLink: string;
    img: string;
}

export interface IUserDataProfile {
    img: string;
    name: string;
    surname: string;
    patronymic: string;
    gender: Gender;
    dateBirth: string;
    phone: string;
    email: string;
}

export type TypeActivateEmail = {
    message: string;
    success: boolean;
    isActivated: boolean;
}

export type TypeResponseToken = {
    success: boolean;
    token: string;
}

export type TypeResponse = {
    message: string;
    success: boolean;
}

export type LoginData = {
    pin_code: number,
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
    time_zone: string;
    date_birth: string;
    gender: Gender;
    role: Role;
};

export type FormAuthProps = {
  setState: any;
  setError: Dispatch<SetStateAction<string>>;
};