import { Model, Optional } from 'sequelize';

interface IConsulationRoomAttributes {
    id: number;
    consultationId: number;
    roomId: string;
    status: string;
    startTime: Date | null;
    endTime: Date | null;
    participants: Array<{
        userId: number;
        joinedAt: Date;
        leftAt: Date | null;
        role: 'PATIENT' | 'DOCTOR';
    }>;
}

export interface IConsulationRoomCreationAttributes extends Optional<IConsulationRoomAttributes, 'id'> { }
export interface ConsulationRoomModelInterface extends Model<IConsulationRoomAttributes, IConsulationRoomCreationAttributes>, IConsulationRoomCreationAttributes { }