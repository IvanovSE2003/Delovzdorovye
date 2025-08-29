import type { AxiosResponse } from "axios";
import $api from "../http";
import type { TypeResponse } from "../models/response/DefaultResponse";
import type { OptionsResponse } from "../store/consultations-store";

export default class ConsultationService {
    static async getProblems(): Promise<AxiosResponse<OptionsResponse[]>> {
        return $api.get<OptionsResponse[]>('/consultation/problem/all');
    }

    static async getSpecialists(): Promise<AxiosResponse<OptionsResponse[]>> {
        return $api.get<OptionsResponse[]>('/consultations/specialist/all');
    }

    static async findDays(problems: number[]): Promise<AxiosResponse<TypeResponse>> {
        return $api.post<TypeResponse>('consultation/findDay', problems);
    }
}