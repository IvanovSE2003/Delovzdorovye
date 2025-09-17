import type { AxiosResponse } from "axios";
import $api from "../http";
import type { TypeResponse } from "../models/response/DefaultResponse";
import type { IDoctor } from "../models/IDoctor";

export interface Specializations {
    id: number;
    name: string;
}

export default class DoctorService {
    static async getDoctorInfo(id: number): Promise<AxiosResponse<IDoctor>> {
        return $api.get<IDoctor>(`/doctor/${id}`);
    }

    static async deleteProfInfo(userId: number, formData: FormData): Promise<AxiosResponse<TypeResponse>> {
        return $api.put<TypeResponse>(`/doctor/${userId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }

    static async addProfInfo(userId: number, formData: FormData): Promise<AxiosResponse<TypeResponse>> {
        return $api.put<TypeResponse>(`/doctor/${userId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }

    static async getAllDoctors(page: number, limit: number) {
        return $api.get('/doctor/all');
    }

    static async getSpecializations(): Promise<AxiosResponse<Specializations[]>> {
        return $api.get<Specializations[]>('/specialization/all');
    }

    static async updateSpecialization(id: number, name: string): Promise<AxiosResponse<Specializations>> {
        return $api.put<Specializations>(`/specialization/${id}`, { name })
    }

    static async createSpecialization(name: string): Promise<AxiosResponse<Specializations>> {
        return $api.post<Specializations>('/specialization/create', { name });
    }

    static async deleteSpecialization(id: number): Promise<void> {
        $api.delete(`/specialization/${id}`)
    }
}