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
    const [unreadCount, setUnreadCount] = useState<number>(0);

    const markAsRead = async (id: number) => {
        await UserService.readNotification(id);
        setNotifications(prev =>
            prev.map(n =>
                n.id === id ? { ...n, isRead: true } : n
            )
        );
        setUnreadCount(prev => Math.max(prev - 1, 0));
    };

    const deleteMessage = (id: number) => {

    }

    // Получение всех уведомлений
    const fetchNotifications = async () => {
        try {
            const response = await UserService.getNotifications(store.user.id);
            setNotifications(response.data);

            // Считаем непрочитанные
            const count = response.data.filter((n: INotification) => !n.isRead).length;
            setUnreadCount(count);
        } catch (e) {
            const error = e as AxiosError<TypeResponse>;
            console.error("Ошибка при получении уведомлений: ", error.response?.data.message);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    return (
        <AccountLayout>
            <div className="page-container notifications">
                <h1 className="notifications__title">
                    Уведомления {unreadCount > 0 && `(${unreadCount})`}
                </h1>

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
