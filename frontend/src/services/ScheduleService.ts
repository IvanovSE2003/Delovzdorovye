import type { AxiosResponse } from "axios";
import $api from "../http";
import type { TypeResponse } from "../models/response/DefaultResponse";
import type { ISchedules } from "../models/Schedules";


export default class ScheduleService {
    static getSchedules(id: number) {
        return $api.get<ISchedules[]>(`/schedule/${id}`)
    }

    static addDay() {
        return $api.post('/schedule/')
    }

    static deleteDay(id: number): Promise<AxiosResponse<TypeResponse>> {
        return $api.delete<TypeResponse>(`/schedule/${id}`);
    }

    static addSlot() {
        return $api.post('/schedule/');
    }

    static deleteSlot(id: number): Promise<AxiosResponse<TypeResponse>> {
        return $api.delete<TypeResponse>(`/schedule/${id}`);
    }
}