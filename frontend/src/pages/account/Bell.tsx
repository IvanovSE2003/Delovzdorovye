import { useContext, useEffect, useState } from "react";
import { motion } from "framer-motion";
import AccountLayout from "./AccountLayout";
import type { TypeResponse } from "../../models/response/DefaultResponse";
import type { AxiosError } from "axios";
import UserService from "../../services/UserService";
import { Context } from "../../main";
import { observer } from "mobx-react-lite";

const typeIcons: Record<string, string> = {
    appointment: "📅",
    message: "💬",
    alert: "🚨",
    system: "⚙️",
    default: "🔔"
};

export interface INotification {
    id: number;
    title: string;
    message: string;
    type: "INFO" | "WARNING" | "ERROR" | "CONSULTATION" | "PAYMENT";
    isRead: boolean;
    userId: number;
    entity?: object;
    entityType?: string;
}

const Bell: React.FC = () => {
    const { store } = useContext(Context);
    const [notifications, setNotifications] = useState<INotification[]>([]);

    const markAsRead = async (id: number) => {
        try {
            await UserService.readNotification(id);
            fetchNotifications();
        } catch (e) {
            const error = e as AxiosError<TypeResponse>;
            console.error(`Ошибка прочтении уведомления с id: ${id}:`, error.response?.data.message);
        }
    };

    const deleteMessage = async (id: number) => {
        try {
            await UserService.deleteNotification(id);
            store.decrimentCountMessage();
            fetchNotifications();
        } catch (e) {
            const error = e as AxiosError<TypeResponse>;
            console.error(`Ошибка при удалении сообщения с id: ${id}: `, error.response?.data.message);
        }
    }

    const markAsReadAll = async () => {
        try {
            await UserService.readNotifciatonAll(store.user.id);
            fetchNotifications();
        } catch (e) {
            const error = e as AxiosError<TypeResponse>;
            console.error("Ошибка при прочтении всех уведомлений:", error.response?.data.message);
        }
    }

    const deleteAllNotifications = async () => {
        if (!window.confirm("Вы действительно хотите удалить все уведомления?")) return;

        try {
            await UserService.deleteNotificationAll(store.user.id);
            store.setCountMessage(0);
            fetchNotifications();
        } catch (e) {
            const error = e as AxiosError<TypeResponse>;
            console.error("Ошибка при удалении всех уведомлений:", error.response?.data.message);
        }
    };

    // Получение всех уведомлений
    const fetchNotifications = async () => {
        try {
            const response = await UserService.getNotifications(store.user.id);
            setNotifications(response.data);
        } catch (e) {
            const error = e as AxiosError<TypeResponse>;
            console.error("Ошибка при получении уведомлений: ", error.response?.data.message);
        }
    };

    useEffect(() => {
        fetchNotifications();
        console.log(notifications);
    }, []);

    return (
        <AccountLayout>
            <div className="page-container notifications">
                <h1 className="notifications__title">
                    Уведомления {notifications.length > 0 && `(${notifications.length})`}
                </h1>

                <div className="notifications__buttons">
                    <button onClick={deleteAllNotifications}>Удалить все уведомления</button>
                    <button onClick={markAsReadAll}>Прочитать все уведомления</button>
                </div>

                <div className="notifications__list">
                    {notifications.length > 0 ? notifications.map(n => (
                        <motion.div
                            key={n.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div className={`notification ${n.isRead ? "notification--read" : "notification--unread"}`}>
                                <div className="notification__icon">{typeIcons[n.type] || typeIcons.default}</div>
                                <div className="notification__content">
                                    <h2 className="notification__header">{n.title}</h2>
                                    <p className="notification__message">{n.message}</p>
                                </div>
                                {!n.isRead && (
                                    <button className="notification__button" onClick={() => markAsRead(n.id)}>
                                        Прочитано
                                    </button>
                                )}
                                <button className="notification__button" onClick={() => deleteMessage(n.id)}>
                                    Удалить
                                </button>
                            </div>
                        </motion.div>
                    )) : (
                        <div className="notification__empty">Уведомлений пока нет</div>
                    )}
                </div>
            </div>
        </AccountLayout>
    );
};

export default observer(Bell);
