import { Model, Optional } from 'sequelize';
type Time = `${number}:${number}`;

interface IDoctorScheduleAttributes {
    id: number;
    date: string;
    day_weekly: string;
    doctorId?: number;
}

export interface IDoctorScheduleCreationAttributes extends Optional<IDoctorScheduleAttributes, 'id'> {}
export interface DoctorScheduleModelInterface extends Model<IDoctorScheduleAttributes, IDoctorScheduleCreationAttributes>, IDoctorScheduleAttributes {
    time_slots?: any[];
    getTime_slots?: (options?: any) => Promise<any[]>;
    setTime_slots?: (timeSlots: any[], options?: any) => Promise<void>;
    addTime_slot?: (timeSlot: any, options?: any) => Promise<void>;
    addTime_slots?: (timeSlots: any[], options?: any) => Promise<void>;
    removeTime_slot?: (timeSlot: any, options?: any) => Promise<void>;
    removeTime_slots?: (timeSlots: any[], options?: any) => Promise<void>;
    hasTime_slot?: (timeSlot: any, options?: any) => Promise<boolean>;
    hasTime_slots?: (timeSlots: any[], options?: any) => Promise<boolean>;
    countTime_slots?: (options?: any) => Promise<number>;
    
    getDoctor?: (options?: any) => Promise<any>;
    setDoctor?: (doctor: any, options?: any) => Promise<void>;
}