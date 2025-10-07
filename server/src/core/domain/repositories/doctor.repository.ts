import Doctor from "../entities/doctor.entity.js";

export default interface DoctorRepository {
    findById(id: number): Promise<Doctor | null>;
    findByUserId(userId: number): Promise<Doctor | null>;
    findAll(
        page?: number,
        limit?: number,
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
    findByProblems(problems: number[]): Promise<Doctor[]>;
    findByUserIdSimple(userId: number): Promise<Doctor | null>;
    getDoctorsWithSpecializations(userIds: number[]): Promise<Doctor[]>;
    update(doctor: Doctor): Promise<Doctor>;
    updateSimple(doctor: Doctor): Promise<void>
    create(doctor: Doctor): Promise<Doctor>;
    save(doctor: Doctor): Promise<Doctor>;

    saveLisinseDiploma(doctor: Doctor, license: string, diploma: string, specialization: string): Promise<void>;
    deleteLisinseDiploma(doctor: Doctor, license: string, diploma: string, specialization: string): Promise<void>;

    findByAvailableSlot(date: string, time: string): Promise<Doctor[]>;
}