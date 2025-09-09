import type { AxiosResponse } from "axios";
import $api from "../http";
import type { IDoctor } from "../pages/account/patient/Specialists/Specialists";
import type { Specializations } from "../pages/account/admin/EditUsefulInformations/SpecializationsTab";

export default class DoctorService {
    static async getDoctorInfo(id: number): Promise<AxiosResponse<IDoctor>> {
        return $api.get<IDoctor>(`/doctor/${id}`);
    }

    static async saveChangeDoctorInfo(id: number, data: FormData) {
        return $api.put(`doctor/${id}`, data);
    }

    static async getSpecializations(): Promise<AxiosResponse<Specializations[]>> {
        return $api.get<Specializations[]>('/specialization/all');
    }

    static async updateSpecialization(id: number, name: string): Promise<AxiosResponse<Specializations>>{
        return $api.put<Specializations>(`/specialization/${id}`, {name})
    }

    static async createSpecialization(name: string): Promise<AxiosResponse<Specializations>>{
        return $api.post<Specializations>('/specialization/create', {name});
    }

    static async deleteSpecialization(id: number): Promise<void> {
        $api.delete(`/specialization/${id}`)
    }
}