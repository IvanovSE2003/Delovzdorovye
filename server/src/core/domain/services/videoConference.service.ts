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
}