import type { Axios, AxiosResponse } from 'axios';
import $api from '../http';
import type { AuthResponse } from '../models/response/AuthResponse';

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

export type LoginData = {
    pin_code: number,
    password: string,
    phone?: string,
    email?: string
}


export default class AuthService {
    static async login(Data: LoginData): Promise<AxiosResponse<AuthResponse>> {
        return $api.post<AuthResponse>('user/login', Data);
    }

    static async registration(Data: RegistrationData): Promise<AxiosResponse<AuthResponse>> {
        console.log(Data);
        return $api.post<AuthResponse>('user/registration', Data);
    }

    static async logout(): Promise<void> {
        return $api.post('user/logout');
    }
}