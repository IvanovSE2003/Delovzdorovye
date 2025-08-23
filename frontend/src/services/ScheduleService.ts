import type { AxiosResponse } from "axios";
import $api from "../http";
import type { TypeResponse } from "../models/response/DefaultResponse";
import type { ISchedules } from "../models/Schedules";
import type { IScheduleCreate, ISlotCreate } from "../pages/account/doctor/TimeSheet/TimeSheet";


export default class ScheduleService {
    static getSchedules(id: number) {
        return $api.get<ISchedules[]>(`/schedule/${id}`);
    }

    static addDay(data: IScheduleCreate): Promise<void> {
        return $api.post('/schedule/create', { data });
    }

    static deleteDay(id: number|undefined): Promise<AxiosResponse<TypeResponse>> {
        return $api.delete<TypeResponse>(`/schedule/delete/${id}`);
    }

    static addSlot(data: ISlotCreate) {
        return $api.post('/schedule/createTimeSlot', { data });
    }

    static deleteSlot(id: number): Promise<AxiosResponse<TypeResponse>> {
        return $api.delete<TypeResponse>(`/schedule/deleteTimeSlot/${id}`);
    }
}