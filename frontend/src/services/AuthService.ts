import type { AxiosResponse } from 'axios';
import $api from '../http';
import type { AuthResponse } from '../models/response/AuthResponse';

type RegistrationData = {
    name: string,
    surname: string,
    patronymic: string,
    getnder: 'женщина' | 'мужчина',
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
        return $api.post<AuthResponse>('user/login', Data);
    }

    static async registration(Data: RegistrationData): Promise<AxiosResponse<AuthResponse>> {
        return $api.post<AuthResponse>('user/registration', Data);
    }

    static async logout(): Promise<void> {
        return $api.post('user/logout');
    }
}