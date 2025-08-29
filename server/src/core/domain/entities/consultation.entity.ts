export default class Consultation {
    constructor(
        public id: number,
        public consultation_status: string,
        public payment_status: string,
        public other_problem: string| null,
        public recommendations: string | null,
        public duration: number,
        public score: number | null,
        public comment: string | null,
        public reservation_expires_at: Date | null,
        public userId?: number,
        public doctorId?: number,
        public timeSlotId?: number,
    ) { }

    setPayStatus(status: string) {
        this.payment_status = status;
        return this;
    }

    setConsultStatus(status: string) {
        this.consultation_status = status;
        return this;
    }

    isExpired(): boolean {
        return this.reservation_expires_at
            ? new Date() > this.reservation_expires_at
            : false;
    }

    hasCustomProblem(): boolean {
        return !!this.other_problem;
    }
}