import $api from '../http'
import type { AxiosResponse } from "axios";
import type { IUser } from "../models/IUser";

export default class UserService {
    static fetchUserData(id: number): Promise<AxiosResponse<IUser>> {
        return $api.get<IUser>(`/user/:${id}`);
    }

    static CheckUser(phone: string|null, email: string|null) {
        return $api.post<boolean>('/user/check/', {phone, email})
    }
}