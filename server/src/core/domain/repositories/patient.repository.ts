import Patient from "../entities/patient.entity.js";

export default interface PatientRepository {
    findById(id: number): Promise<Patient | null>;
    findByUserId(userId: number): Promise<Patient | null>;
    findAll(
        page: number,
        limit: number,
        filters?: {
            bloodType?: string;
            isActive?: boolean;
            gender?: string;
        }
    ): Promise<{
        patients: Patient[];
        totalCount: number;
        totalPages: number;
    }>;
    update(patient: Patient): Promise<Patient>;
    create(patient: Patient): Promise<Patient | null>;

}