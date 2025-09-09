import { Model, Optional } from 'sequelize';

interface ITimeSlotAttributes {
    id: number;
    time: string;
    date: string;
    dayWeek: number;
    status: "OPEN" | "CLOSE" | "BOOKED";
    doctorId?: number;
}

export interface ITimeSlotCreationAttributes extends Optional<ITimeSlotAttributes, 'id'> { }
export interface TimeSlotmModelInterface extends Model<ITimeSlotAttributes, ITimeSlotCreationAttributes>, ITimeSlotAttributes { }