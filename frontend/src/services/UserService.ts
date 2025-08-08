import $api from '../http'
import type { AxiosResponse } from "axios";
import type { IUserDataProfile, IUser } from "../models/Auth";

export default class UserService {
    static fetchPatientData(id: number): Promise<AxiosResponse<IUser>> {
        return $api.get<IUser>(`/patient/${id}`);
    }

    static fetchUserData(id: number): Promise<AxiosResponse<IUserDataProfile>> {
        return $api.get<IUserDataProfile>(`/user/${id}`);
    }

    static CheckUser(phone: string|null, email: string|null) {
        return $api.post<boolean>('/user/check/', {phone, email})
    }
}