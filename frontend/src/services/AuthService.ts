import type { AxiosResponse } from 'axios';
import type { LoginData, RegistrationData } from '../models/Auth'
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
    static async sendEmailResetPinCode(emailOrPhone: string) {
        return $api.post(`user/request-pin-reset`, { emailOrPhone })
    }

    static async resetPinCode(newPin: string, token: string) {
        return $api.post(`user/reset-pin`, { newPin, token })
    }

    // Двухфакторка
    static async twoFactorSend(method: "EMAIL"|"SMS", phone: string, email: string) {
        return $api.post('user/twoFactorSend', { method, phone, email });
    }

    static async checkVarifyCode(code: string, email: string) {
        return $api.post('user/checkVarifyCode', { code, email });
    }

    static async checkVarifyCodeSMS(code: string, phone: string) {
        return $api.post('user/checkVarifyCodeSMS', {code, phone});
    }
}