import { makeAutoObservable } from "mobx";
import ConsultationService, { type SpecialistResponse } from "../services/ConsultationService";

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
    date: string;   // "2025-09-05"
    time: string;   // "10:00"
    doctorId: number;
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
    async findSpecialists(problems: number[]): Promise<SpecialistResponse[]> {
        try {
            const response = await ConsultationService.getSpecialists(problems);
            return response.data;
        } catch (e) {
            console.error("Ошибка при поиске специалистов: ", e);
            return [];
        }
    }

    // Получаем расписание врача
    async getSchedule(doctorId: number): Promise<Omit<Slot, "doctorId">[]> {
        try {
            const response = await ConsultationService.getSchedule(doctorId);
            return response.data;
        } catch (e) {
            console.error(`Ошибка при загрузке рассписания врача ${doctorId}:`, e);
            return [];
        }
    }

    // Собираем все расписания специалистов для проблем
    async getSchedulesByProblems(problemIds: number[]): Promise<Slot[]> {
        const specialists = await this.findSpecialists(problemIds);
        let slots: Slot[] = [];

        for (const doc of specialists) {
            const docSlots = await this.getSchedule(doc.id);
            slots = slots.concat(docSlots.map(s => ({ ...s, doctorId: doc.id })));
        }

        return slots;
    }

    // async findDays(problems: number[]): Promise<TypeResponse> {
    //     let response;
    //     try {
    //         response = await ConsultationService.findDays(problems);
    //         return response.data;
    //     } catch (e) {
    //         return { success: false, message: response?.data?.message||""}
    //     }
    // }
} 