import { makeAutoObservable } from "mobx";
import type { IUser, LoginData, RegistrationData, ResetPassword } from "../models/Auth";
import AuthService from "../services/AuthService";
import UserService from "../services/UserService";
import type { AxiosError } from "axios";
import axios from "axios";
import type { AuthResponse } from "../models/response/AuthResponse";
import { API_URL } from "../http";

export default class Store {
    user = {} as IUser;
    isAuth = false;
    error = "";
    isLoading = false; // Исправлено isLoding -> isLoading

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

    setLoading(bool: boolean) {
        this.isLoading = bool;
    }

    async login(data: LoginData): Promise<void> {
        try {
            this.setLoading(true);
            this.setError("");
            const response = await AuthService.login(data);
            localStorage.setItem('token', response.data.accessToken);
            this.setAuth(true);
            this.setUser(response.data.user);
        } catch (e) {
            const error = e as AxiosError<{ messange: string }>;
            const errorMessage = error.response?.data?.messange || "Ошибка при входе!";
            this.setError(errorMessage);
            console.log(errorMessage);
        } finally {
            this.setLoading(false);
        }
    }

    async checkAuth() {
        this.setLoading(true);
        try {
            const response = await axios.get<AuthResponse>(`${API_URL}/user/refresh`, {
                withCredentials: true
            });
            localStorage.setItem('token', response.data.accessToken);
            this.setAuth(true);
            this.setUser(response.data.user);
        } catch (e) {
            const error = e as AxiosError<{ messange: string }>;
            console.log("Ошибка проверки аутентификации:", error.response?.data?.messange);
            localStorage.removeItem('token');
            this.setAuth(false);
        } finally {
            this.setLoading(false);
        }
    }

    async registration(data: RegistrationData): Promise<void> {
        try {
            this.setLoading(true);
            this.setError("");
            const response = await AuthService.registration(data);
            localStorage.setItem('token', response.data.accessToken);
            this.setAuth(true);
            this.setUser(response.data.user);
        } catch (e) {
            const error = e as AxiosError<{ messange: string }>;
            const errorMessage = error.response?.data?.messange || "Ошибка при регистрации!";
            this.setError(errorMessage);
            console.log(errorMessage);
        } finally {
            this.setLoading(false);
        }
    }

    async logout() {
        try {
            this.setLoading(true);
            await AuthService.logout();
            localStorage.removeItem('token');
            this.setAuth(false);
            this.setUser({} as IUser);
            this.setError("");
        } catch (e) {
            const error = e as AxiosError<{ messange: string }>;
            console.log("Ошибка при выходе:", error.response?.data?.messange);
        } finally {
            this.setLoading(false);
        }
    }

    // Остальные методы остаются без изменений
    async checkUser(phone: string | null, email: string | null) {
        try {
            const response = await UserService.CheckUser(phone, email) as any;
            return response.data.check;
        } catch (e) {
            console.error((e as AxiosError<{ messange: string }>).response?.data?.messange);
            return false;
        }
    }

    async getPatientData(id: number) {
        try {
            const response = await UserService.fetchPatientData(id);
            return response.data;
        } catch (e) {
            const error = e as AxiosError<{ messange: string }>;
            const errorMessage = error.response?.data?.messange || "Ошибка при получении данных пациента!";
            this.setError(errorMessage);
            console.log(errorMessage);
            throw error;
        }
    }

    async sendEmailResetPinCode(pin: string): Promise<ResetPassword> {
        try {
            this.setError("");
            const response = await AuthService.sendEmailResetPinCode(pin);
            return response.data;
        } catch (e) {
            const error = e as AxiosError<{ messange: string }>;
            const errorMessage = error.response?.data?.messange || "Ошибка при отправке сообщения для сброса пин-кода!";
            this.setError(errorMessage);
            console.log(errorMessage);
            return { success: false, message: errorMessage };
        }
    }

    async resetPinCode(token: string, pinCode: string): Promise<ResetPassword> {
        try {
            this.setError("");
            const response = await AuthService.resetPinCode(token, pinCode);
            return response.data;
        } catch (e) {
            const error = e as AxiosError<{ messange: string }>;
            const errorMessage = error.response?.data?.messange || "Ошибка при сбросе пароля!";
            this.setError(errorMessage);
            console.log(errorMessage);
            return { success: false, message: errorMessage };
        }
    }
}