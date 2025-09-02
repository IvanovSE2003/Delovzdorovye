import { useContext, useEffect, useState } from "react";
import { motion } from "framer-motion";
import AccountLayout from "../../AccountLayout";
import { Context } from "../../../../main";
import { observer } from "mobx-react-lite";
import type { ISchedules, ISlots } from "../../../../models/Schedules";
import ScheduleService from "../../../../services/ScheduleService";

import Loader from "../../../../components/UI/Loader/Loader";
import "./TimeSheet.scss";

export interface IScheduleCreate {
    date: string;
    time_start: string;
    time_end: string;
    userId: number;
}

export interface ISlotCreate {
    time: string;
    scheduleId: number | undefined;
}

const TimeSheet = () => {
    const { store } = useContext(Context);

    const [schedules, setSchedules] = useState<ISchedules[] | null>(null);
    const [selectedSchedule, setSelectedSchedule] = useState<ISchedules | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const [showAddDay, setShowAddDay] = useState<boolean>(false);
    const [showAddSlot, setShowAddSlot] = useState<boolean>(false);

    const [dayCreate, setDayCreate] = useState<IScheduleCreate>({} as IScheduleCreate);
    const [slotCreate, setSlotCreate] = useState<ISlotCreate>({} as ISlotCreate);

    const handleInputChangeDay = (field: keyof IScheduleCreate) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setDayCreate(prev => ({
            ...prev,
            [field]: e.target.value,
        }));
    };

    const handleInputChangeSlot = (field: keyof ISlotCreate) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setSlotCreate(prev => ({
            ...prev,
            [field]: e.target.value
        }));
    };

    // Получение всех данных
    const getSchedules = async () => {
        try {
            setLoading(true);
            const response = await ScheduleService.getSchedules(store.user.id);
            console.log(response.data)
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

            const scheduleData = {
                ...dayCreate,
                date: dayCreate.date ? new Date(dayCreate.date).toISOString() : '',
                userId: store.user.id
            };

            console.log("Добавление дня на данные: ", scheduleData);
            await ScheduleService.addDay(scheduleData);

            setDayCreate({
                date: '',
                time_start: '',
                time_end: '',
                userId: store.user.id
            });
        } catch (e: any) {
            console.error(e.message);
        } finally {
            setLoading(false);
            setShowAddDay(false);
            await getSchedules();
        }
    }


    // Удаление дня
    const deleteDay = async () => {
        try {
            setLoading(true);
            await ScheduleService.deleteDay(selectedSchedule?.id);
            console.log("Удаление дня: ", selectedSchedule?.id);
        } catch (e: any) {
            console.error(e.message);
        } finally {
            setLoading(false);
            await getSchedules();
        }
    }

    // Добавление ячейки времени
    const addSlot = async () => {
        try {
            setLoading(true);

            const slotData = {
                ...slotCreate,
                scheduleId: selectedSchedule?.id
            };

            console.log("Добавление ячейки времени на данные: ", slotData);
            await ScheduleService.addSlot(slotData);

            setSlotCreate({
                time: '',
                scheduleId: selectedSchedule?.id
            })

        } catch (e: any) {
            console.error(e.message);
        } finally {
            setLoading(false);
            setShowAddSlot(false);
        }
    }

    // Удаление ячейки времени
    const deleteSlot = async (id: number) => {
        try {
            setLoading(true);
            console.log("Удаление ячейки времени : ", id);
            await ScheduleService.deleteSlot(id);
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
                                        onClick={deleteDay}
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
                                <input
                                    type="date"
                                    className="timesheet__input"
                                    value={dayCreate.date}
                                    onChange={handleInputChangeDay('date')}
                                />

                                <label className="timesheet__label">Время начала:</label>
                                <input
                                    type="time"
                                    className="timesheet__input"
                                    value={dayCreate.time_start}
                                    onChange={handleInputChangeDay('time_start')}
                                />

                                <label className="timesheet__label">Время конца:</label>
                                <input
                                    type="time"
                                    className="timesheet__input"
                                    value={dayCreate.time_end}
                                    onChange={handleInputChangeDay('time_end')}
                                />

                                <div className="timesheet__actions">
                                    <button
                                        className="timesheet__button timesheet__button--success"
                                        onClick={addDay}
                                        disabled={loading || !dayCreate.date || !dayCreate.time_start || !dayCreate.time_end}
                                    >
                                        {loading ? 'Сохранение...' : 'Сохранить'}
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
                            {schedules && schedules.length > 0 ? (
                                schedules.map((s) => (
                                    <motion.div
                                        key={s.id}
                                        whileHover={{ scale: 1.02 }}
                                        className={`timesheet__day ${selectedSchedule?.id === s.id ? "timesheet__day--selected" : ""}`}
                                        onClick={() => setSelectedSchedule(s)}
                                    >
                                        <div className="timesheet__day-info">
                                            <span className="timesheet__day-date">
                                                {s?.date ? new Date(s.date).toLocaleDateString() : "—"}
                                            </span>
                                            <span className="timesheet__day-time">
                                                {s?.time_start ? s.time_start.slice(0, 5) : "—"} - {s?.time_end ? s.time_end.slice(0, 5) : "—"}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div>Нет данных</div>
                            )}

                        </div>
                    </div>

                    <div className="timesheet__slots">
                        <h3 className="timesheet__subtitle">
                            {selectedSchedule
                                ? `Ячейки времени (${new Date(selectedSchedule.date).toLocaleDateString()})`
                                : "Выберите день"}
                        </h3>

                        {selectedSchedule ? (
                            <div className="timesheet__slots-list">
                                {selectedSchedule.timeSlot && selectedSchedule.timeSlot.length > 0 ? (
                                    selectedSchedule.timeSlot.map((slot: ISlots, index) => (
                                        <div key={index} className="timesheet__slot">
                                            <span className="timesheet__slot-time">
                                                {slot.time ? slot.time.slice(0, 5) : "—"}
                                            </span>
                                            <button
                                                className="timesheet__button timesheet__button--danger timesheet__button--small"
                                                onClick={() => deleteSlot(slot.id)}
                                            >
                                                Удалить
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div>Ячеек нет</div>
                                )}

                                <button
                                    className="timesheet__button timesheet__button--primary"
                                    onClick={() => setShowAddSlot(true)}
                                >
                                    Добавить ячейку времени
                                </button>
                            </div>
                        ) : (
                            <p className="timesheet__placeholder">
                                Выберите день слева, чтобы увидеть ячейки времени
                            </p>
                        )}

                        {showAddSlot && (
                            <div className="timesheet__add-slot">
                                <br />
                                <label className="timesheet__label">Время:</label>
                                <input
                                    type="time"
                                    className="timesheet__input"
                                    value={slotCreate.time}
                                    onChange={handleInputChangeSlot('time')}
                                />

                                <div className="timesheet__actions">
                                    <button
                                        className="timesheet__button timesheet__button--success"
                                        onClick={addSlot}
                                        disabled={loading || !slotCreate.time}
                                    >
                                        {loading ? 'Сохранение...' : 'Сохранить'}
                                    </button>
                                    <button
                                        onClick={() => setShowAddSlot(false)}
                                        className="timesheet__button timesheet__button--secondary"
                                    >
                                        Отмена
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AccountLayout>
    );
};

export default observer(TimeSheet);