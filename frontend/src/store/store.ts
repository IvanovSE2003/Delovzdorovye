import { makeAutoObservable } from "mobx";
import type { IUser, IUserDataProfile, LoginData, RegistrationData, TypeResponse, TypeResponseToken } from "../models/Auth";
import AuthService from "../services/AuthService";
import UserService from "../services/UserService";
import type { AxiosError } from "axios";
import axios from "axios";
import type { AuthResponse } from "../models/response/AuthResponse";
import { API_URL } from "../http";

export default class Store {
    user = {} as IUser;
    userProfile = {} as IUserDataProfile;
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

    setUserProfile(user: IUserDataProfile) {
        this.user.img = user.img;
        this.user.name = user.name;
        this.user.surname = user.surname;
        this.user.patronymic = user.patronymic;
        this.user.gender = user.gender;
        this.user.dateBirth = user.dateBirth;
        this.user.phone = user.phone;
        this.user.email = user.email;
    }

    setError(error: string) {
        this.error = error;
    }

    setLoading(bool: boolean) {
        this.isLoading = bool;
    }

    // Вход в учетную запись
    async login(data: LoginData): Promise<void> {
        console.log('login')
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
        console.log('registration')
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
        console.log('logout')
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
        console.log('checkAuth')
        this.setLoading(true);
        try {
            const response = await axios.get<AuthResponse>(`${API_URL}/user/refresh`, { withCredentials: true });
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
        console.log('checkUser')
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
            this.setUser(response.data.user);
            return { success: response.data.success, message: response.data.message };
        } catch (e) {
            const error = e as AxiosError<TypeResponse>;
            this.setError(error.response?.data?.message || "Ошибка при изменении данных пользователя!");
            return { success: false, message: this.error }
        }
    }



    // Отправка сообщения на почту о сбросе пин-кода
    async sendEmailResetPinCode(creditial: string): Promise<TypeResponse> {
        try {
            this.setError("");
            const response = await AuthService.sendEmailResetPinCode(creditial);
            return response.data;
        } catch (e) {
            const error = e as AxiosError<TypeResponse>;
            this.setError(error.response?.data?.message || "Ошибка при отправке сообщения для сброса пин-кода!");
            return { success: false, message: this.error };
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
    async twoFactorSend(method: "EMAIL" | "SMS", creditial: string): Promise<{message: string}> {
        try {
            this.setError("");
            const response = await AuthService.twoFactorSend(method, creditial);
            if(response.data.message) this.setError(response.data.message)
            return response.data;
        } catch (e) {
            const error = e as AxiosError<TypeResponse>;
            this.setError(error.response?.data?.message || "Ошибка при отправке кода!");
            return {message: this.error}
        }
    }

    // Проверка кода почты для входа 
    async checkVarifyCode(code: string, creditial: string): Promise<TypeResponse & {userId: number| null}> {
        try {
            this.setError("");
            const response = await AuthService.checkVarifyCode(code, creditial);
            return response.data;
        } catch (e) {
            const error = e as AxiosError<TypeResponse>;
            this.setError(error.response?.data?.message || "Ошибка при проверке почтового кода!");
            return { success: false, message: this.error, userId: null };
        }
    }


    // Отправить сообщение об активации на почту
    async sendActivate(email: string): Promise<TypeResponse> {
        try {
            const response = await UserService.sendActivate(email);
            this.user.isActivated = response.data.success;
            return response.data;
        } catch (e) {
            const error = e as AxiosError<TypeResponse>;
            this.setError(error.response?.data?.message || "Ошибка при отправки сообщения на почту!");
            return { success: false, message: this.error }
        }
    }



    // Получить токен для активации телефона у телеграмм-бота
    async getTokenTg(id: number): Promise<TypeResponseToken> {
        try {
            const response = await UserService.getTokenTg(id);
            return response.data;
        } catch (e) {
            const error = e as AxiosError<TypeResponse>;
            this.setError(error.response?.data?.message || "Ошибка при получение токена!");
            return { success: false, token: this.error }
        }
    }


    // Манипулируем с аватаром пользователя
    async uploadAvatar(formData: FormData): Promise<void> {
        try {
            const response = await UserService.uploadAvatar(formData, localStorage.getItem('token'));
            this.setUserProfile(response.data);
        } catch(e) {
            const error = e as AxiosError<TypeResponse>;
            this.setError(error.response?.data?.message || "Ошибка при загрузке фото!");
        }
    }

    async removeAvatar(id: number): Promise<void> {
        try {
            const response = await UserService.removeAvatar(id);
            this.setUserProfile(response.data);
        } catch(e) {
            const error = e as AxiosError<TypeResponse>;
            this.setError(error.response?.data?.message || "Ошибка при удалении фото!");
        }
    }
}