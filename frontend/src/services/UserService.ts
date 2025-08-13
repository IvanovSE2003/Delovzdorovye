import $api from '../http'
import type { AxiosResponse } from "axios";
import type { IUserDataProfile, IUser, TypeResponse, TypeResponseToken } from "../models/Auth";

export default class UserService {

    // Получение данные о пациенте
    static fetchPatientData(id: number): Promise<AxiosResponse<IUser>> {
        return $api.get<IUser>(`/patient/${id}`);
    }

    // Проверка пользователя на сущестование в БД
    static CheckUser(creditial: string):Promise<AxiosResponse<TypeResponse>> {
        return $api.post<TypeResponse>('/user/check/', {creditial});
    }

    // Получение данных о побозователе
    static fetchUserData(id: number): Promise<AxiosResponse<IUserDataProfile>> {
        return $api.get<IUserDataProfile>(`/user/${id}`);
    }

    // Изменение данные о пользователе
    static updateUserData(data: IUserDataProfile, id: number): Promise<AxiosResponse<TypeResponse & {user: IUser}>> {
        return $api.put<TypeResponse & {user: IUser}>(`/user/${id}`, { data });
    }

    // Отправка сообщения на почту об активации аккаунта
    static sendActivate(email: string): Promise<AxiosResponse<TypeResponse>> {
        return $api.post<TypeResponse>('user/sendActivationEmail', { email });
    }

    static getTokenTg(id: number): Promise<AxiosResponse<TypeResponseToken>> {
        return $api.post<TypeResponseToken>(`user/activateLinkTg/${id}`)
    }
}