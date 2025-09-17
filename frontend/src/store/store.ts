import { makeAutoObservable } from "mobx";
import type { IAdminDataProfile, IUser, IUserDataProfile, LoginData, RegistrationData, Role, User } from "../models/Auth";
import type { TypeResponse } from "../models/response/DefaultResponse";
import AuthService from "../services/AuthService";
import UserService from "../services/UserService";
import type { AxiosError } from "axios";
import axios from "axios";
import type { AuthResponse, LoginResponse } from "../models/response/AuthResponse";
import { API_URL } from "../http";
import type { PatientData } from "../models/PatientData";
import AdminService from "../services/AdminService";
import { menuConfig } from "../routes/index";

interface ImenuItems {
    path: string;
    name: string;
}

export default class Store {
    user = {} as IUser;
    isAuth = false;
    error = "";
    menuItems = [] as ImenuItems[];
    loading = false;
    countMessage = 0;
    lastVisited: string = "/personal";

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

    setMenuItems(role: Role) {
        this.menuItems = menuConfig[role] ?? [];
    }

    setLoading(bool: boolean) {
        this.loading = bool;
    }

    setCountMessage(count: number) {
        this.countMessage = count;
    }

    setLastVisited(path: string) {
        this.lastVisited = path;
    }

    decrimentCountMessage() {
        this.countMessage--;
    }

    async withLoading<T>(asyncFunction: () => Promise<T>): Promise<T> {
        this.setLoading(true);
        try {
            return await asyncFunction();
        } finally {
            this.setLoading(false);
        }
    }

    // Первый этап входа
    async login(data: LoginData): Promise<LoginResponse> {
        return this.withLoading(async () => {
            try {
                const response = await AuthService.login(data);
                localStorage.setItem('tempToken', response.data.tempToken);
                return response.data;
            } catch (e) {
                const error = e as AxiosError<{ message: string }>;
                const errorMessage = error.response?.data?.message || "Ошибка при входе!";
                this.setError(errorMessage);
                return { success: false, message: this.error, tempToken: "" }
            }
        });
    }

    // Второй этап входа
    async completeTwoFactor(tempToken: string | null, code: string): Promise<{ success: boolean }> {
        return this.withLoading(async () => {
            try {
                const response = await AuthService.completeTwoFactor(tempToken, code);
                localStorage.removeItem('tempToken');
                localStorage.setItem('accessToken', response.data.accessToken);
                this.setAuth(true);
                this.setMenuItems(response.data.user.role);
                this.setUser(response.data.user);
                return { success: true };
            } catch (e) {
                const error = e as AxiosError<{ message: string }>;
                const errorMessage = error.response?.data?.message || "Ошибка при входе!";
                this.setError(errorMessage);

                return { success: false };
            }
        });
    }

    // Регистрация
    async registration(data: RegistrationData): Promise<void> {
        return this.withLoading(async () => {
            try {
                this.setError("");
                const response = await AuthService.registration(data);
                localStorage.setItem('token', response.data.accessToken);
                this.setMenuItems(response.data.user.role);
                this.setAuth(true);
                this.setUser(response.data.user);
            } catch (e) {
                const error = e as AxiosError<{ message: string }>;
                this.setError(error.response?.data?.message || "Ошибка при регистрации!");
            }
        });
    }

    // Выход
    async logout(): Promise<void> {
        return this.withLoading(async () => {
            try {
                await AuthService.logout();
                localStorage.removeItem('token');
                this.setAuth(false);
                this.setUser({} as IUser);
                this.setError("");
            } catch (e) {
                const error = e as AxiosError<{ message: string }>;
                this.setError(error.response?.data?.message || "Ошибка при выходе!")
            }
        });
    }

    // Проверка авторизации пользователя
    async checkAuth(): Promise<void> {
        return this.withLoading(async () => {
            try {
                const response = await axios.get<AuthResponse>(`${API_URL}/user/refresh`, { withCredentials: true });
                localStorage.setItem('token', response.data.accessToken);
                this.setAuth(true);
                this.setMenuItems(response.data.user.role);
                this.setUser(response.data.user);
                this.setCountMessage(response.data.countMessage);
            } catch (e) {
                const error = e as AxiosError<{ message: string }>;
                localStorage.removeItem('token');
                const errorMessage = error.response?.data?.message || "";
                this.setError(errorMessage);
                this.setAuth(false);
            }
        });
    }

    // Проверка существания пользователя по телефону или почте
    async checkUser(creditial: string): Promise<TypeResponse> {
        return this.withLoading(async () => {
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
        });
    }

