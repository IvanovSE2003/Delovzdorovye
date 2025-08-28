
import TimeSlot from "../entities/timeSlot.entity.js";
import Problem from "../entities/problem.entity.js";
import Consultation from "../entities/consultations.entity.js";

export default interface ConsultationRepository {
    findById(id: number): Promise<Consultation | null>;
    findByUserId(userId: number): Promise<Consultation[]>;
    findAll(page: number, limit: number, filters?: {
        payment_status?: string;
        consultation_status?: string;
        userId?: number;
    }
    ): Promise<{
        consultations: Consultation[];
        totalCount: number;
        totalPages: number;
    }>
    create(consultationData: Partial<Consultation>): Promise<Consultation>;
    update(id: number, consultationData: Partial<Consultation>): Promise<Consultation>;



    // Поиск подходящих врачей по проблемам
    // findAvailableDoctorsByProblems(problemIds: number[]): Promise<{
    //     doctorIds: number[];
    //     availableSlots: TimeSlot[];
    // }>;

    // // Получение свободных слотов для врачей
    // getAvailableTimeSlotsForDoctors(doctorIds: number[], date?: Date): Promise<TimeSlot[]>;

    // // Работа с проблемами консультации
    // addProblemsToConsultation(consultationId: number, problemIds: number[]): Promise<void>;
    // getConsultationProblems(consultationId: number): Promise<Problem[]>;

    // // Бронирование и оплата
    // reserveTimeSlot(consultationId: number, timeSlotId: number): Promise<Consultation>;
    // confirmPayment(consultationId: number, transactionId: number): Promise<Consultation>;
    // cancelReservation(consultationId: number): Promise<Consultation>;

    // // Получение консультаций по статусу
    // findByStatus(status: string): Promise<Consultation[]>;
    // findByPaymentStatus(status: string): Promise<Consultation[]>;

    // // Работа с "другой проблемой"
    // createWithCustomProblem(consultationData: Partial<Consultation>, customProblem: string): Promise<Consultation>;
    // getConsultationsWithCustomProblems(): Promise<Consultation[]>;

    // // Таймеры и автоматизация
    // getExpiringReservations(): Promise<Consultation[]>;
    // releaseExpiredReservations(): Promise<void>;

    // // Для личного кабинета
    // getUserUpcomingConsultations(userId: number): Promise<Consultation[]>;
    // getUserArchiveConsultations(userId: number): Promise<Consultation[]>;

    // // Перенос и отмена
    // rescheduleConsultation(consultationId: number, newTimeSlotId: number): Promise<Consultation>;
    // cancelConsultation(consultationId: number, reason?: string): Promise<Consultation>;
}