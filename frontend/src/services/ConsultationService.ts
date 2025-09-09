import type { AxiosResponse } from "axios";
import $api from "../http";
import type { AppointmentResponse, OptionsResponse, Slot } from "../store/consultations-store";
import type { Consultation } from "../features/account/UpcomingConsultations/UpcomingConsultations";
import type { ConsultationData } from "../components/UI/Modals/EditModal/EditModal";


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

    static async getSchedule(doctorId: number, linkerId: number) {
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

    static async getAllConsultions(
        limit = 10,
        page = 1,
        filters: {
            userId?: string,
            doctorId?: string,
            payment_status?: string,
            consultation_status?: "UPCOMING" | "ARCHIVE",
        }
    ): Promise<AxiosResponse<ConsultationsResponse>> {
        return $api.post<ConsultationsResponse>('/consultation/all', { limit, page, filters })
    }

    // Создание консультации
    static async createAppointment(data: ConsultationData): Promise<AxiosResponse<AppointmentResponse>> {
        return $api.post<AppointmentResponse>('/consultation/appointment', data);
    }

    // Перенос консультации
    static async shiftAppointment(data: ConsultationData) : Promise<AxiosResponse<AppointmentResponse>> {
        return $api.post<AppointmentResponse>(`/consultation/resheduleConsultation/${data.id}`, {
            date: data.date, time: data.time, userId: data.userId, doctorId: data.doctorId
        });
    }

    // Отмена консультации
    // static async cancelAppointment(reason: string, id: number) : Promise<AxiosResponse<>> {
    //     return $api.post('/consultation/appoinment/cancel', {reason, id});
    // }

    // Редактирование консультации
    // static async editAppointment(newData: ConsultationData) : Promise<AxiosResponse<>> {
    //     return $api.put('/consultation/appoinment/edit', newData);
    // }

    // Повторить консультацию
    // static async repeatAppointment(data: ConsultationData) : Promise<AxiosResponse<>> {
    //     return $api.post('/consultation/appoinment/repeat', data);
    // }

    // Оценить консультацию
    // static async rateAppointment(score: number, id: number) : Promise<AxiosResponse<>> {
    //     return $api.post('/consultation/appoinment/rate', {score, id});
    // }
}