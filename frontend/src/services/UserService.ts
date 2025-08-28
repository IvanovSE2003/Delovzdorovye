import $api from '../http'
import type { AxiosResponse } from "axios";
import type { IUserDataProfile, IUser, IAdminDataProfile } from "../models/Auth";
import type { TypeResponse } from '../models/response/DefaultResponse';
import type { PatientData } from '../models/PatientData';

export default class UserService {

    // Получение данные о пациенте
    static fetchPatientData(id: number): Promise<AxiosResponse<PatientData>> {
        return $api.get<PatientData>(`/patient/${id}`);
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
    static updateUserData(data: IUserDataProfile|IAdminDataProfile, id: number): Promise<AxiosResponse<TypeResponse & {user: IUser}>> {
        return $api.put<TypeResponse & {user: IUser}>(`/user/${id}`, { data });
    }

    // Отправка сообщения на почту об активации аккаунта
    static sendActivate(email: string): Promise<AxiosResponse<TypeResponse>> {
        return $api.post<TypeResponse>('user/sendActivationEmail', { email });
    }

    static getTokenTg(id: number): Promise<AxiosResponse<TypeResponse>> {
        return $api.post<TypeResponse>(`user/activateLinkTg/${id}`)
    }

    static uploadAvatar(formData: FormData): Promise<AxiosResponse<IUserDataProfile>> {
        return $api.post<IUserDataProfile>('/user/upload-avatar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }

    static removeAvatar(id: number): Promise<AxiosResponse<IUserDataProfile>> {
        return $api.post<IUserDataProfile>(`/user/delete-avatar`, {userId: id});
    }

    static blockUser(id: number): Promise<AxiosResponse<TypeResponse>> {
        return $api.post<TypeResponse>('/user/block-account', {userId: id});
    }

    static async unblockUser(id: number): Promise<AxiosResponse<TypeResponse>> {
        return $api.post<TypeResponse>('/user/unblock-account', {userId: id});
    }

    static async changeRoleUser(id: number, newRole: string): Promise<AxiosResponse<TypeResponse>> {
        return $api.post<TypeResponse>('/user/change-role', { userId: id, newRole})
    }
}