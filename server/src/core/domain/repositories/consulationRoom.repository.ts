import ConsultationRoom from "../entities/consultationRoom.entity";

export default interface ConsultationRoomRepository {
    findByConsultationId(consultationId: number): Promise<ConsultationRoom | null>;
    findAll(): Promise<ConsultationRoom[]>;
    create(room: ConsultationRoom): Promise<ConsultationRoom>;
    update(room: ConsultationRoom): Promise<ConsultationRoom>;
    delete(id: number): Promise<void>;
    save(room: ConsultationRoom): Promise<ConsultationRoom>;

    addParticipant(
        roomId: number,
        userId: number,
        role: "PATIENT" | "DOCTOR"
    ): Promise<ConsultationRoom>;

    removeParticipant(
        roomId: number,
        userId: number
    ): Promise<ConsultationRoom>;

    getParticipants(
        roomId: number
    ): Promise<
        Array<{
            userId: number;
            joinedAt: Date;
            leftAt: Date | null;
            role: "PATIENT" | "DOCTOR";
        }>
    >;
}
