import { Model, Optional } from 'sequelize';
type Time = `${number}:${number}`;

interface IDoctorScheduleAttributes {
    id: number;
    date: Date;
    day_weekly: string;
    time_start: Time;
    time_end: Time;
    doctorId?: number;
}

export interface IDoctorScheduleCreationAttributes extends Optional<IDoctorScheduleAttributes, 'id'> {}
export interface DoctorScheduleModelInterface extends Model<IDoctorScheduleAttributes, IDoctorScheduleCreationAttributes>, IDoctorScheduleAttributes {}