    // Получение данные пациента
    async getPatientData(id: number): Promise<PatientData> {
        try {
            const response = await UserService.fetchPatientData(id);
            return response.data;
        } catch (e) {
            const error = e as AxiosError<TypeResponse>;
            this.setError(error.response?.data?.message || "Ошибка при получении данных пациента!");
            return {} as PatientData;
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
    async updateUserData(data: IUserDataProfile | IAdminDataProfile, id: number): Promise<TypeResponse> {
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

    // Получить токен для активации телеграмм-бота
    async getTokenTg(id: number): Promise<TypeResponse> {
        try {
            const response = await UserService.getTokenTg(id);
            return response.data;
        } catch (e) {
            const error = e as AxiosError<TypeResponse>;
            this.setError(error.response?.data?.message || "Ошибка при получение токена!");
            return { success: false, message: this.error }
        }
    }

    // Загрузить аватар пользователя
    async uploadAvatar(formData: FormData): Promise<void> {
        try {
            const response = await UserService.uploadAvatar(formData);
            this.setUserProfile(response.data);
        } catch (e) {
            const error = e as AxiosError<TypeResponse>;
            this.setError(error.response?.data?.message || "Ошибка при загрузке фото!");
        }
    }

    // Удалить аватар пользователя
    async removeAvatar(id: number): Promise<void> {
        try {
            const response = await UserService.removeAvatar(id);
            this.setUserProfile(response.data);
        } catch (e) {
            const error = e as AxiosError<TypeResponse>;
            this.setError(error.response?.data?.message || "Ошибка при удалении фото!");
        }
    }

    // Получить всех пользователей
    async getUsersAll(): Promise<User[]> {
        try {
            const response = await AdminService.getUsersAll();
            return response.data;
        } catch (e) {
            const error = e as AxiosError<TypeResponse>;
            this.setError(error.response?.data?.message || "Ошибка при получении пользователей!");
            return [];
        }
    }

    // Заблокировать пользователя
    async blockUser(id: number): Promise<TypeResponse> {
        try {
            const response = await UserService.blockUser(id);
            return response.data;
        } catch (e) {
            const error = e as AxiosError<TypeResponse>;
            this.setError(error.response?.data?.message || "Ошибка при блокировки пользователя!");
            return { success: false, message: this.error };
        }
    }

    // Разблокировать пользователя
    async unblockUser(id: number): Promise<TypeResponse> {
        try {
            const response = await UserService.unblockUser(id);
            return response.data;
        } catch (e) {
            const error = e as AxiosError<TypeResponse>;
            this.setError(error.response?.data?.message || "Ошибка разблокировки пользователя!");
            return { success: false, message: this.error };
        }
    }

    // Изменить роль пользователю
    async changeRoleUser(id: number, newRole: string): Promise<TypeResponse> {
        try {
            const response = await UserService.changeRoleUser(id, newRole);
            return response.data;
        } catch (e) {
            const error = e as AxiosError<TypeResponse>;
            this.setError(error.response?.data?.message || "Ошибка при изменении роли пользователя!");
            return { success: false, message: this.error };
        }
    }


    // Получить все изменения базовых данных у специалиста
    async getBasicDataAll(limit: number, page: number) {
        try {
            const response = await AdminService.getBasicDataAll(limit, page);
            return response.data;
        } catch (e) {
            const error = e as AxiosError<TypeResponse>;
            this.setError(error.response?.data?.message || "Ошибка при удалении фото!");
        }
    }

    // Принять изменения базовых данных
    async confirmBasicData(id: number): Promise<TypeResponse> {
        try {
            const response = await AdminService.confirmBasicData(id);
            return response.data;
        } catch (e) {
            const error = e as AxiosError<TypeResponse>;
            this.setError(error.response?.data?.message || "Ошибка при подтверждении изменений!");
            return { success: false, message: this.error };
        }
    }

    // Отклонить изменения базовых данных
    async rejectBasicData(id: number, message: string): Promise<TypeResponse> {
        try {
            const response = await AdminService.rejectBasicData(id, message);
            return response.data;
        } catch (e) {
            const error = e as AxiosError<TypeResponse>;
            this.setError(error.response?.data?.message || "Ошибка при отмене изменений!");
            return { success: false, message: this.error };
        }
    }

    // Получить все изменения профессиональных данных у специалиста
    async getProfDataAll(limit: number, page: number) {
        try {
            const response = await AdminService.getProfDataAll(limit, page);
            return response.data;
        } catch (e) {
            const error = e as AxiosError<TypeResponse>;
            this.setError(error.response?.data?.message || "Ошибка");
        }
    }

    // Принять изменения профессиональных данных
    async confirmProfData(id: number): Promise<TypeResponse> {
        try {
            const response = await AdminService.confirmProfData(id);
            return response.data;
        } catch (e) {
            const error = e as AxiosError<TypeResponse>;
            this.setError(error.response?.data?.message || "Ошибка при подтверждении изменений!");
            return { success: false, message: this.error };
        }
    }

    // Отклонить изменения профессиональных данных
    async rejectProfData(id: number, message: string): Promise<TypeResponse> {
        try {
            const response = await AdminService.rejectProfData(id, message);
            return response.data;
        } catch (e) {
            const error = e as AxiosError<TypeResponse>;
            this.setError(error.response?.data?.message || "Ошибка при отмене изменений!");
            return { success: false, message: this.error };
        }
    }
}