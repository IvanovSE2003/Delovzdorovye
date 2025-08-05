import { Model } from 'sequelize';

export default interface PatientModelInterface extends Model {
    id: number;
    general_info: Record<string, any> | null;
    analyses_examinations: Record<string, any> | null;
    additionally: Record<string, any> | null;
    userId: number;
    createdAt: Date;
    updatedAt: Date;
}