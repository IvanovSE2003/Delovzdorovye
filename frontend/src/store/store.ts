import { makeAutoObservable } from "mobx";
import type { IAdminDataProfile, IUser, IUserDataProfile, IUserDataProfileEdit, LoginData, RegistrationData, Role, User } from "../models/Auth";
import type { TypeResponse } from "../models/response/DefaultResponse";
import AuthService from "../services/AuthService";
import UserService from "../services/UserService";
import type { AxiosError } from "axios";
import axios from "axios";
import type { AuthResponse, LoginResponse } from "../models/response/AuthResponse";
import { API_URL, URL } from "../http";
import AdminService from "../services/AdminService";
import { menuConfig } from "../routes/index";
import type { MenuItem } from "../models/MenuItems";
import { processError } from "../helpers/processError";

export default class Store {
    user = {} as IUser;
    isAuth = false;
    error = "";
    menuItems = [] as MenuItem[];
    loading = false;
    countMessage = 0;
    lastVisited: string = "/personal";

    wsConnection: WebSocket | null = null;
    wsConnected = false;
    wsCountChange = 0;
    wsCountConsult = 0;
    wsCountOtherProblem = 0;
    wsNotificationCount = 0;

    wsReconnectAttempts = 0;
    maxWsReconnectAttempts = 5;
    wsReconnectTimeout: NodeJS.Timeout | null = null;
    wsKeepAliveInterval: NodeJS.Timeout | null = null;

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
        this.user.pending_img = user.pending_img;
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


