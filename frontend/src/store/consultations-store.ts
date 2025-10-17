import { makeAutoObservable } from "mobx";
import ConsultationService from "../services/ConsultationService";
import { AxiosError } from "axios";
import type { TypeResponse } from "../models/response/DefaultResponse";

export interface OptionsResponse {
    value: number;
    label: string;
}

export type OptionsResponse2 = {
    id: number;
    name: string;
    specialization: string;
};

export interface Slot {
    date: string;
    dayWeek?: number;
    time: string;
    doctorId: number;
    status: "BOOKED" | "OPEN" | "CLOSED";
}

export interface AppointmentRequest {
    userId: string;
    time: string;
    problems: number[];
    date: string;
    otherProblem?: string;
}

export interface AppointmentResponse {
    id: number;
    consultation_status: string;
    payment_status: string;
    other_problem: string | null;
    recommendations: string | null;
    duration: number;
    score: number | null;
    comment: string | null;
    reservation_expires_at: string;
    userId: number;
    doctorId: number;
    timeSlotId: number;
}

export default class ConsultationsStore {
    constructor() {
        makeAutoObservable(this);
    }

    // Получаем все проблемы в базе данных
    async getProblems(): Promise<OptionsResponse[]> {
        try {
            const response = await ConsultationService.getProblems();
            return response.data;
        } catch (e) {
            console.error("Ошибка при получении проблем: ", e);
            return [];
        }
    }

    // Получаем специалистов, связанных с проблемами
    async findSpecialists(problems: number[]): Promise<OptionsResponse[]> {
        try {
            const response = await ConsultationService.getSpecialists(problems);
            return response.data;
        } catch (e) {
            const error = e as AxiosError<TypeResponse>;
            console.error("Ошибка при поиске специалистов: ", error.response?.data.message);
            return [] as OptionsResponse[];
        }
    }

    // Получаем расписание врача
    async getSchedule(doctorId: number, linkerId: number): Promise<Slot[]> {
        try {
            const response = await ConsultationService.getSchedule(doctorId, linkerId);
            return response.data;
        } catch (e) {
            console.error(`Ошибка при загрузке рассписания врача ${doctorId}:`, e);
            return [];
        } 
    }

    // Собираем все расписания специалистов для проблем
    async getSchedulesByProblems(problemIds: number[], linkerId: number): Promise<Slot[]> {
        const specialists = await this.findSpecialists(problemIds);
        let slots: Slot[] = [];

        for (const doc of specialists) {
            const docSlots = await this.getSchedule(doc.value, linkerId);
            slots = slots.concat(docSlots.map(s => ({ ...s, doctorId: doc.value })));
        }

        return slots;
    }

    // Получение временных ячеек если пользователь выбрал "Другая проблема"
    async findSheduleSpecialist(linkerId: number):Promise<Slot[]> {
        try {
            const response = await ConsultationService.findSheduleSpecialist(linkerId);
            return response.data;
        } catch(e) {
            return [] as Slot[];
        }
    }

    // Удаление проблемы
    async deleteProblem(id: number): Promise<void> {
        try {
            await ConsultationService.deleteProblem(id);
        } catch (e) {
            console.error(`Ошибка при удалении проблемы:`, e);
        }
    }

    // Изменение проблемы
    async updateProblem(id: number, newData: string) {
        try {
            await ConsultationService.updateProblem(id, newData);
        } catch (e) {
            console.error(`Ошибка при изменении проблемы:`, e);
        }
    }

    // Создание проблемы
    async createProblem(newData: string) {
        try {
            await ConsultationService.createProblem(newData);
        } catch (e) {
            console.error("Ошибка при создании проблемы: ", e);
        }
    }
} 