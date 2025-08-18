import type { AxiosResponse } from 'axios';
import type { LoginData, RegistrationData } from '../models/Auth'
import type { TypeResponse } from '../models/response/DefaultResponse';
import $api from '../http';
import type { AuthResponse, LoginResponse } from '../models/response/AuthResponse';

export default class AuthService {
    static async login(data: LoginData): Promise<AxiosResponse<LoginResponse>> {
        return $api.post<LoginResponse>('user/login', data);
    }

    static async completeTwoFactor(tempToken: string|null, code: string) {
        return $api.post<AuthResponse>('user/complete-two-factor', { tempToken, code });
    }

    static async registration(data: RegistrationData): Promise<AxiosResponse<AuthResponse>> {
        return $api.post<AuthResponse>('user/registration', data);
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