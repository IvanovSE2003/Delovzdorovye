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

    static async getBasicDataAll(limit: number, page: number) {
        return $api.get(`/admin/basicData/all?page=${page}&limit=${limit}`);
    }

    static async confirmBasicData(id: number): Promise<AxiosResponse<TypeResponse>> {
        return $api.put<TypeResponse>(`/admin/basicData/confirm/${id}`);
    }

    static async rejectBasicData(id: number, message: string): Promise<AxiosResponse<TypeResponse>> {
        return $api.put<TypeResponse>(`/admin/basicData/reject/${id}`, {rejection_reason: message});
    }

    static async getProfDataAll(limit: number, page: number) {
        return $api.get(`/admin/profData/all?page=${page}&limit=${limit}`);
    }

    static async confirmProfData(id: number): Promise<AxiosResponse<TypeResponse>> {
        return $api.put<TypeResponse>(`/admin/profData/confirm/${id}`);
    }

    static async rejectProfData(id: number, message: string): Promise<AxiosResponse<TypeResponse>> {
        return $api.put<TypeResponse>(`/admin/profData/reject/${id}`, {rejection_reason: message});
    }

    static async getUsersAll(): Promise<AxiosResponse<User[]>> {
        return $api.get<User[]>('/admin/user/all');
    }

    static async userConsult(limit=10, page=1): Promise<AxiosResponse<UserConsult>> {
        return $api.get<UserConsult>(`/admin/userConsult/all?page=${page}&limit=${limit}`);
    } 

    static async getClientUsefulBlock(limit=10, page=1): Promise<AxiosResponse<getUsefulBlock[]>> {
        return $api.post<getUsefulBlock[]>('/admin/', {limit, page});
    }

    static async getSpecialistUsefulBlock(limit=10, page=1): Promise<AxiosResponse<getUsefulBlock[]>> {
        return $api.post<getUsefulBlock[]>('/admin/', {limit, page});
    }
}