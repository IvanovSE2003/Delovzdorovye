import { ConsultationModelInterface, IConsultaitionCreationAttributes } from "../../../infrastructure/persostence/models/interfaces/consultation.model.js";
import Consultation from "../../domain/entities/consultations.entity.js";
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

    private mapToDomainProblem(consultModel: ConsultationModelInterface) {
        return new Consultation(
            consultModel.id,
            consultModel.consultation_status,
            consultModel.payment_status,
            consultModel.other_problem,
            consultModel.recommendations,
            consultModel.duration
        );
    }

    private mapToPersistence(consult: Consultation): IConsultaitionCreationAttributes {
        return {
            consultation_status: consult.consultation_status,
            payment_status: consult.payment_status,
            other_problem: consult.other_problem,
            recommendations: consult.recommendations,
            duration: consult.duration
        };
    }
}