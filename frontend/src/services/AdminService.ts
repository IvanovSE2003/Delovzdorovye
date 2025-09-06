import type { AxiosResponse } from "axios";
import $api from "../http";
import type { TypeResponse } from "../models/response/DefaultResponse";
import type { User } from "../models/Auth";
import type { UserCon } from "../pages/account/admin/MakeConsultation/MakeConsultation";

interface UserConsult {
    users: UserCon[];
    totalCount: number;
    totalPages: number;
}

interface getUsefulBlock {
    id: number;
    header: string;
    text: string;
}


export default class AdminService {

    static async getBatchAll(limit: number, page: number) {
        return $api.post('/admin/all', { limit, page });
    }

    static async confirmChange(id: number): Promise<AxiosResponse<TypeResponse>> {
        return $api.put<TypeResponse>(`/admin/confirm/${id}`);
    }

    static async rejectChange(id: number, message: string): Promise<AxiosResponse<TypeResponse>> {
        return $api.put<TypeResponse>(`/admin/reject/${id}`, {rejection_reason: message});
    }

    static async getUsersAll(): Promise<AxiosResponse<User[]>> {
        return $api.get<User[]>('/admin/get-all-user');
    }

    static async userConsult(limit=10, page=1): Promise<AxiosResponse<UserConsult>> {
        return $api.post<UserConsult>('/admin/userConsult/all', {limit, page});
    } 

    static async getClientUsefulBlock(limit=10, page=1): Promise<AxiosResponse<getUsefulBlock[]>> {
        return $api.post<getUsefulBlock[]>('/admin/', {limit, page});
    }

    static async getSpecialistUsefulBlock(limit=10, page=1): Promise<AxiosResponse<getUsefulBlock[]>> {
        return $api.post<getUsefulBlock[]>('/admin/', {limit, page});
    }
}