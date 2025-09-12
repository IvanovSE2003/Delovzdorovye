export default class ConsultationRoom {
    constructor(
        public id: number,
        public consultationId: number,
        public roomId: string, 
        public status: 'PENDING' | 'ACTIVE' | 'COMPLETED',
        public startTime: Date | null,
        public endTime: Date | null,
        public participants: Array<{
            userId: number;
            joinedAt: Date;
            leftAt: Date | null;
            role: 'PATIENT' | 'DOCTOR';
        }>
    ) {}

    startRoom(): ConsultationRoom {
        this.status = 'ACTIVE';
        this.startTime = new Date();
        return this;
    }

    endRoom(): ConsultationRoom {
        this.status = 'COMPLETED';
        this.endTime = new Date();
        return this;
    }

    addParticipant(userId: number, role: 'PATIENT' | 'DOCTOR'): ConsultationRoom {
        this.participants.push({
            userId,
            joinedAt: new Date(),
            leftAt: null,
            role
        });
        return this;
    }

    removeParticipant(userId: number): ConsultationRoom {
        const participant = this.participants.find(p => p.userId === userId);
        if (participant) {
            participant.leftAt = new Date();
        }
        return this;
    }
}