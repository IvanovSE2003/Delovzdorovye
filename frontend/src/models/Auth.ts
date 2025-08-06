import type { Dispatch, SetStateAction } from "react";
import type { AuthState } from "../components/FormAuth/FormAuth";

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

export type Gender = "мужчина" | "женщина" | "";
export type Role = "PACIENT" | "DOCTOR" | "ADMIN" | "";
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