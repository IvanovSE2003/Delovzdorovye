import { Model, Optional } from 'sequelize';
import { SpecializationModelInterface } from './specializations.model.js';
import { UserModelInterface } from './user.model.js'; 

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
    getSpecializations: () => Promise<SpecializationModelInterface[]>;
    setSpecializations: (specializations: SpecializationModelInterface[], options?: any) => Promise<void>;
    addSpecialization: (specialization: SpecializationModelInterface, options?: any) => Promise<void>;
    addSpecializations: (specializations: SpecializationModelInterface[], options?: any) => Promise<void>;
    removeSpecialization: (specialization: SpecializationModelInterface, options?: any) => Promise<void>;
    
    getUser: () => Promise<UserModelInterface>;
    setUser: (user: UserModelInterface, options?: any) => Promise<void>;
    createUser: (user: any, options?: any) => Promise<UserModelInterface>;
    
    user?: UserModelInterface;
    specializations?: SpecializationModelInterface[];
}