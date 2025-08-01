import $api from '../http'
import axios, { AxiosResponse } from 'axios';
import type { AuthResponse } from '../models/response/AuthResponse';

export default class AuthService {
    static async login(email: string, password: string): Promise<AxiosResponse<AuthResponse>> {
        return $api.post('/login', {email, password});
    }
}