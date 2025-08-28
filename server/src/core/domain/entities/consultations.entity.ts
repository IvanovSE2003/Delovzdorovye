export default class Consultation {
    constructor(
        public id: number,
        public consultation_status: string,
        public payment_status: string,
        public other_problem: string,
        public recommendations: string,
        public duration: number,
        public score: number | null,
        public comment: string | null,
        public userId?: number,
        public doctorId?: number,
        public time_slot_id?: number,
        public created_at?: Date,
        public updated_at?: Date,
        public reservation_expires_at?: Date
    ) { }

    isReserved(): boolean {
        return this.consultation_status === 'reserved' &&
            this.payment_status === 'pending';
    }

    isPaid(): boolean {
        return this.payment_status === 'paid';
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