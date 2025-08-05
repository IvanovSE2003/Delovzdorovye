import Doctor from "../entities/doctor.entity.js";

export default interface DoctorRepository {
    findById(id: number): Promise<Doctor | null>;
    findByUserId(userId: number): Promise<Doctor | null>;
    update(doctor: Doctor): Promise<Doctor>;
    activateDoctor(doctorId: number): Promise<Doctor>;
}