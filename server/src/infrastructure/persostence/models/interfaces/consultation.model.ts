import { Model, Optional } from 'sequelize';

interface IConsultationAttributes {
    id: number;
    consultation_status: "UPCOMING" | "ARCHIVE";
    payment_status: "PAID" | "PAYMENT" | "NOTPAID";
    other_problem: string | null;
    recommendations: string | null;
    duration: number;
    score: number | null;
    comment: string | null;
    reservation_expires_at: Date | null;
    reason_cancel: string | null;
    time: string,
    date: string,
    doctorId: number;
    userId: number;
    createdAt?: string;
    doctor?: any;
}

export interface IConsultaitionCreationAttributes extends Optional<IConsultationAttributes, 'id'> { }
export interface ConsultationModelInterface extends Model<IConsultationAttributes, IConsultaitionCreationAttributes>, IConsultationAttributes {}