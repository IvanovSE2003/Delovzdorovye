import $api from '../http'
import type { AxiosResponse } from "axios";
import type { IUserDataProfile, IUser, TypeResponse} from "../models/Auth";

export default class UserService {

    // Получение данные о пациенте
    static fetchPatientData(id: number): Promise<AxiosResponse<IUser>> {
        return $api.get<IUser>(`/patient/${id}`);
    }

    // Проверка пользователя на сущестование в БД
    static CheckUser(phone: string|null, email: string|null):Promise<AxiosResponse<TypeResponse>> {
        return $api.post<TypeResponse>('/user/check/', {phone, email})
    }

    // Получение данных о побозователе
    static fetchUserData(id: number): Promise<AxiosResponse<IUserDataProfile>> {
        return $api.get<IUserDataProfile>(`/user/${id}`);
    }

    // Изменение данные о пользователе
    static updateUserData(data: IUserDataProfile, id: number): Promise<AxiosResponse<TypeResponse>> {
        return $api.put<TypeResponse>(`/user/${id}`, { data });
    }

    // Отправка сообщения на почту об активации аккаунта
    static sendActivate(email: string): Promise<AxiosResponse<TypeResponse>> {
        return $api.post<TypeResponse>('user/sendActivationEmail', { email });
    }
}