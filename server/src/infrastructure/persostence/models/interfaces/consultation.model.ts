import { Model, Optional } from 'sequelize';

interface IConsultationAttributes {
    id: number;
    consultation_status: "UPCOMING" | "ARCHIVE";
    payment_status: string;
    other_problem: string | null;
    recommendations: string | null;
    duration: number;
    score: number | null;
    comment: string | null;
    reservation_expires_at: Date | null;
    reason_cancel: string | null;
    doctorId: number;
    userId: number;
    timeSlotId: number;
}

export interface IConsultaitionCreationAttributes extends Optional<IConsultationAttributes, 'id'> { }
export interface ConsultationModelInterface extends Model<IConsultationAttributes, IConsultaitionCreationAttributes>, IConsultationAttributes {}