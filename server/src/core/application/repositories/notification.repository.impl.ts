import Notification from "../../domain/entities/notification.entity";
import NotificationRepository from "../../domain/repositories/notifaction.repository";
import models from "../../../infrastructure/persostence/models/models";
import { INotificationCreationAttributes, NotificationModelInterface } from "../../../infrastructure/persostence/models/interfaces/notification.model";

export default class NotificationRepositoryImpl implements NotificationRepository {
    async findById(id: number): Promise<Notification | null> {
        const notifaction = await models.Notification.findByPk(id);
        return notifaction ? this.mapToDomainNotification(notifaction) : null;
    }

    async findAll(
        page: number,
        limit: number
    ): Promise<{ rows: Notification[]; totalCount: number; totalPages: number }> {
        const offset = (page - 1) * limit;

        const { rows, count } = await models.Notification.findAndCountAll({
            order: [["createdAt", "DESC"]],
            limit,
            offset,
        });

        return {
            rows: rows.map((n) => this.mapToDomainNotification(n)),
            totalCount: count,
            totalPages: Math.ceil(count / limit),
        };
    }

    async create(notification: Notification): Promise<Notification> {
        const createdNotification = await models.Notification.create(this.mapToPersistence(notification));
        return this.mapToDomainNotification(createdNotification);
    }

    async update(notification: Notification): Promise<Notification> {
        const [affectedCount, affectedRows] = await models.Notification.update(this.mapToPersistence(notification), { where: { id: notification.id }, returning: true });
        if (affectedCount === 0 || !affectedRows || affectedRows.length === 0) {
            throw new Error('Проблема не была обновлена');
        }
        const updatedProblem = affectedRows[0];
        return this.mapToDomainNotification(updatedProblem);
    }

    async save(notification: Notification): Promise<Notification> {
        return notification.id ? await this.update(notification) : await this.create(notification);
    }

    async delete(id: number): Promise<void> {
        await models.Notification.destroy({ where: { id } });
    }

    private mapToDomainNotification(notifactionModel: NotificationModelInterface) {
        return new Notification(
            notifactionModel.id,
            notifactionModel.title,
            notifactionModel.message,
            notifactionModel.type,
            notifactionModel.isRead,
            notifactionModel.entityId,
            notifactionModel.entityType
        );
    }

    private mapToPersistence(notifaction: Notification): INotificationCreationAttributes {
        return {
            title: notifaction.title,
            message: notifaction.message,
            type: notifaction.type,
            isRead: notifaction.isRead,
            entityId: notifaction.entityId,
            entityType: notifaction.entityType
        };
    }
}