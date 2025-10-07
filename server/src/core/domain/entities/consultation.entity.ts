import Problem from "./problem.entity";

export default class Consultation {
    constructor(
        public id: number,
        public consultation_status: "UPCOMING" | "ARCHIVE",
        public payment_status: "PAID" | "PAYMENT" | "NOTPAID",
        public problem_description: string | null,
        public has_other_problem: boolean,
        public recommendations: string | null,
        public duration: number,
        public score: number | null,
        public comment: string | null,
        public reservation_expires_at: Date | null,
        public reason_cancel: string | null,
        public time: string,
        public date: string,
        public userId: number,
        public doctorId: number,
        public createdAt?: string,
        public doctor?: {
            id: number;
            user: {
                id: number;
                name: string | null;
                surname: string | null;
                patronymic: string | null;
                email: string | null;
                img: string;
            };
            profData: {
                specialization: string | null,
                diploma: string | null,
                license: string | null
            }[]

        } | null,
        public user?: {
            id: number;
            name: string | null;
            surname: string | null;
            patronymic: string | null;
            email: string | null;
            phone: string | null;
            date_birth: string | null;
            gender: string | null;
        } | null,
        public problems?: Problem[]
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
        return !!this.problem_description;
    }

    setReason(reason: string) {
        this.reason_cancel = reason;
        return this;
    }

    setComment(comment: string) {
        this.comment = comment;
        return this;
    }

    setTimeDate(time: string, date: string) {
        this.time = time;
        this.date = date;
        return this;
    }

    setScore(score: number) {
        this.score = score;
        return this;
    }

    setRecomendation(rec: string) {
        this.recommendations = rec;
        return this;
    }
}