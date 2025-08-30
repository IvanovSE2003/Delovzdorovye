export default class Consultation {
    constructor(
        public id: number,
        public consultation_status: "UPCOMING" | "ARCHIVE",
        public payment_status: "PAID" | "PAYMENT" | "NOTPAID",
        public other_problem: string| null,
        public recommendations: string | null,
        public duration: number,
        public score: number | null,
        public comment: string | null,
        public reservation_expires_at: Date | null,
        public reason_cancel: string | null,
        public userId: number,
        public doctorId: number,
        public timeSlotId: number,
    ) { }

    setPayStatus(status: "PAID" | "PAYMENT" | "NOTPAID") {
        this.payment_status = status;
        return this;
    }

    setConsultStatus(status: "UPCOMING" | "ARCHIVE") {
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

    setTimeSlot(timeSlot: number) {
        this.timeSlotId = timeSlot;
        return this;
    }

    setReason(reason: string) {
        this.reason_cancel = reason;
        return this;
    }
}