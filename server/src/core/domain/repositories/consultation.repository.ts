import Consultation from "../entities/consultation.entity.js";

export default interface ConsultationRepository {
    findById(id: number): Promise<Consultation | null>;
    findAll(page: number, limit: number, filters?: {
        payment_status?: string;
        consultation_status?: string;
        userId?: number;
        doctorId?: number;
        time?: string;
        date?: string;
    }
    ): Promise<{
        consultations: Consultation[];
        totalCount: number;
        totalPages: number;
    }>
    findTimeSlotForDateProblem(problems: number[], date: string): Promise<string[]>;
    findByUserId(id: number, page: number, limit: number): Promise<Consultation[]>;
    
    create(consultationData: Consultation): Promise<Consultation>;
    update(consult: Consultation): Promise<Consultation>;
    save(consult: Consultation): Promise<Consultation>;
    delete(id: number): Promise<void>;

    getCount(): Promise<number>;
    getCountOtherProblem(): Promise<number>;
    getCountOtherProblemByUser(userId: number): Promise<number>;
}