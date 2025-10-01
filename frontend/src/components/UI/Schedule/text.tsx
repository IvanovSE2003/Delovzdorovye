import React, { useState, useEffect, useCallback } from "react";
import { Calendar, type SlotInfo, type Event, dayjsLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import "./ScheduleCalendar.scss";
import ScheduleService from "../../../services/ScheduleService";
import ConsultationService from "../../../services/ConsultationService";
import type { Consultation } from "../../../features/account/UpcomingConsultations/UpcomingConsultations";
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import CustomToolbar from './CustomToolbar';

dayjs.locale('ru');
const localizer = dayjsLocalizer(dayjs);

export type SlotStatus = "closed" | "open" | "booked";

interface ScheduleCalendarProps {
    onChange?: (slots: Record<string, SlotStatus>) => void;
    userId: number;
}

type ModalData =
    | { type: "open"; slots: CalendarSlot[] }
    | { type: "reset"; slot: CalendarSlot }
    | { type: "booked"; slot: CalendarSlot; consultation: Consultation };

interface CalendarSlot {
    id?: number;
    start: Date;
    end: Date;
    status: SlotStatus;
    date: string;
    time: string;
}

const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({ onChange, userId }) => {
    const [slots, setSlots] = useState<CalendarSlot[]>([]);
    const [modalData, setModalData] = useState<ModalData | null>(null);
    const [showInfo, setShowInfo] = useState<boolean>(false);
    const [currentDate, setCurrentDate] = useState<Date>(new Date());

    // Загрузка расписания
    const fetchSchedule = useCallback(async () => {
        try {
            const startDate = moment(currentDate).startOf('month').format('YYYY-MM-DD');
            const endDate = moment(currentDate).endOf('month').format('YYYY-MM-DD');

            const res = await ScheduleService.getScheduleWeek(startDate, endDate, userId);

            const mappedSlots: CalendarSlot[] = res.data.map((slotObj: any) => {
                const date = moment(slotObj.date).format('YYYY-MM-DD');
                const time = slotObj.time.slice(0, 5);
                const start = moment(`${date} ${time}`, 'YYYY-MM-DD HH:mm').toDate();
                const end = moment(start).add(1, 'hour').toDate();

                let status: SlotStatus = "closed";
                if (slotObj.status === "OPEN") status = "open";
                if (slotObj.status === "BOOKED") status = "booked";

                return {
                    id: slotObj.id,
                    start,
                    end,
                    status,
                    date,
                    time
                };
            });

            setSlots(mappedSlots);
        } catch (e) {
            console.error("Ошибка при получении расписания:", e);
        }
    }, [currentDate, userId]);

    useEffect(() => {
        fetchSchedule();
    }, [fetchSchedule]);

    const events: Event[] = slots.map(slot => ({
        start: slot.start,
        end: slot.end,
        title: getEventTitle(slot.status) || 'Событие', // Добавляем fallback
        resource: slot
    }));

    function getEventTitle(status: SlotStatus): string {
        switch (status) {
            case 'open': return 'Доступно';
            case 'booked': return 'Забронировано';
            case 'closed': return 'Закрыто';
            default: return 'Событие'; // Добавляем значение по умолчанию
        }
    }

    // Стилизация событий
    const eventStyleGetter = (event: Event) => {
        const slot = event.resource as CalendarSlot;
        const now = new Date();
        const eventStart = new Date(slot.start);
        const eventEnd = new Date(slot.end);

        const isCurrent = now >= eventStart && now < eventEnd;
        const isPast = now >= eventEnd;

        let style: any = {
            backgroundColor: '#f0f0f0',
            border: '1px solid #ccc',
            color: '#000',
            borderRadius: '4px',
            fontSize: '12px',
            opacity: 1
        };

        if (isPast && !isCurrent) {
            style.backgroundColor = '#193d60ff !important';
            style.border = '1px solid #082f56ff !important';
            style.color = '#6c757d';
            style.opacity = 0.6;
        } else {
            switch (slot.status) {
                case 'open':
                    style.backgroundColor = '#d4edda';
                    style.border = '1px solid #c3e6cb';
                    break;
                case 'booked':
                    style.backgroundColor = '#f8d7da';
                    style.border = '1px solid #f5c6cb';
                    break;
                case 'closed':
                default:
                    break;
            }
        }

        return { style };
    };

    // Обработка выделения диапазона
    const handleSelectSlot = useCallback(async (slotInfo: SlotInfo) => {
        const { start, end } = slotInfo;

        const now = new Date();
        if (end <= now) {
            return;
        }

        const selectedSlots: CalendarSlot[] = [];

        let current = moment(start);
        const endMoment = moment(end);

        while (current.isBefore(endMoment)) {
            const slotStart = current.toDate();
            const slotEnd = current.add(1, 'hour').toDate();

            if (slotEnd <= now && !(slotStart <= now && slotEnd > now)) {
                continue;
            }

            // Находим существующую ячейку (включая забронированные)
            const existingSlotAll = slots.find(s => moment(s.start).isSame(slotStart));

            selectedSlots.push({
                start: slotStart,
                end: slotEnd,
                status: existingSlotAll?.status || 'closed',
                id: existingSlotAll?.id,
                date: moment(slotStart).format('YYYY-MM-DD'),
                time: moment(slotStart).format('HH:mm')
            });
        }

        if (selectedSlots.length > 0) {
            setModalData({ type: "open", slots: selectedSlots });
        }
    }, [slots]);

    // Обработка клика по событию
    const handleSelectEvent = useCallback(async (event: Event) => {
        const slot = event.resource as CalendarSlot;
        const now = new Date();

        if (slot.end <= now && !(slot.start <= now && slot.end > now)) {
            return;
        }

        if (slot.status === 'booked') {
            try {
                const res = await ConsultationService.getAllConsultations(1, 1, {
                    date: slot.date,
                    doctorUserId: userId,
                });
                if (res.data.consultations && res.data.consultations.length > 0) {
                    setModalData({
                        type: "booked",
                        slot,
                        consultation: res.data.consultations[0]
                    });
                }
            } catch (e) {
                console.error("Ошибка при получении консультации:", e);
            }
        } else if (slot.status === 'open') {
            setModalData({ type: "reset", slot });
        }
    }, [userId]);

    // Функции для модальных окон
    const handleOpenSlots = async (recurring: boolean) => {
        if (!modalData || modalData.type !== 'open') return;

        try {
            const toOpen = modalData.slots.filter(s => s.status === 'closed');
            const booked = modalData.slots.filter(s => s.status === 'booked');

            if (booked.length > 0) {
                // Уведомляем, что есть пересечения с забронированными ячейками
                alert(`В выбранном диапазоне есть ${booked.length} забронированных слота(ов). Они не будут изменены.`);
            }

            for (const slot of toOpen) {
                const dayWeek = (moment(slot.start).day() + 6) % 7;

                if (recurring) {
                    await ScheduleService.setSchuduleDayRecurning(
                        slot.time,
                        slot.date,
                        dayWeek,
                        userId
                    );
                } else {
                    await ScheduleService.setSchuduleDay(
                        slot.time,
                        slot.date,
                        userId,
                        dayWeek
                    );
                }
            }
            await fetchSchedule();
        } catch (e) {
            console.error("Ошибка при открытии слотов:", e);
        } finally {
            setModalData(null);
            setShowInfo(false);
        }
    };

    const handleCloseSlots = async () => {
        if (!modalData || modalData.type !== 'open') return;

        const toClose = modalData.slots.filter(s => s.status === 'open' && s.id);
        if (toClose.length === 0) {
            setModalData(null);
            return;
        }

        const ok = window.confirm(`Вы уверены, что хотите закрыть слоты (${toClose.length})? Это действие удалит эти слоты.`);
        if (!ok) return;

        try {
            for (const slot of toClose) {
                if (slot.id) {
                    await ScheduleService.deleteSlot(slot.id);
                }
            }
            await fetchSchedule();
        } catch (e) {
            console.error("Ошибка при закрытии слотов:", e);
        } finally {
            setModalData(null);
            setShowInfo(false);
        }
    };

    const handleResetSlot = async () => {
        if (!modalData || modalData.type !== 'reset') return;

        try {
            const slotId = modalData.slot.id;
            if (slotId) {
                await ScheduleService.deleteSlot(slotId);
                await fetchSchedule();
            }
        } catch (e) {
            console.error("Ошибка при сбросе слота:", e);
        } finally {
            setModalData(null);
        }
    };

    const minTime = new Date();
    minTime.setHours(8, 0, 0);
    const maxTime = new Date();
    maxTime.setHours(22, 0, 0);
    return (
        <div className="schedule-calendar">
            <div className="schedule-calendar__legend">
                <div className="legend-item">
                    <div className="legend-color legend-color--open"></div>
                    <span>Открыто для записи</span>
                </div>
                <div className="legend-item">
                    <div className="legend-color legend-color--booked"></div>
                    <span>Забронировано</span>
                </div>
                <div className="legend-item">
                    <div className="legend-color legend-color--closed"></div>
                    <span>Закрыто</span>
                </div>
            </div>

            <Calendar
                localizer={localizer}
                events={events}
                components={{
                    // toolbar: CustomToolbar
                }}
                startAccessor="start"
                endAccessor="end"
                selectable
                onSelectSlot={handleSelectSlot}
                onSelectEvent={handleSelectEvent}
                onNavigate={setCurrentDate}
                date={currentDate}
                views={['week']}
                step={60}
                timeslots={1}
                min={minTime}
                max={maxTime}
                messages={{
                    next: "Вперед",
                    previous: "Назад",
                    today: "Сегодня",
                }}

            />

            {/* Модальное окно для открытия слотов */}
            {modalData && modalData.type === "open" && (
                <div className="modal">
                    <div className="timesheet__modal">
                        <h1 className="consultation-modal__title">
                            Операции с выбранными слотами
                        </h1>

                        <button
                            className="consultation-modal__close"
                            onClick={() => {
                                setModalData(null);
                                setShowInfo(false);
                            }}
                        >
                            ×
                        </button>

                        <div className="selected-slots-info">
                            <p>Выбранные слоты:</p>
                            <div className="selected-slots__grid">
                                {modalData.slots.map((slot, index) => (
                                    <div key={index} className={`time-slot-chip time-slot-chip--${slot.status}`}>
                                        {dayjs(slot.start).format('HH:mm')} {slot.status === 'booked' ? '(Забронировано)' : ''}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginTop: 12 }}>
                            <p><b>Кратко:</b></p>
                            <ul>
                                <li>Закрытые слоты можно открыть.</li>
                                <li>Открытые слоты можно массово закрыть (будет подтверждение).</li>
                                <li>Забронированные слоты не трогаются; если в выбранном диапазоне есть брони — вы увидите предупреждение.</li>
                            </ul>
                        </div>

                        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                            <button
                                className="my-button width100"
                                onClick={() => handleOpenSlots(false)}
                                disabled={modalData.slots.filter(s => s.status === 'closed').length === 0}
                            >
                                Только для этого дня — Открыть
                            </button>

                            <button
                                className="my-button width100"
                                onClick={() => handleOpenSlots(true)}
                                disabled={modalData.slots.filter(s => s.status === 'closed').length === 0}
                            >
                                Каждую неделю — Открыть
                            </button>
                        </div>

                        <div style={{ marginTop: 8 }}>
                            <button
                                className="my-button width100"
                                onClick={handleCloseSlots}
                                disabled={modalData.slots.filter(s => s.status === 'open').length === 0}
                            >
                                Закрыть уже открытые слоты
                            </button>
                        </div>

                        {modalData.slots.some(s => s.status === 'booked') && (
                            <div style={{ marginTop: 12, color: '#8a2b2b' }}>
                                ⚠️ В выбранном диапазоне есть забронированные слоты — они останутся нетронутыми.
                            </div>
                        )}

                    </div>
                </div>
            )}

            {/* Модальное окно сброса */}
            {modalData && modalData.type === "reset" && (
                <div className="modal">
                    <div className="timesheet__modal">
                        <h1 className="consultation-modal__title">
                            Сброс временного слота
                        </h1>

                        <button className="consultation-modal__close" onClick={() => setModalData(null)}>
                            ×
                        </button>

                        <p>
                            {dayjs(modalData.slot.start).format('dddd, DD MMMM YYYY')} с{' '}
                            {dayjs(modalData.slot.start).format('HH:mm')} до{' '}
                            {dayjs(modalData.slot.end).format('HH:mm')}
                        </p>

                        <p style={{ textAlign: 'center', fontSize: '1.2rem' }}>
                            Хотите закрыть этот слот для записи?
                        </p>

                        <div className="modal__actions">
                            <button onClick={handleResetSlot} style={{ backgroundColor: "green" }}>
                                Да
                            </button>
                            <button onClick={() => setModalData(null)} style={{ backgroundColor: "darkred" }}>
                                Нет
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Модальное окно информации о консультации */}
            {modalData && modalData.type === "booked" && (
                <div className="modal">
                    <div className="timesheet__modal">
                        <h1 className="consultation-modal__title">
                            Информация о консультации
                        </h1>

                        <button className="consultation-modal__close" onClick={() => setModalData(null)}>
                            ×
                        </button>

                        <p>
                            <b>Дата и время:</b> {dayjs(modalData.slot.start).format('dddd, DD MMMM YYYY HH:mm')}
                        </p>
                        <p>
                            <b>Клиент:</b> {modalData.consultation.PatientSurname}{' '}
                            {modalData.consultation.PatientName}{' '}
                            {modalData.consultation?.PatientPatronymic || ''}
                        </p>
                        <p>
                            <b>Симптомы:</b> {modalData.consultation.Problems?.join(', ') || 'Не указаны'}
                        </p>
                        <p>
                            <b>Подробно:</b>{' '}
                            {modalData.consultation.other_problem || 'Не указано'}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ScheduleCalendar;