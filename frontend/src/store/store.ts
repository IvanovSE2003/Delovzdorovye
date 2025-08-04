import { makeAutoObservable } from "mobx";
import type { LoginData } from "../models/IUser";
import type { RegistrationData } from "../services/AuthService"
import AuthService from "../services/AuthService";
import UserService from "../services/UserService";
import type { AxiosError } from "axios";
import axios from "axios";
import type { AuthResponse } from "../models/response/AuthResponse";
import { API_URL } from "../http";

interface IUser {
    id: number,
    email: string,
    isActivated: boolean
}

type ResetPassword = {
    message: string;
    success: boolean;
}

export default class Store {
    user = {} as IUser;
    isAuth = false;
    error = ""
    isLoding = false;

    constructor() {
        makeAutoObservable(this);
    }

    setAuth(bool: boolean) {
        this.isAuth = bool;
    }

    setUser(user: IUser) {
        this.user = user;
    }

    setError(error: string) {
        this.error = error;
    }

    async login(data: LoginData): Promise<void> {
        try {
            const response = await AuthService.login(data);
            console.log(response)
            localStorage.setItem('token', response.data.accessToken);
            this.setAuth(true);
            this.setUser(response.data.user);
        } catch (e) {
            const error = e as AxiosError<{ messange: string }>;
            this.setError(error.response?.data?.messange || "Ошибка при входе!");
            console.log(error.response?.data?.messange);
        }
    }

    async checkAuth() {
        try {
            const response = await axios.get<AuthResponse>(`${API_URL}/user/refresh`, {withCredentials: true});
            console.log(response);
            localStorage.setItem('token', response.data.accessToken);
            this.setAuth(true);
            this.setUser(response.data.user);
        } catch (e: any) {
            console.log(e.response?.data?.message)
        } finally {
            this.isLoding = false;
        }
    }

    async registration(data: RegistrationData): Promise<void> {
        try {
            const response = await AuthService.registration(data);
            console.log(response)
            localStorage.setItem('token', response.data.accessToken);
            this.setAuth(true);
            this.setUser(response.data.user);
        } catch (e) {
            const error = e as AxiosError<{ messange: string }>;
            this.setError(error.response?.data?.messange || "Ошибка при регистрации!");
            console.log(error.response?.data?.messange);
        }
    }

    async logout() {
        try {
            const response = await AuthService.logout();
            console.log(response)
            localStorage.removeItem('token');
            this.setAuth(false);
            this.setUser({} as IUser);
        } catch (e) {
            const error = e as AxiosError<{ message: string }>;
            console.log(error.response?.data?.message);
        }
    }

    async checkUser(phone: string | null, email: string | null) {
        try {
            const response = await UserService.CheckUser(phone, email) as any;
            return response.data.check;
        } catch (e) {
            console.error((e as AxiosError<{ message: string }>).response?.data?.message);
            return false;
        }
    }

    async getUserData(id: number) {
        try {
            const response = await UserService.fetchUserData(id);
            return response.data;
        } catch (e) {
            const error = e as AxiosError<{ messange: string }>;
            this.setError(error.response?.data?.messange || "Ошибка при получении данных пользователя!");
            console.log(error.response?.data?.messange);
        }
    }

    async sendEmailResetPassword(email: string): Promise<ResetPassword> {
        try {
            const response = await AuthService.sendEmailResetPassword(email);
            return response.data;
        } catch (e) {
            const error = e as AxiosError<{ message: string }>;
            this.setError(error.response?.data?.message || "Ошибка при отправки сообщения для сбрасывания пароля!");
            console.log(error.response?.data?.message);
            return { success: false, message: this.error }
        }
    }

    async resetPassword(token: string, password: string): Promise<ResetPassword> {
        try {
            const response = await AuthService.resetPassword(token, password);
            return response.data;
        } catch (e) {
            const error = e as AxiosError<{ message: string }>;
            this.setError(error.response?.data?.message || "Ошибка при сбрасывании пароля!");
            console.log(error.response?.data?.message);
            return { success: false, message: this.error }
        }
    }
}