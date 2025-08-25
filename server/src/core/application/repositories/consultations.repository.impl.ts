import Consultation from "../../domain/entities/consultation.entity.js";
import ConsultationRepository from "../../domain/repositories/consultation.repository.js";

export default class ConsultationRepositoryImpl implements ConsultationRepository {
    async findById(id: number): Promise<Consultation | null> {
        throw "";
    }

    async findByUserId(userId: number): Promise<Consultation[]> {
        throw "";
    }

    async create(consultationData: Partial<Consultation>): Promise<Consultation> {
        throw "";
    }

    async update(id: number, consultationData: Partial<Consultation>): Promise<Consultation> {
        throw "";
    }
}