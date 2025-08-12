import type { AxiosResponse } from 'axios';
import type { LoginData, RegistrationData, TypeResponse} from '../models/Auth'
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
    static async sendEmailResetPinCode(emailOrPhone: string): Promise<AxiosResponse<TypeResponse>> {
        return $api.post<TypeResponse>(`user/request-pin-reset`, { emailOrPhone })
    }

    static async resetPinCode(newPin: string, token: string): Promise<AxiosResponse<TypeResponse>>{
        return $api.post<TypeResponse>(`user/reset-pin`, { newPin, token })
    }

    // Двухфакторка
    static async twoFactorSend(method: "EMAIL"|"SMS", phone: string, email: string): Promise<void> {
        return $api.post('user/twoFactorSend', { method, phone, email });
    }

    static async checkVarifyCode(code: string, email: string): Promise<AxiosResponse<TypeResponse>>{
        return $api.post<TypeResponse>('user/checkVarifyCode', { code, email });
    }

    static async checkVarifyCodeSMS(code: string, phone: string): Promise<AxiosResponse<TypeResponse>> {
        return $api.post<TypeResponse>('user/checkVarifyCodeSMS', {code, phone});
    }
}