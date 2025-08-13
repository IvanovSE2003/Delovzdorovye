import DoctorSchedule from "../entities/doctorSchedule.entity.js";

export default interface DoctorScheduleRepository {
    findByDoctorId(userId: number): Promise<DoctorSchedule | null>;
    update(doctor: DoctorSchedule): Promise<DoctorSchedule>;
    create(doctor: DoctorSchedule): Promise<DoctorSchedule>;
}