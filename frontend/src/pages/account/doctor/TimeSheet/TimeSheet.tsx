import { useContext, useEffect, useState } from "react";
import { motion } from "framer-motion";
import AccountLayout from "../../AccountLayout";
import { Context } from "../../../../main";
import { observer } from "mobx-react-lite";
import type { ISchedules, ISlots } from "../../../../models/Schedules";
import ScheduleService from "../../../../services/ScheduleService";

import Loader from "../../../../components/UI/Loader/Loader";
import "./TimeSheet.scss";

const TimeSheet = () => {
    const { store } = useContext(Context);

    const [schedules, setSchedules] = useState<ISchedules[] | null>(null);
    const [selectedSchedule, setSelectedSchedule] = useState<ISchedules | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [showAddDay, setShowAddDay] = useState(false);

    // Получение всех данных
    const getSchedules = async () => {
        try {
            setLoading(true);
            const response = await ScheduleService.getSchedules(store.user.id);
            setSchedules(response.data);
        } catch (e: any) {
            console.error(e.message);
        } finally {
            setLoading(false);
        }
    }

    // Добавление дня
    const addDay = async () => {
        try {
            setLoading(true);
            const response = await ScheduleService.addDay();

        } catch (e: any) {
            console.error(e.message);
        } finally {
            setLoading(false);
        }
    }

    // Удаление дня
    const deleteDay = async (id: number) => {
        try {
            setLoading(true);
            const response = await ScheduleService.deleteDay(id);

        } catch (e: any) {
            console.error(e.message);
        } finally {
            setLoading(false);
        }
    }

    // Добавление ячейки времени
    const addSlot = async () => {
        try {
            setLoading(true);
            const response = await ScheduleService.addSlot();

        } catch (e: any) {
            console.error(e.message);
        } finally {
            setLoading(false);
        }
    }

    // Удаление ячейки времени
    const deleteSlot = async (id: number) => {
        try {
            setLoading(true);
            const response = await ScheduleService.deleteSlot(id);

        } catch (e: any) {
            console.error(e.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getSchedules();
    }, [])

    if (loading) return <Loader />

    return (
        <AccountLayout>
            <div className="timesheet">
                <h2 className="timesheet__title">Настройка вашего расписания</h2>

                <div className="timesheet__content">
                    {/* Список расписаний */}
                    <div className="timesheet__schedule-list">
                        <div className="timesheet__header">
                            <h3 className="timesheet__subtitle">Расписание врача</h3>
                            <div className="timesheet__buttons">
                                <button
                                    onClick={() => setShowAddDay(true)}
                                    className="timesheet__button timesheet__button--primary"
                                >
                                    Добавить день
                                </button>
                                {selectedSchedule &&
                                    <button
                                        onClick={() => { console.log('Delete day') }}
                                        className="timesheet__button"
                                    >
                                        Удалить день
                                    </button>
                                }
                            </div>
                        </div>

                        {showAddDay && (
                            <div className="timesheet__add-day">
                                <label className="timesheet__label">Дата:</label>
                                <input type="date" className="timesheet__input" />

                                <label className="timesheet__label">Время начала:</label>
                                <input type="time" className="timesheet__input" />

                                <label className="timesheet__label">Время конца:</label>
                                <input type="time" className="timesheet__input" />

                                <div className="timesheet__actions">
                                    <button className="timesheet__button timesheet__button--success">
                                        Сохранить
                                    </button>
                                    <button
                                        onClick={() => setShowAddDay(false)}
                                        className="timesheet__button timesheet__button--secondary"
                                    >
                                        Отмена
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="timesheet__days">
                            {schedules ? (
                                schedules.map((s) => (
                                    <motion.div
                                        key={s.id}
                                        whileHover={{ scale: 1.02 }}
                                        className={`timesheet__day ${selectedSchedule?.id === s.id ? "timesheet__day--selected" : ""}`}
                                        onClick={() => setSelectedSchedule(s)}
                                    >
                                        <div className="timesheet__day-info">
                                            <span className="timesheet__day-date">{new Date(s.date).toLocaleDateString()}</span>
                                            <span className="timesheet__day-time">
                                                {s.time_start.slice(0, 5)} - {s.time_end.slice(0, 5)}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div>Нет данных</div>
                            )}
                        </div>
                    </div>

                    {/* Таймслоты выбранного дня */}
                    <div className="timesheet__slots">
                        <h3 className="timesheet__subtitle">
                            {selectedSchedule
                                ? `Ячейки времени (${new Date(selectedSchedule.date).toLocaleDateString()})`
                                : "Выберите день"}
                        </h3>

                        {selectedSchedule ? (
                            <div className="timesheet__slots-list">
                                {selectedSchedule.timeSlot
                                    ? selectedSchedule.timeSlot.map((slot: ISlots, index) => (
                                        <div key={index} className="timesheet__slot">
                                            <span className="timesheet__slot-time">{slot.time.slice(0, 5)}</span>
                                            <button className="timesheet__button timesheet__button--danger timesheet__button--small">
                                                Удалить
                                            </button>
                                        </div>
                                    ))
                                    : <div>Ячеек нет</div>
                                }
                                <button className="timesheet__button timesheet__button--primary">
                                    Добавить ячейку
                                </button>
                            </div>
                        ) : (
                            <p className="timesheet__placeholder">
                                Выберите день слева, чтобы увидеть ячейки времени
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </AccountLayout>
    );
};

export default observer(TimeSheet);