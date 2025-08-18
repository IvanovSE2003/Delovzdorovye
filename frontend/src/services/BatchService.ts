import type { AxiosResponse } from "axios";
import $api from "../http";
import type { TypeResponse } from "../models/response/DefaultResponse";
import type { User } from "../models/Auth";



export default class BatchService {

    static async getBatchAll(limit: number, page: number) {
        return $api.post('/batch/all', { limit, page });
    }

    static async confirmChange(id: number): Promise<AxiosResponse<TypeResponse>> {
        return $api.put<TypeResponse>(`/batch/confirm/${id}`);
    }

    static async rejectChange(id: number, message: string): Promise<AxiosResponse<TypeResponse>> {
        return $api.put<TypeResponse>(`/batch/reject/${id}`, {rejection_reason: message});
    }

    static async getUsersAll(): Promise<AxiosResponse<User[]>> {
        return $api.get<User[]>('/batch/get-all-user');
    }
}