import type { AxiosResponse } from 'axios';
import type { LoginData } from '../models/IUser'
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

export default class AuthService {
    static async login(Data: LoginData): Promise<AxiosResponse<AuthResponse>> {
        return $api.post<AuthResponse>('user/login', Data);
    }

    static async registration(Data: RegistrationData): Promise<AxiosResponse<AuthResponse>> {
        return $api.post<AuthResponse>('user/registration', Data);
    }

    static async logout(): Promise<void> {
        return $api.post('user/logout');
    }

    static async sendEmailResetPassword(email: string) {
        return $api.post('user/request-password-reset', { email });
    }

    static async resetPassword(token: string, password: string) {
        return $api.post(`user/reset-password/:${token}`, {newPassword: password})
    }
}