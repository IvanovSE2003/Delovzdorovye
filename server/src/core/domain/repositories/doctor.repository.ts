import Doctor from "../entities/doctor.entity.js";

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
    update(doctor: Doctor): Promise<Doctor>;
    create(doctor: Doctor): Promise<Doctor>;
}