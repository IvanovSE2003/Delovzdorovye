import Doctor from "../entities/doctor.entity.js";
import TimeSlot from "../entities/timeSlot.entity.js";

export default interface DoctorRepository {
    findById(id: number): Promise<Doctor | null>;
    findByUserId(userId: number): Promise<Doctor | null>;
    findAll(
        page: number,
        limit: number,
        filters?: {
            specialization?: string;
            isActive?: boolean;
            gender?: string;
            experienceMin?: number;
            experienceMax?: number;
        }
    ): Promise<{
        doctors: Doctor[];
        totalCount: number;
        totalPages: number;
    }>;
    findByUserIds(userIds: number[]): Promise<Doctor[]>;
    findByDateTimeForProblems(date: string, time: string, problems: number[]): Promise<Doctor>;
    update(doctor: Doctor): Promise<Doctor>;
    create(doctor: Doctor): Promise<Doctor>;

    getTimeSlots(doctorId: number): Promise<TimeSlot[]>;
}