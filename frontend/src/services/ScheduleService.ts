import type { AxiosResponse } from "axios";
import $api from "../http";
import type { TypeResponse } from "../models/response/DefaultResponse";
import type { ISchedules } from "../models/Schedules";
import type { IScheduleCreate, ISlotCreate } from "../pages/account/doctor/TimeSheet/TimeSheet";


export default class ScheduleService {
    static getSchedules(id: number, linkerId: number) {
        return $api.get<ISchedules[]>(`/schedule/doctor?userId=${id}&userIdLinker=${linkerId}`);
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

    static deleteSlot(id: number): Promise<void> {
        return $api.delete(`/schedule/timeSlot/delete/${id}`);
    }

    static getScheduleWeek(start: string, end: string, userId: number) {
        return $api.get(`/schedule/getBetweenSchedule?startDate=${start}&endDate=${end}&userId=${userId}`);
    }
    
    static setSchuduleDay(time: string|string[], date: string, userId: number, dayWeek: number): Promise<AxiosResponse<TypeResponse>>{
        return $api.post<TypeResponse>(`/schedule/createWithRepetitions`, {time, date, userId, dayWeek});
    }

    static setSchuduleDayRecurning(time: string|string[], date: string, dayWeek: number, userId: number) {
        return $api.post('/schedule/timeSlot/create/recurning', {time, date, dayWeek, userId});
    }
}