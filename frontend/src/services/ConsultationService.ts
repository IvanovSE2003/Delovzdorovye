import type { AxiosResponse } from "axios";
import $api from "../http";
import type { TypeResponse } from "../models/response/DefaultResponse";
import type { OptionsResponse, OptionsResponse2, Slot } from "../store/consultations-store";

interface Consultation {
    id: number;
    consultation_status: string;
    payment_status: string;
    other_problem: string;
    recommendations: string;
    duration: number;
    score: number | null;
    comment: string | null;
    reservation_expires_at: string;
    userId: number;
    doctorId: number;
    timeSlotId: number;
}

interface ConsultationsResponse {
    consultations: Consultation[];
    totalCount: number;
    totalPages: number;
}

export interface SpecialistResponse {
    id: number;
    user: {
        id: number;
        name: string;
        surname: string;
        patronymic?: string;
    }
}

export default class ConsultationService {
    static async getProblems(): Promise<AxiosResponse<OptionsResponse[]>> {
        return $api.get<OptionsResponse[]>('/consultation/problem/all');
    }


    static async getSpecialists(problems: number[]): Promise<AxiosResponse<SpecialistResponse[]>> {
        return $api.post<SpecialistResponse[]>('/consultation/specialist/all', { problems });
    }

    // static async findDays(problems: number[]): Promise<AxiosResponse<TypeResponse>> {
    //     return $api.post<TypeResponse>('consultation/findDay', problems);
    // }

    static async getSchedule(doctorId: number) {
        return $api.get<Slot[]>(`/schedule/${doctorId}`);
    }

    static async getAllConsultions(
        limit = 10,
        page = 1,
        filters: {
            userId?: number,
            payment_status?: string;
            consultation_status?: "UPCOMING" | "ARCHIVE";
        }
    ): Promise<AxiosResponse<ConsultationsResponse>> {
        return $api.post<ConsultationsResponse>('/consultation/all', { limit, page, filters })
    }
}