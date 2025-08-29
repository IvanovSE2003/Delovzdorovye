import type { AxiosResponse } from "axios";
import $api from "../http";
import type { TypeResponse } from "../models/response/DefaultResponse";
import type { ProblemsResponse } from "../store/consultations-store";

export default class ConsultationService {
    static async getProblems(): Promise<AxiosResponse<ProblemsResponse[]>> {
        return $api.get<ProblemsResponse[]>('/consultation/problem/all');
    }

    static async findDays(problems: number[]): Promise<AxiosResponse<TypeResponse>> {
        return $api.post<TypeResponse>('consultation/findDay', problems);
    }
}