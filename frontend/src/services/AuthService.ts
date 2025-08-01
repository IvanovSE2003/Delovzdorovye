import type { AxiosResponse } from 'axios';
import $api from '../http';
import type { AuthResponse } from '../models/response/AuthResponse';

type RegistrationData = {
    name: string,
    surname: string,
    patronymic: string,
    getnder: 'male' | 'famale',
    date_birth: Date,
    time_zone: string,
    phone: string,
    pin_code: number
};

type LoginData = {
    pin_code: number,
    password: string,
    phone?: string,
    email?: string
}

export default class AuthService {
    static async login(Data: LoginData): Promise<AxiosResponse<AuthResponse>> {
        return $api.post<AuthResponse>('/login', Data);
    }

    static async registration(Data: RegistrationData): Promise<AxiosResponse<AuthResponse>> {
        return $api.post<AuthResponse>('/registration', Data);
    }

    static async logout(): Promise<void> {
        return $api.post('/logout');
    }
}