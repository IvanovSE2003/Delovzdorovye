import type { AxiosResponse } from 'axios';
import type { LoginData, RegistrationData } from '../models/IUser'
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

    static async sendEmailResetPassword(email: string) {
        return $api.post('user/request-password-reset', { email });
    }

    static async resetPassword(token: string, password: string) {
        return $api.post(`user/reset-password/${token}`, {newPassword: password})
    }

    static async checkAuth(): Promise<AxiosResponse<AuthResponse>> {
        return $api.get<AuthResponse>('user/refresh');
    }
}