import type { AxiosResponse } from 'axios';
import type { LoginData, RegistrationData, TypeResponse } from '../models/Auth'
import $api from '../http';
import type { AuthResponse } from '../models/response/AuthResponse';

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

    static async checkAuth(): Promise<AxiosResponse<AuthResponse>> {
        return $api.get<AuthResponse>('user/refresh');
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

    static async checkVarifyCode(code: string, creditial: string): Promise<AxiosResponse<TypeResponse & {userId: number}>> {
        return $api.post<TypeResponse & {userId: number}>('user/checkVarifyCode', { code, creditial });
    }
}