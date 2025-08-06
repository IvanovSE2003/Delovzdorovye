import $api from '../http'
import type { AxiosResponse } from "axios";
import type { IUser } from "../models/Auth";

export default class UserService {
    static fetchPatientData(id: number): Promise<AxiosResponse<IUser>> {
        return $api.get<IUser>(`/patient/${id}`);
    }

    static CheckUser(phone: string|null, email: string|null) {
        return $api.post<boolean>('/user/check/', {phone, email})
    }
}