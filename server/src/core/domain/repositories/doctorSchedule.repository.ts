import TimeSlotsArray from "../../../infrastructure/web/types/timeSlot.type.js";
import DoctorSchedule from "../entities/doctorSchedule.entity.js";
import TimeSlot from "../entities/timeSlot.entity.js";

export default interface DoctorScheduleRepository {
    findByDoctorId(scheduleId: number): Promise<DoctorSchedule[] | null>;
    findById(scheduleId: number): Promise<DoctorSchedule | null>;
    update(schedule: DoctorSchedule): Promise<DoctorSchedule>;
    create(schedule: DoctorSchedule): Promise<DoctorSchedule>;
    createTimeSlot(timeSlot: TimeSlot): Promise<TimeSlot>;
    delete(id: number): Promise<void>;
    deleteTimeSlot(id: number): Promise<void>;
    createWithTimeSlots(schedule: DoctorSchedule, time_slots: TimeSlotsArray): Promise<DoctorSchedule>;
}