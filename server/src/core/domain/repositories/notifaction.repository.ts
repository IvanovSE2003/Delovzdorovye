import Notification from "../entities/notification.entity"

export default interface NotificationRepository {
    findAll(page: number, limit: number): Promise<{ rows: Notification[], totalCount: number; totalPages: number }>;
    findById(id: number): Promise<Notification | null>;
    findByUserId(id: number): Promise<Notification[]>;
    create(notification: Notification): Promise<Notification>;
    update(notification: Notification): Promise<Notification>;
    save(notification: Notification): Promise<Notification>;
    delete(id: number): Promise<void>;
    deleteByUser(id: number): Promise<void>;
    countByUserId(userId: number, onlyUnread: boolean): Promise<number>;

    getCountByCount(userId: number): Promise<number>;
}
