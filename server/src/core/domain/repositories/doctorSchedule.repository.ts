import TimeSlotsArray from "../../../infrastructure/web/types/timeSlot.type.js";
import DoctorSchedule from "../entities/doctorSchedule.entity.js";

export default interface DoctorScheduleRepository {
    findByDoctorId(doctorId: number): Promise<DoctorSchedule[] | null>
    update(doctor: DoctorSchedule): Promise<DoctorSchedule>;
    create(doctor: DoctorSchedule): Promise<DoctorSchedule>;
    delete(id: number): Promise<void>;
    createWithTimeSlots(schedule: DoctorSchedule, time_slots: TimeSlotsArray): Promise<DoctorSchedule>;
}