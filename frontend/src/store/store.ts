import { makeAutoObservable } from "mobx";
import type { IUser, IUserDataProfile, LoginData, RegistrationData, TypeResponse } from "../models/Auth";
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
            this.setError(error.response?.data?.message || "Ошибка при регистрации!");
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
            this.setError(error.response?.data?.message || "Ошибка при выходе!")
        } finally {
            this.setLoading(false);
        }
    }

    // Проверка авторизации пользователя
    async checkAuth(): Promise<void> {
        this.setLoading(true);
        try {
            const response = await axios.get<AuthResponse>(`${API_URL}/user/refresh`, {withCredentials: true});
            localStorage.setItem('token', response.data.accessToken);
            this.setAuth(true);
            this.setUser(response.data.user);
        } catch (e) {
            const error = e as AxiosError<{ message: string }>;
            localStorage.removeItem('token');
            this.setError(error.response?.data?.message || "Ошибка аунтификациий!")
            this.setAuth(false);
        } finally {
            this.setLoading(false);
        }
    }

    // Проверка существания пользователя по телефону или почте
    async checkUser(creditial: string): Promise<TypeResponse> {
        try {
            this.setError("");
            const response = await UserService.CheckUser(creditial);
            return response.data;
        } catch (e) {
            const error = e as AxiosError<TypeResponse>;
            this.setError(error.response?.data?.message || "Ошибка при проверки пользователя!");
            return { success: false, message: this.error };
        }
    }

    // Получение данные пациента
    async getPatientData(id: number): Promise<IUser> {
        try {
            const response = await UserService.fetchPatientData(id);
            return response.data;
        } catch (e) {
            const error = e as AxiosError<TypeResponse>;
            this.setError(error.response?.data?.message || "Ошибка при получении данных пациента!");
            return {} as IUser;
        }
    }

    // Получение данные пользователя
    async getUserData(id: number): Promise<IUserDataProfile> {
        try {
            const response = await UserService.fetchUserData(id);
            return response.data;
        } catch (e) {
            const error = e as AxiosError<TypeResponse>;
            this.setError(error.response?.data?.message || "Ошибка при получении данных пользователя!");
            return {} as IUserDataProfile;
        }
    }

    // Изменение данных пользователя
    async updateUserData(data: IUserDataProfile, id: number): Promise<TypeResponse> {
        try {
            const response = await UserService.updateUserData(data, id);
            return response.data;
        } catch (e) {
            const error = e as AxiosError<TypeResponse>;
            this.setError(error.response?.data?.message || "Ошибка при изменении данных пользователя!");
            return { success: false, message: this.error }
        }
    }



    // Отправка сообщения на почту о сбросе пин-кода
    async sendEmailResetPinCode(emailOrPhone: string): Promise<TypeResponse> {
        try {
            this.setError("");
            const response = await AuthService.sendEmailResetPinCode(emailOrPhone);
            return response.data;
        } catch (e) {
            const error = e as AxiosError<TypeResponse>;
            this.setError(error.response?.data?.message || "Ошибка при отправке сообщения для сброса пин-кода!");
            return { success: false, message: error.message };
        }
    }

    // Сборос пин-кода
    async resetPinCode(newPin: string, token: string): Promise<TypeResponse> {
        try {
            this.setError("");
            const response = await AuthService.resetPinCode(newPin, token);
            return response.data;
        } catch (e) {
            const error = e as AxiosError<TypeResponse>;
            this.setError(error.response?.data?.message || "Ошибка при сбросе пароля!");
            return { success: false, message: this.error };
        }
    }



    // Отравка кода на телефон\почту
    async twoFactorSend(method: "EMAIL" | "SMS", creditial: string): Promise<void> {
        try {
            this.setError("");
            await AuthService.twoFactorSend(method, creditial);
        } catch (e) {
            const error = e as AxiosError<TypeResponse>;
            this.setError(error.response?.data?.message || "Ошибка при отправке кода!");
        }
    }

    // Проверка кода почты для входа 
    async checkVarifyCode(code: string, email: string): Promise<TypeResponse> {
        try {
            this.setError("");
            const response = await AuthService.checkVarifyCode(code, email);
            return response.data;
        } catch (e) {
            const error = e as AxiosError<TypeResponse>;
            this.setError(error.response?.data?.message || "Ошибка при проверке почтового кода!");
            return { success: false, message: this.error };
        }
    }

    // Проверка кода телефона для входа
    async checkVarifyCodeSMS(code: string, phone: string): Promise<TypeResponse> {
        try {
            this.setError("");
            const response = await AuthService.checkVarifyCodeSMS(code, phone);
            return response.data;
        } catch (e) {
            const error = e as AxiosError<TypeResponse>;
            this.setError(error.response?.data?.message || "Ошибка при проверка телефонного кода!");
            return { success: false, message: this.error };
        }
    }
    


    // Отправить сообщение об активации на почту
    async sendActivate(email: string): Promise<TypeResponse> {
        try {
            const response = await UserService.sendActivate(email);
            this.user.isActivated = response.data.success;
            return response.data;
        } catch(e) {
            const error = e as AxiosError<TypeResponse>;
            this.setError(error.response?.data?.message || "Ошибка при отправки сообщения на почту!");
            return {success: false, message: this.error}
        }
    }
}