    initWebSocket(wsUrl: string, userId: number, role: Role) {
        if (this.wsConnection && this.wsConnected) {
            return;
        }

        try {
            const ws = new WebSocket(wsUrl);
            this.wsConnection = ws;

            ws.onopen = () => {
                console.log("WebSocket connected");
                this.wsConnected = true;
                this.wsReconnectAttempts = 0;
                ws.send(JSON.stringify({ type: "join", userId, role }));
                this.startKeepAlive();
            };

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                console.log("WebSocket message received:", data);
                this.handleWebSocketMessage(data);
            };

            ws.onclose = (event) => {

                this.wsConnected = false;
                this.stopKeepAlive();

                if (event.code !== 1000 && this.isAuth) {
                    this.handleReconnect(wsUrl, userId, role);
                }
            };

            ws.onerror = (error) => {
                console.error("WebSocket error:", error);
                this.wsConnected = false;
                this.stopKeepAlive();
            };

        } catch (error) {
            console.error("WebSocket connection error:", error);
            this.wsConnected = false;
            this.handleReconnect(wsUrl, userId, role);
        }
    }

    private startKeepAlive() {
        this.stopKeepAlive();

        this.wsKeepAliveInterval = setInterval(() => {
            if (this.wsConnection && this.wsConnection.readyState === WebSocket.OPEN) {
                try {
                    // 🔥 Отправляем кастомный ping сообщение
                    this.wsConnection.send(JSON.stringify({
                        type: "ping",
                        timestamp: Date.now()
                    }));
                } catch (error) {
                    console.error("Ошибка при отправки ping:", error);
                }
            }
        }, 60000);
    }

    private stopKeepAlive() {
        if (this.wsKeepAliveInterval) {
            clearInterval(this.wsKeepAliveInterval);
            this.wsKeepAliveInterval = null;
        }
    }

    private handleReconnect(wsUrl: string, userId: number, role: Role) {
        if (this.wsReconnectAttempts >= this.maxWsReconnectAttempts) {
            console.log("Max reconnection attempts reached");
            return;
        }

        const delay = Math.min(1000 * Math.pow(2, this.wsReconnectAttempts), 30000);

        this.wsReconnectTimeout = setTimeout(() => {
            this.wsReconnectAttempts++;
            this.initWebSocket(wsUrl, userId, role);
        }, delay);
    }

    handleWebSocketMessage(data: any) {
        console.log("Processing WebSocket message:", data);

        switch (data.type) {
            case "pong":
                break;

            case "server_ping":
                if (this.wsConnection && this.wsConnection.readyState === WebSocket.OPEN) {
                    this.wsConnection.send(JSON.stringify({
                        type: "pong",
                        timestamp: data.timestamp
                    }));
                }
                break;

            case "notifications_count":
                this.setWsNotificationCount(data.count);
                break;
            case "changes_count":
                this.setWsCountChange(data.count);
                break;
            case "consult_count":
                this.setWsCountConsult(data.count);
                break;
            case "otherProblem_count":
                this.setWsCountOtherProblem(data.count);
                break;
            default:
                console.log("Unknown message type:", data.type);
                break;
        }
    }


    setWsCountChange(count: number) {
        this.wsCountChange = count;
    }

    setWsCountConsult(count: number) {
        this.wsCountConsult = count;
    }

    setWsCountOtherProblem(count: number) {
        this.wsCountOtherProblem = count;
    }

    setWsNotificationCount(count: number) {
        this.wsNotificationCount = count;
    }

    closeWebSocket() {
        this.stopKeepAlive();

        if (this.wsReconnectTimeout) {
            clearTimeout(this.wsReconnectTimeout);
            this.wsReconnectTimeout = null;
        }

        if (this.wsConnection) {
            this.wsConnection.close(1000, "Manual close");
            this.wsConnection = null;
        }

        this.wsConnected = false;
        this.wsReconnectAttempts = 0;
    }

    // Метод для получения начальных данных 
    async fetchInitialWebSocketData() {
        try {
            if (this.user.role === "ADMIN") {
                const response = await AdminService.getCountAdminData();
                const data = response.data;
                this.setWsCountChange(data.countChange ?? 0);
                this.setWsCountConsult(data.countConsult ?? 0);
                this.setWsCountOtherProblem(data.countOtherProblem ?? 0);
            } else {
                const response = await UserService.getNotReadNotifications(this.user.id);
                this.setWsNotificationCount(response.data.count);
            }
        } catch (e) {
            processError(e, "Ошибка при получении начальных данных");
        }
    }

    // Отправка код для авторизации (повторный)
    async twoFactorSend(method: "SMS" | "EMAIL", creditional: string): Promise<{ message: string }> {
        try {
            const response = await AuthService.twoFactorSend(method, creditional);
            return response.data;
        } catch (e) {
            const error = e as AxiosError<TypeResponse>;
            return { message: error.response?.data.message || "Ошибка при отправки кода" };
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

    // Второй этап входа (вход в систему)
    async completeLogin(tempToken: string | null, code: string): Promise<{ success: boolean, message: string, role: Role | undefined }> {
        return this.withLoading(async () => {
            try {
                const response = await AuthService.completeLogin(tempToken, code);
                localStorage.removeItem('tempToken');
                localStorage.setItem('accessToken', response.data.accessToken);
                this.setAuth(true);
                this.setMenuItems(response.data.user.role);
                this.setUser(response.data.user);

                console.log("ws создается в completeLogin")
                this.initWebSocket(`${URL}/ws`, response.data.user.id, response.data.user.role);
                this.fetchInitialWebSocketData();

                return { success: true, message: "Вход успешен", role: response.data.user.role }
            } catch (e) {
                const error = e as AxiosError<{ message: string }>;
                const errorMessage = error.response?.data?.message || "Ошибка при входе!";
                this.setError(errorMessage);
                return { success: false, message: errorMessage, role: undefined }
            }
        });
    }

    // Первый этап регистрации
    async registration(data: RegistrationData): Promise<boolean> {
        return this.withLoading(async () => {
            try {
                this.setError("");
                const response = await AuthService.registration(data);
                localStorage.setItem('tempToken', response.data.tempToken);
                return response.data.requiresTwoFactor;
            } catch (e) {
                const error = e as AxiosError<{ message: string }>;
                this.setError(error.response?.data?.message || "Ошибка при регистрации!");
                return false;
            }
        });
    }

    // Второй этап регистрации (регистрация в системе) (ТИП СДЕЛАТЬ)
    async completeRegistration(tempToken: string, TwoFactorCode: string) {
        return this.withLoading(async () => {
            if (tempToken === "") return { success: false, message: "Неизвестная ошибка при регистрации!" };
            try {
                this.setError("");
                const response = await AuthService.completeRegistration(tempToken, TwoFactorCode);
                localStorage.removeItem('tempToken');
                localStorage.setItem('accessToken', response.data.accessToken);
                this.setAuth(true);
                this.setMenuItems(response.data.user.role);
                this.setUser(response.data.user);

                console.log("ws создается в completeRegistration")
                this.initWebSocket(`${URL}/ws`, response.data.user.id, response.data.user.role);
                this.fetchInitialWebSocketData();

                return { success: true, message: "Регистрация прошла успешно!", role: response.data.user.role }
            } catch (e) {
                const error = e as AxiosError<{ message: string }>;
                const errorMessage = error.response?.data.message || "Ошибка при регистрации!";
                this.setError(errorMessage);
                return { success: false, message: errorMessage };
            }
        })
    }

    // Выход
    async logout(): Promise<void> {
        return this.withLoading(async () => {
            try {
                await AuthService.logout();
                localStorage.removeItem('token');
                console.log('ws отключается')
                this.closeWebSocket();
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

                console.log("Создание ws checkAuth")
                this.initWebSocket(`${URL}/ws`, response.data.user.id, response.data.user.role);
                this.fetchInitialWebSocketData();
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
    async getPatientData(id: number) {
        try {
            const response = await UserService.fetchPatientData(id);
            return response.data;
        } catch (e) {
            const error = e as AxiosError<TypeResponse>;
            this.setError(error.response?.data?.message || "Ошибка при получении данных пациента!");
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
    async updateUserData(data: IUserDataProfile | IAdminDataProfile | IUserDataProfileEdit, id: number): Promise<TypeResponse> {
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
            console.log(response.data)
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