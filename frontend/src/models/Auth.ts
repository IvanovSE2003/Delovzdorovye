import type { Dispatch, SetStateAction } from "react";
import type { ITimeZones } from "./TimeZones";

export type Gender = "Мужчина" | "Женщина" | "";
export type Role = "PATIENT" | "DOCTOR" | "ADMIN";
export interface IUser {
    id: number;
    name: string;
    surname: string;
    patronymic?: string;
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
    isAnonymous: boolean;
    isBlocked: boolean;
    activationLink: string;
    sentChanges: boolean;
    img: string;
}

export interface IUserDataProfile {
    img: string;
    role: Role;
    name: string;
    surname: string;
    patronymic?: string;
    gender: Gender;
    dateBirth: string;
    phone: string;
    email: string;
    isAnonymous: boolean;
    age?: number;
    timeZone?: ITimeZones;
    hasOtherProblem?: boolean;
}

export interface IAdminDataProfile {
  role: Role;
  name: string;
  surname: string;
  patronymic?: string;
  gender: Gender;
  dateBirth: string;
  phone: string;
  email: string;
}

export interface User {
  id: number;
  role: string;
  name: string;
  surname: string;
  patronymic?: string;
  img: string;
  gender: string;
  phone: string;
  email: string;
  specialization: string;
  diploma: string;
  license: string;
  isBlocked: boolean;
}

export type LoginData = {
    creditial: string;
    twoFactorMethod: "SMS"|"EMAIL";
    pin_code: number;
}

export type RegistrationData = {
    name: string;
    surname: string;
    patronymic: string;
    email: string;
    phone: string;
    pin_code: string;
    time_zone: number;
    date_birth: string;
    gender: Gender;
    role: Role;
    isAnonymous: boolean;
    specializations?: string[];
    experienceYears?: number;
    diploma?: File;
    license?: File;
};

export type FormAuthProps = {
  setState: any;
  setError: Dispatch<SetStateAction<string>>;
};