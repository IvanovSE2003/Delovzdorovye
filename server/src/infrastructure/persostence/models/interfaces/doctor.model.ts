import { Model, Optional } from 'sequelize';
import { SpecializationModelInterface } from './specializations.model.js';
import { UserModelInterface } from './user.model.js'; // Предполагается, что у вас есть такой интерфейс

interface IDoctortAttributes {
    id: number;
    experience_years: number;
    diploma: string;
    license: string;
    isActivated: boolean;
    userId?: number;
}

export interface IDoctorCreationAttributes extends Optional<IDoctortAttributes, 'id'> {}

export interface DoctorModelInterface extends Model<IDoctortAttributes, IDoctorCreationAttributes>, IDoctortAttributes {
    // Ассоциации со специализациями
    getSpecializations: () => Promise<SpecializationModelInterface[]>;
    setSpecializations: (specializations: SpecializationModelInterface[], options?: any) => Promise<void>;
    addSpecialization: (specialization: SpecializationModelInterface, options?: any) => Promise<void>;
    addSpecializations: (specializations: SpecializationModelInterface[], options?: any) => Promise<void>;
    removeSpecialization: (specialization: SpecializationModelInterface, options?: any) => Promise<void>;
    
    // Ассоциация с пользователем
    getUser: () => Promise<UserModelInterface>;
    setUser: (user: UserModelInterface, options?: any) => Promise<void>;
    createUser: (user: any, options?: any) => Promise<UserModelInterface>;
    
    // Дополнительные поля для eager loading
    user?: UserModelInterface;
    specializations?: SpecializationModelInterface[];
}