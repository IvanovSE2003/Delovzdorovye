import { makeAutoObservable } from "mobx";
import type { IUser, LoginData } from "../models/IUser";
import AuthService from "../services/AuthService";
import UserService from "../services/UserService";
import type { AxiosError } from "axios";

export default class Store {
    user = {} as IUser;
    isAuth = false;

    constructor() {
        makeAutoObservable(this);
    }

    setAuth(bool: boolean) {
        this.isAuth = bool;
    }

    setUser(user: IUser) {
        this.user = user;
    }

    async login(data: LoginData) {
        try {
            const response = await AuthService.login(data);
            console.log(response.data)
            localStorage.setItem('token', response.data.accessToken);
            this.setAuth(true);
            this.setUser(response.data.user);
        } catch (e) {
            const error = e as AxiosError<{ message: string }>;
            console.log(error.response?.data?.message);
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
}