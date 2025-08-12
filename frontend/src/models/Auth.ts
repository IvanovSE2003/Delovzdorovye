import type { Dispatch, SetStateAction } from "react";
import type { AuthState } from "../components/FormAuth/FormAuth";

export type Gender = "мужчина" | "женщина" | "";
export type Role = "PATIETN" | "DOCTOR" | "ADMIN" | "";
export interface IUser {
    id: number;
    name: string;
    surname: string;
    patronymic: string | null;
    email: string;
    phone: string;
    pin_code: number;
    password: string;
    timeZone: number;
    dateBirth: string | null;
    gender: Gender;
    isActivated: boolean;
    activationLink: string;
    img: string;
    role: Role;
}

export interface IUserDataProfile {
    img: string;
    name: string;
    surname: string;
    patronymic: string;
    gender: Gender;
    dateBirth: string;
    timeZone: number;
    phone: string;
    email: string;
}

export type TypeActivateEmail = {
    message: string;
    success: boolean;
    isActivated: boolean;
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
  setState: Dispatch<SetStateAction<AuthState>>;
  setError: Dispatch<SetStateAction<string>>;
};