import { Model } from 'sequelize';

export default interface DoctorModelInterface extends Model {
    id: number;
    specialization: string;
    contacts: string | null;
    experienceYears: number;
    activate: boolean;
    userId: number;
    createdAt: Date;
    updatedAt: Date;
}