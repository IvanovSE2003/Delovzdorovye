import type { AxiosResponse } from "axios";
import $api from "../http";
import type { AppointmentResponse, OptionsResponse, Slot } from "../store/consultations-store";
import type { TypeResponse } from "../models/response/DefaultResponse";
import type { Consultation } from "../models/consultations/Consultation";
import type { ConsultationData } from "../models/consultations/ConsultationData";


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

    //---------------------------РАСПИСАНИЕ-------------------------------
    // Получить всех специалистов по проблемами
    static async getSpecialists(problems: number[]): Promise<AxiosResponse<OptionsResponse[]>> {
        return $api.get<OptionsResponse[]>("/consultation/specialistForProblems", {
            params: { problems },
            paramsSerializer: {
                indexes: null,
            },
        });
    }

    //Получение расписание доктора
    static async getSchedule(doctorId: number, linkerId: number): Promise<AxiosResponse<Slot[]>> {
        return $api.get<Slot[]>(`/schedule/findSchedule?doctorId=${doctorId}&linkerId=${linkerId}`);
    }

    static async findSheduleSpecialist(userId: number): Promise<AxiosResponse<Slot[]>> {
        return $api.get<Slot[]>(`/schedule/findSheduleSpecialist/${userId}`);
    }

    //-----------------------------ПРОБЛЕМЫ----------------------------------

    // Получить проблему
    static async getProblems(): Promise<AxiosResponse<OptionsResponse[]>> {
        return $api.get<OptionsResponse[]>('/consultation/problem/all');
    }

    // Удалить проблему
    static async deleteProblem(id: number): Promise<AxiosResponse<void>> {
        return $api.delete(`/consultation/problem/${id}`);
    }

    // Изменить проблему
    static async updateProblem(id: number, newData: string): Promise<AxiosResponse<void>>  {
        return $api.put(`/consultation/problem/${id}`, { name: newData });
    }

    // Создать проблему
    static async createProblem(newData: string): Promise<AxiosResponse<void>>  {
        return $api.post('/consultation/problem/create', { name: newData });
    }


    //----------------------------КОНСУЛЬТАЦИИ---------------------------------
    // Получение всех консультаций по фильтру
    static async getAllConsultations(
        limit = 10,
        page = 1,
        filters: {
            date?: string;
            userId?: number;
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

    // static async createSpecificConsultation(data: ConsultationData) {
    //     return $api.post(`/otherProblem/create`, 
    //         {textOtherProblem: data.otherProblemText, time: data.time, date: data.date, userId: data.userId}
    //     )
    // }

    // Перенос консультации
    static async shiftAppointment(data: ConsultationData): Promise<AxiosResponse<TypeResponse>> {
        return $api.post<TypeResponse>(`/consultation/resheduleConsultation/${data.id}`, {
            date: data.date, time: data.time, userId: data.userId, doctorId: data.doctorId
        });
    }

    // Отмена консультации
    static async cancelAppointment(reason: string, id: number, userId: number): Promise<AxiosResponse<TypeResponse>> {
        return $api.post<TypeResponse>(`consultation/cancelConsultation/${id}`, { reason, userId });
    }

    // Повторить консультацию
    static async repeatAppointment(data: ConsultationData): Promise<AxiosResponse<TypeResponse>> {
        return $api.post<TypeResponse>(`/consultation/repeatConsultation/${data.id}`, { date: data.date, time: data.time, descriptionProblem: data.descriptionProblem });
    }

    // Оценить консультацию
    static async rateAppointment(id: number, score: number, review: string): Promise<AxiosResponse<TypeResponse>> {
        return $api.post<TypeResponse>(`consultation/rating/create/${id}`, { rating: score, comment: review });
    }

    // Редактирование консультации
    static async editAppointment(newData: ConsultationData): Promise<AxiosResponse<TypeResponse>> {
        return $api.put<TypeResponse>(`/consultation/update/${newData.id}`, {
            time: newData.time,
            date: newData.date,
            descriptionProblem: newData.descriptionProblem,
            doctorId: newData.doctorId,
            problems: newData.problems
        });
    }

    // ----------------------------ВИДЕОКОНФЕРЕНЦИЯ------------------------------
    static async createConsultation(consultationId: number) {
        return $api.post(`/room/${consultationId}`);
    }

    static createRoom = async (consultationId: number, userId: number, userRole: string) => {
        const response = await $api.post(`/conference/room/${consultationId}`, { userId, userRole });
        return response.data;
    };

    static startRoom = async (consultationId: number, userId: number, userRole: string) => {
        const response = await $api.post(`/conference/room/${consultationId}/start`, { userId, userRole });
        return response.data;
    };

    static endRoom = async (consultationId: number, userId: number, userRole: string) => {
        const response = await $api.post(`/conference/room/${consultationId}/end`, { userId, userRole });
        return response.data;
    };

    static getParticipants = async (consultationId: number) => {
        const response = await $api.get(`/conference/room/${consultationId}/participants`);
        return response.data.participants;
    };

    static joinRoom(consultationId: number, userId: number, userRole: string) {
        return $api.post(`/conference/room/${consultationId}/participants`, { userId, userRole });
    }

    static async getRooms(): Promise<{ roomId: string; consultationId: number }[]> {
        const response = await $api.get("/conference/rooms");
        return response.data.rooms;
    }

    static leaveRoom = (roomId: number, userId: number) => {
        return $api.post(`/conference/room/${roomId}/leave`, { userId });
    };

}