import type { AxiosResponse } from 'axios';
import type { LoginData, RegistrationData } from '../models/Auth'
import type { TypeResponse } from '../models/response/DefaultResponse';
import $api from '../http';
import type { AuthResponse, LoginResponse } from '../models/response/AuthResponse';

interface IResponseRegistration {
    requiresTwoFactor: boolean;
    tempToken: string;
}

export default class AuthService {
    // Первый этап авторизации
    static async login(data: LoginData): Promise<AxiosResponse<LoginResponse>> {
        return $api.post<LoginResponse>('user/login', data);
    }

    // Второй этап авторизации
    static async completeLogin(tempToken: string|null, code: string):Promise<AxiosResponse<AuthResponse>> {
        return $api.post<AuthResponse>('user/complete/login', { tempToken, code: Number(code) });
    }

    static async registration(data: RegistrationData): Promise<AxiosResponse<IResponseRegistration>> {
        return $api.post<IResponseRegistration>('user/registration', data);
    }

    static async completeRegistration(tempToken: string, twoFactorCode: string): Promise<AxiosResponse<AuthResponse>> {
        return $api.post<AuthResponse>('/user/complete/registration', { tempToken, twoFactorCode })
    }

    static async logout(): Promise<void> {
        return $api.post('user/logout');
    }

    // Сбросить пин-код
    static async sendEmailResetPinCode(creditial: string): Promise<AxiosResponse<TypeResponse>> {
        return $api.post<TypeResponse>(`user/request-pin-reset`, { creditial })
    }

    static async resetPinCode(newPin: string, token: string): Promise<AxiosResponse<TypeResponse>> {
        return $api.post<TypeResponse>(`user/reset-pin`, { newPin, token })
    }

    // Двухфакторка
    static async twoFactorSend(method: "EMAIL" | "SMS", creditial: string): Promise<AxiosResponse<{ message: string }>> {
        return $api.post<{ message: string }>('user/twoFactorSend', { method, creditial });
    }
}