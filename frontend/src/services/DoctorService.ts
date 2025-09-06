import type { AxiosResponse } from "axios";
import $api from "../http";
import type { IDoctor } from "../pages/account/patient/Specialists/Specialists";

export type SpecializationResponse = {
    id: number;
    name: string;
}


export default class DoctorService {
    static async getDoctorInfo(id: number): Promise<AxiosResponse<IDoctor>> {
        return $api.get<IDoctor>(`/doctor/${id}`);
    }

    static async getSpecializations(): Promise<AxiosResponse<SpecializationResponse[]>> {
        return $api.get<SpecializationResponse[]>('/specialization/all');
    }
}