import { useContext, useEffect, useState } from "react";
import { motion } from "framer-motion";
import AccountLayout from "./AccountLayout";
import type { TypeResponse } from "../../models/response/DefaultResponse";
import type { AxiosError } from "axios";
import UserService from "../../services/UserService";
import { Context } from "../../main";
import { observer } from "mobx-react-lite";

// Сопоставление типов с эмодзи
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

// Пример данных
// const mockNotifications = [
//     {
//         id: 1,
//         title: "Новая запись на прием",
//         message: "Пациент Иванов записался на 12 сентября, 14:00",
//         type: "appointment",
//         isRead: false
//     },
//     {
//         id: 2,
//         title: "Новое сообщение",
//         message: "Пациент Петров прислал результаты анализов.",
//         type: "message",
//         isRead: false
//     },
//     {
//         id: 3,
//         title: "Системное уведомление",
//         message: "Ваш пароль будет истекать через 7 дней.",
//         type: "system",
//         isRead: true
//     },
//     {
//         id: 4,
//         title: "Срочный вызов",
//         message: "Пациент Сидоров сообщает об ухудшении состояния.",
//         type: "alert",
//         isRead: false
//     }
// ];

const Bell: React.FC = () => {
    const { store } = useContext(Context);
    const [notifications, setNotifications] = useState<INotification[]>([] as INotification[]);

    // Сделать сообщение прочитанным
    const markAsRead = (id: number) => {
        setNotifications((prev) =>
            prev.map((n) =>
                n.id === id ? { ...n, isRead: true } : n
            )
        );
    };

    // Загрузка всех уведомлений 
    const fetchNotifications = async () => {
        try {
            const response = await UserService.getNotifications(store.user.id);
            console.log(response.data);
            setNotifications(response.data);
        } catch (e) {
            const error = e as AxiosError<TypeResponse>;
            console.error("Ошибка при получении уведомлений: ", error.response?.data.message);
        }
    }

    // Загрузка данных при открытии страницы
    useEffect(() => {
        fetchNotifications();
    }, [])

    return (
        <AccountLayout>
            <div className="page-container notifications">
                <h1 className="notifications__title">Уведомления</h1>
                <div className="notifications__list">
                    {notifications.length > 0 ? notifications.map((n) => (
                        <motion.div
                            key={n.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div
                                className={`notification ${n.isRead ? "notification--read" : "notification--unread"}`}
                            >
                                <div className="notification__icon">
                                    {typeIcons[n.type] || typeIcons.default}
                                </div>
                                <div className="notification__content">
                                    <h2 className="notification__header">{n.title}</h2>
                                    <p className="notification__message">{n.message}</p>
                                </div>
                                {!n.isRead && (
                                    <button
                                        className="notification__button"
                                        onClick={() => markAsRead(n.id)}
                                    >
                                        Прочитано
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    )) : (
                        <div>
                            <div className="notification__empty">Уведомлений пока нет</div>
                        </div>
                    )}
                </div>
            </div>
        </AccountLayout>
    );
}

export default observer(Bell);