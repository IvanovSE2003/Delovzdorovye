import type { AxiosResponse } from "axios";
import $api from "../http";
import type { AppointmentRequest, AppointmentResponse, OptionsResponse, Slot } from "../store/consultations-store";
import type { Consultation } from "../features/account/UpcomingConsultations/UpcomingConsultations";


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
        return $api.post<SpecialistResponse[]>('/consultation/specialistForProblems', { problems });
    }

    static async getSchedule(id: number) {
        return $api.post<Slot[]>(`/consultation/findSchedule`, { id });
    }

    static async createAppointment(data: AppointmentRequest): Promise<AxiosResponse<AppointmentResponse>> {
        return $api.post('/consultation/appointment', { userId: data.userId, time: data.time, problems: data.problems, date: data.date });
    }

    static async deleteProblem(id: number) {
        return $api.delete(`/consultation/problem/${id}`);
    }

    static async updateProblem(id: number, newData: string) {
        return $api.put(`/consultation/problem/${id}`, {name: newData});
    }

    static async createProblem(newData: string) {
        return $api.post('/consultation/problem/create', { name: newData });
    }

    static async getAllConsultions(
        limit = 10,
        page = 1,
        filters: {
            userId?: string,
            payment_status?: string;
            consultation_status?: "UPCOMING" | "ARCHIVE";
        }
    ): Promise<AxiosResponse<ConsultationsResponse>> {
        return $api.post<ConsultationsResponse>('/consultation/all', { limit, page, filters })
    }
}