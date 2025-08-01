import $api from '../http'
import type { AxiosResponse } from "axios";
import type { IUser } from "../models/IUser";

export default class UserService {
    static fetchUserData(id: number): Promise<AxiosResponse<IUser>> {
        return $api.get<IUser>(`/user/:${id}`);
    }

    static CheckUser(phoneOrEmail: string): Promise<AxiosResponse<boolean>> {
        return $api.post<boolean>('check/', phoneOrEmail)
    }
}