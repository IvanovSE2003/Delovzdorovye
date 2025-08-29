import { makeAutoObservable } from "mobx";
import type { TypeResponse } from "../models/response/DefaultResponse";
import ConsultationService from "../services/ConsultationService";

export interface ProblemsResponse {
    value: number;
    label: string;
}

export default class ConsultationsStore {
    constructor() {
        makeAutoObservable(this);
    }

    async getProblems(): Promise<ProblemsResponse[]> {
        try {
            const response = await ConsultationService.getProblems();
            return response.data;
        } catch (e) {
            return [];
        }
    }

    async findDays(problems: number[]): Promise<TypeResponse> {
        let response;
        try {
            response = await ConsultationService.findDays(problems);
            return response.data;
        } catch (e) {
            return { success: false, message: response?.data.message }
        }
    }
} 