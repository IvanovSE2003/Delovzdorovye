import TimeSlotsArray from "../../../infrastructure/web/types/timeSlot.type.js";
import DoctorSchedule from "../entities/doctorSchedule.entity.js";

export default interface DoctorScheduleRepository {
    findByDoctorId(scheduleId: number): Promise<DoctorSchedule[] | null>;
    findById(scheduleId: number): Promise<DoctorSchedule | null>;
    findByDate(doctorId: number, date: Date | string): Promise<DoctorSchedule | null>;
    getBetweenSchedule(startDate: string, endDate: string): Promise<DoctorSchedule[]>;
    update(schedule: DoctorSchedule): Promise<DoctorSchedule>;
    create(schedule: DoctorSchedule): Promise<DoctorSchedule>;
    save(schedule: DoctorSchedule): Promise<DoctorSchedule>;
    delete(id: number): Promise<void>;
    createWithTimeSlots(schedule: DoctorSchedule, time_slots: TimeSlotsArray): Promise<DoctorSchedule>;
}