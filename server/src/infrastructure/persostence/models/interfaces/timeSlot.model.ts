import { Model, Optional } from 'sequelize';

interface ITimeSlotAttributes {
    id: number;
    time: string;
    isAvailable: boolean;
    consultationId?: number;
    patientId?: number;
    doctorsScheduleId?: number
}

export interface ITimeSlotCreationAttributes extends Optional<ITimeSlotAttributes, 'id'> { }
export interface TimeSlotmModelInterface extends Model<ITimeSlotAttributes, ITimeSlotCreationAttributes>, ITimeSlotAttributes { }