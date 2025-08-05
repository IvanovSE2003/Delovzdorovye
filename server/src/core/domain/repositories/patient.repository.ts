import Patient from "../entities/patient.entity.js";

export default interface PatientRepository {
    findById(id: number): Promise<Patient | null>;
    findByUserId(userId: number): Promise<Patient | null>;
    update(patient: Patient): Promise<Patient>;
}