import type { AxiosResponse } from "axios";
import $api from "../http";
import type { AppointmentResponse, OptionsResponse, Slot } from "../store/consultations-store";
import type { Consultation } from "../features/account/UpcomingConsultations/UpcomingConsultations";
import type { ConsultationData } from "../components/UI/Modals/EditModal/EditModal";
import type { TypeResponse } from "../models/response/DefaultResponse";


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

    static async getSchedule(doctorId: number, linkerId: number): Promise<AxiosResponse<Slot[]>> {
        return $api.get<Slot[]>(`/schedule/findSchedule?doctorId=${doctorId}&linkerId=${linkerId}`);
    }

    static async deleteProblem(id: number) {
        return $api.delete(`/consultation/problem/${id}`);
    }

    static async updateProblem(id: number, newData: string) {
        return $api.put(`/consultation/problem/${id}`, { name: newData });
    }

    static async createProblem(newData: string) {
        return $api.post('/consultation/problem/create', { name: newData });
    }

    static async getAllConsultations(
        limit = 10,
        page = 1,
        filters: {
            date?: string;
            userId?: string;
            doctorId?: string;
            doctorUserId?: number;
            payment_status?: string;
            consultation_status?: "UPCOMING" | "ARCHIVE";
        } = {}
    ): Promise<AxiosResponse<ConsultationsResponse>> {
        const params: Record<string, string | number> = {
            page,
            limit,
        };

        if (filters.date) params.date = filters.date;
        if (filters.userId) params.userId = filters.userId;
        if (filters.doctorId) params.doctorId = filters.doctorId;
        if (filters.doctorUserId) params.doctorUserId = filters.doctorUserId;
        if (filters.payment_status) params.payment_status = filters.payment_status;
        if (filters.consultation_status) params.consultation_status = filters.consultation_status;


        return $api.get<ConsultationsResponse>("/consultation/all", { params });
    }


    // Создание консультации
    static async createAppointment(data: ConsultationData): Promise<AxiosResponse<AppointmentResponse>> {
        return $api.post<AppointmentResponse>('/consultation/appointment', data);
    }

    // Перенос консультации
    static async shiftAppointment(data: ConsultationData): Promise<AxiosResponse<TypeResponse>> {
        return $api.post<TypeResponse>(`/consultation/resheduleConsultation/${data.id}`, {
            date: data.date, time: data.time, userId: data.userId, doctorId: data.doctorId
        });
    }

    // Отмена консультации
    static async cancelAppointment(reason: string, id: number): Promise<AxiosResponse<TypeResponse>> {
        return $api.post<TypeResponse>(`consultation/cancelConsultation/${id}`, { reason });
    }

    // Редактирование консультации
    // static async editAppointment(newData: ConsultationData) : Promise<AxiosResponse<>> {
    //     return $api.put('/consultation/appoinment/edit', newData);
    // }

    // Повторить консультацию
    static async repeatAppointment(data: ConsultationData): Promise<AxiosResponse<TypeResponse>> {
        return $api.post<TypeResponse>(`/consultation/repeatConsultation/${data.id}`, { date: data.date, time: data.time });
    }

    // Оценить консультацию
    static async rateAppointment(id: number, score: number, review: string): Promise<AxiosResponse<TypeResponse>> {
        return $api.post<TypeResponse>(`consultation/rating/create/${id}`, { rating: score, comment: review });
    }
}