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
    isLoading = false;

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

    // Вход в учетную запись
    async login(data: LoginData): Promise<void> {
        try {
            this.setLoading(true);
            this.setError("");
            const response = await AuthService.login(data);
            localStorage.setItem('token', response.data.accessToken);
            this.setAuth(true);
            this.setUser(response.data.user);
        } catch (e) {
            const error = e as AxiosError<{ message: string }>;
            const errorMessage = error.response?.data?.message || "Ошибка при входе!";
            this.setError(errorMessage);
            console.log(errorMessage);
        } finally {
            this.setLoading(false);
        }
    }

    // Регистрация
    async registration(data: RegistrationData): Promise<void> {
        try {
            this.setLoading(true);
            this.setError("");
            const response = await AuthService.registration(data);
            localStorage.setItem('token', response.data.accessToken);
            this.setAuth(true);
            this.setUser(response.data.user);
        } catch (e) {
            const error = e as AxiosError<{ message: string }>;
            const errorMessage = error.response?.data?.message || "Ошибка при регистрации!";
            this.setError(errorMessage);
            console.log(errorMessage);
        } finally {
            this.setLoading(false);
        }
    }

    // Выход из учетной записи
    async logout(): Promise<void> {
        try {
            this.setLoading(true);
            await AuthService.logout();
            localStorage.removeItem('token');
            this.setAuth(false);
            this.setUser({} as IUser);
            this.setError("");
        } catch (e) {
            const error = e as AxiosError<{ message: string }>;
            console.log("Ошибка при выходе:", error.response?.data?.message);
        } finally {
            this.setLoading(false);
        }
    }

    // Проверка авторизации пользователя
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
            const error = e as AxiosError<{ message: string }>;
            console.log("Ошибка проверки аутентификации:", error.response?.data?.message);
            localStorage.removeItem('token');
            this.setAuth(false);
        } finally {
            this.setLoading(false);
        }
    }

    // Проверка существания пользователя по телефону или почте
    async checkUser(phone: string | null, email: string | null) {
        try {
            this.setError("");
            const response = await UserService.CheckUser(phone, email) as any;
            return response.data;
        } catch (e) {
            const error = e as AxiosError<{ message: string }>;
            return { check: false, message: error.response?.data?.message };
        }
    }

    // Получение данные пациента
    async getPatientData(id: number) {
        try {
            const response = await UserService.fetchPatientData(id);
            return response.data;
        } catch (e) {
            const error = e as AxiosError<{ message: string }>;
            const errorMessage = error.response?.data?.message || "Ошибка при получении данных пациента!";
            this.setError(errorMessage);
            console.log(errorMessage);
        }
    }

    // Получение данные пользователя
    async getUserData(id: number) {
        try {
            const response = await UserService.fetchUserData(id);
            return response.data;
        } catch(e) {
            const error = e as AxiosError<{ message: string; }>;
            const errorMessage = error.response?.data?.message || "Ошибка при получении данных пользователя!";
            this.setError(errorMessage);
            console.log(errorMessage);
        }
    }


    
    // Отправка сообщения на почту о сбросе пин-кода
    async sendEmailResetPinCode(pin: string): Promise<ResetPassword> {
        try {
            this.setError("");
            const response = await AuthService.sendEmailResetPinCode(pin);
            return response.data;
        } catch (e) {
            const error = e as AxiosError<{ message: string }>;
            const errorMessage = error.response?.data?.message || "Ошибка при отправке сообщения для сброса пин-кода!";
            this.setError(errorMessage);
            console.log(errorMessage);
            return { success: false, message: errorMessage };
        }
    }

    // Сборос пин-кода
    async resetPinCode(token: string, pinCode: string): Promise<ResetPassword> {
        try {
            this.setError("");
            const response = await AuthService.resetPinCode(token, pinCode);
            return response.data;
        } catch (e) {
            const error = e as AxiosError<{ message: string }>;
            const errorMessage = error.response?.data?.message || "Ошибка при сбросе пароля!";
            this.setError(errorMessage);
            console.log(errorMessage);
            return { success: false, message: errorMessage };
        }
    }



    // Отравка кода на телефон\почту
    async twoFactorSend(method: "EMAIL" | "SMS", phone: string, email: string) {
        try {
            this.setError("");
            const response = await AuthService.twoFactorSend(method, phone, email);
            console.log("Код на указанный контакт отправился!")
            return response.data;
        } catch (e) {
            const error = e as AxiosError<{ message: string }>;
            const errorMessage = error.response?.data?.message || "Ошибка при отправке кода!";
            this.setError(errorMessage);
            console.log(errorMessage);
            return { message: errorMessage };
        }
    }

    // Проверка кода почты для входа 
    async checkVarifyCode(code: string, email: string) {
        try {
            this.setError("");
            const response = await AuthService.checkVarifyCode(code, email);
            console.log("Введенный почтовый код - правильный!");
            return response.data;
        } catch (e) {
            const error = e as AxiosError<{ message: string }>;
            const errorMessage = error.response?.data?.message || "Ошибка при проверке почтового кода!";
            this.setError(errorMessage);
            console.error(errorMessage);
            return { success: false, message: errorMessage };
        }
    }

    // Проверка кода телефона для входа
    async checkVarifyCodeSMS(code: string, phone: string) {
        try {
            this.setError("");
            const response = await AuthService.checkVarifyCodeSMS(code, phone);
            console.log("Введенный телефонный код - правильный!");
            return response.data;
        } catch(e) {
            const error = e as AxiosError<{ message: string}>;
            const errorMessage = error.response?.data?.message || "Ошибка при проверка телефонного кода!";
            this.setError(errorMessage);
            console.error(errorMessage);
            return { success: false, message: errorMessage }
        }
    }
}