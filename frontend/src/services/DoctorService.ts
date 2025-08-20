import type { AxiosResponse } from "axios";
import $api from "../http";

export interface DoctorResponse{
    id: number,
    specialization: string,
    experienceYears: number,
    diploma: string,
    license: string,
    isActivated: boolean, 
    userId: number
}

export default class DoctorService {
    static async getDoctorInfo(id: number): Promise<AxiosResponse<DoctorResponse>> {
        return $api.get<DoctorResponse>(`/doctor/${id}`);
    }
}