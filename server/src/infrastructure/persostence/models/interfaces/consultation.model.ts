import { Model, Optional } from 'sequelize';

interface IConsultationAttributes {
    id: number;
    consultation_status: string;
    payment_status: string;
    other_problem: string;
    recommendations: string;
    duration: number;
    doctorId?: number;
    userId?: number;
}

export interface IConsultaitionCreationAttributes extends Optional<IConsultationAttributes, 'id'> { }
export interface ConsultationModelInterface extends Model<IConsultationAttributes, IConsultaitionCreationAttributes>, IConsultationAttributes {}