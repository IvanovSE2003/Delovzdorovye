import { Model, Optional } from 'sequelize';

interface INotificationAttributes {
    id: number;
    title: string;
    message: string;
    type: "INFO" | "WARNING" | "ERROR" | "CONSULTATION" | "PAYMENT";
    isRead: boolean;
    entity: object | null;
    entityType: string | null;
    userId?: number;
    createdAt?: string;
}

export interface INotificationCreationAttributes extends Optional<INotificationAttributes, 'id'> { }
export interface NotificationModelInterface extends Model<INotificationAttributes, INotificationCreationAttributes>, INotificationAttributes { }