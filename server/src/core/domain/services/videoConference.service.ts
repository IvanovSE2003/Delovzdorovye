import ConsultationRoom from "../entities/consultationRoom.entity";

export default interface VideoConferenceService {
    validateAccess(userId: number, consultationId: number, role: string): Promise<boolean>;
    handleDisconnect(socketId: string): Promise<void>;
    startConsultation(consultationId: number): Promise<string>;

    getParticipants(consultationId: number): Promise<Array<{
        userId: number;
        joinedAt: Date;
        leftAt: Date | null;
        role: 'PATIENT' | 'DOCTOR';
    }>>;

    addParticipant(consultationId: number, userId: number, role: "PATIENT" | "DOCTOR"): Promise<ConsultationRoom>;
    getAllRooms(): Promise<Array<{ roomId: string; consultationId: number; status: string }>>;
    removeParticipant(consultationId: number, userId: number): Promise<ConsultationRoom>;
}