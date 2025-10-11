import React, { useState, useEffect, useCallback } from "react";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import weekday from "dayjs/plugin/weekday";
import localizedFormat from "dayjs/plugin/localizedFormat";
import "dayjs/locale/ru";
import ScheduleService from "../../../services/ScheduleService";
import ConsultationService from "../../../services/ConsultationService";
import "./Schedule.scss";
import type { Consultation } from "../../../models/consultations/Consultation";
import { getDateLabel } from "../../../helpers/formatDatePhone";
import { API_URL } from "../../../http";
import ModalHeader from "../Modals/ModalHeader/ModalHeader";
import ShowError from "../ShowError/ShowError";

dayjs.extend(isBetween);
dayjs.extend(weekday);
dayjs.extend(localizedFormat);
dayjs.locale("ru");

const HOURS = Array.from({ length: 16 }, (_, i) => `${String(i + 8).padStart(2, "0")}:00`);
const VIEW_DAYS = 7;
const MAX_MONTH_OFFSET = 1.5;

type SlotStatus = "closed" | "open" | "booked";

type SlotAnalysis = {
  hasOpen: boolean;
  hasClosed: boolean;
  hasBooked: boolean;
  openSlots: string[];
  closedSlots: string[];
  bookedSlots: string[];
};

type ModalData =
  | { type: "open" | "reset" | "booked"; day: string; time: string }
  | { type: "range"; day: string; times: string[]; analysis: SlotAnalysis };

interface DoctorScheduleCalendarProps {
  userId: number;
  onChange?: (slots: Record<string, SlotStatus>) => void;
  updateTrigger?: number;
  initialDate?: dayjs.Dayjs;
  handleBreak: () => void;
}

const DoctorScheduleCalendar: React.FC<DoctorScheduleCalendarProps> = ({ userId, onChange, initialDate, updateTrigger, handleBreak }) => {
  const today = dayjs();
  const minDate = today.subtract(MAX_MONTH_OFFSET, "month").startOf("month");
  const maxDate = today.add(MAX_MONTH_OFFSET, "month").endOf("month");

  const [anchorDate, setAnchorDate] = useState(dayjs(initialDate || today).startOf("week"));
  const [slots, setSlots] = useState<Record<string, SlotStatus>>({});
  const [slotToId, setSlotToId] = useState<Record<string, number>>({});
  const [modalData, setModalData] = useState<ModalData | null>(null);
  const [consultationInfo, setConsultationInfo] = useState<Consultation[] | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [startSlot, setStartSlot] = useState<string | null>(null);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [hoveredCol, setHoveredCol] = useState<string | null>(null);
  const [error, setError] = useState<{ id: number, message: string }>({ id: 0, message: "" });

  const visibleDays = Array.from({ length: VIEW_DAYS }, (_, i) => dayjs(anchorDate).add(i, "day"));
  const weekDaysISO = visibleDays.map((d) => d.format("YYYY-MM-DD"));
  const currentHour = dayjs().format("HH:00");
  const todayStr = dayjs().format("YYYY-MM-DD");

  // Получение расписания
  const fetchSchedule = useCallback(async () => {
    try {
      const startDate = weekDaysISO[0];
      const endDate = weekDaysISO[6];
      const res = await ScheduleService.getScheduleWeek(startDate, endDate, userId);

      const mapped: Record<string, SlotStatus> = {};
      const idMap: Record<string, number> = {};

      res.data.forEach((slotObj: any) => {
        const day = dayjs(slotObj.date).format("YYYY-MM-DD");
        const time = slotObj.time.slice(0, 5);
        const key = `${day}_${time}`;

        let status: SlotStatus = "closed";
        if (slotObj.status === "OPEN") status = "open";
        if (slotObj.status === "BOOKED") status = "booked";

        mapped[key] = status;
        idMap[key] = slotObj.id;
      });

      setSlots(mapped);
      setSlotToId(idMap);
      if (onChange) onChange(mapped);
    } catch (e) {
      console.error("Ошибка при получении расписания:", e);
    }
  }, [weekDaysISO, userId, onChange]);

  useEffect(() => {
    fetchSchedule();
  }, [anchorDate, updateTrigger]);

  // Аналитика выбранных временных ячеек
  function analyzeSelectedSlots(selectedSlots: string[]): SlotAnalysis {
    const analysis: SlotAnalysis = {
      hasOpen: false,
      hasClosed: false,
      hasBooked: false,
      openSlots: [],
      closedSlots: [],
      bookedSlots: [],
    };

    selectedSlots.forEach(slot => {
      const [day, time] = slot.split('_');
      const status = getSlotStatus(day, time);

      if (status === 'open') {
        analysis.hasOpen = true;
        analysis.openSlots.push(slot);
      } else if (status === 'closed') {
        analysis.hasClosed = true;
        analysis.closedSlots.push(slot);
      } else if (status === 'booked') {
        analysis.hasBooked = true;
        analysis.bookedSlots.push(slot);
      }
    });

    return analysis;
  }

  useEffect(() => {
    const handleMouseUp = () => {
      if (isSelecting && startSlot) {
        setIsSelecting(false);

        if (selectedSlots.length > 1) {
          const hasPast = selectedSlots.some((slot) => {
            const [day, time] = slot.split('_');
            return isPastSlot(day, time);
          });

          if (hasPast) {
            setError({ id: Date.now(), message: "Вы задели прошедшие слоты — изменить их нельзя." });
            setSelectedSlots([]);
            setIsSelecting(false);
            return;
          }

          const analysis = analyzeSelectedSlots(selectedSlots);
          const day = startSlot.split('_')[0];

          setModalData({
            type: "range",
            day: day,
            times: selectedSlots.map((s) => s.split("_")[1]).sort(),
            analysis: analysis
          });
        }

      }
      setStartSlot(null);
    };

    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, [isSelecting, selectedSlots, startSlot]);

  // Получение статуса временной ячейки
  function getSlotStatus(day: string, time: string): SlotStatus {
    return slots[`${day}_${time}`] || "closed";
  }

  // Проверка что временная ячейка является прошедшей
  function isPastSlot(day: string, time: string) {
    const slotDateTime = dayjs(`${day} ${time}`, "YYYY-MM-DD HH:mm");
    const now = dayjs();

    if (slotDateTime.isBefore(now, "day")) return true;
    if (slotDateTime.isSame(now, "day")) return slotDateTime.isBefore(now, "hour");
    return false;
  }

  // Проверка что временная ячейка является текущей (та, которая действует сейчас)
  function isCurrentHourSlot(day: string, time: string) {
    return day === todayStr && time === currentHour;
  }

  // Проверка на границы навигации по расписания
  function canNavigate(deltaDays: number) {
    const newStart = dayjs(anchorDate).add(deltaDays, "day").startOf("week");
    const newEnd = newStart.add(VIEW_DAYS - 1, "day");

    return !(
      newStart.endOf("day").isBefore(minDate) ||
      newEnd.startOf("day").isAfter(maxDate)
    );
  }

  // Перемещение по неделям в пределах расписания
  function go(deltaDays: number) {
    const candidate = dayjs(anchorDate).add(deltaDays, "day");

    const newStart = candidate.startOf("week");
    const newEnd = newStart.add(VIEW_DAYS - 1, "day");

    if (newStart.isBefore(minDate)) {
      setAnchorDate(minDate.startOf("week"));
    } else if (newEnd.isAfter(maxDate)) {
      setAnchorDate(maxDate.subtract(VIEW_DAYS - 1, "day").startOf("week"));
    } else {
      setAnchorDate(newStart);
    }
  }

  // Расчет выбранного диапазона временных ячеек
  function calculateRange(start: string, end: string): string[] {
    const [startDay, startTime] = start.split('_');
    const [endDay, endTime] = end.split('_');

    if (startDay !== endDay) {
      return [start];
    }

    const startHour = parseInt(startTime.split(':')[0]);
    const endHour = parseInt(endTime.split(':')[0]);

    const slots: string[] = [];
    const minHour = Math.min(startHour, endHour);
    const maxHour = Math.max(startHour, endHour);

    for (let hour = minHour; hour <= maxHour; hour++) {
      const time = `${String(hour).padStart(2, '0')}:00`;
      slots.push(`${startDay}_${time}`);
    }

    return slots;
  }

  // Обработка нажатия на одну временную ячейку
  const handleSingleClick = async (day: string, time: string) => {
    const normalizedDay = dayjs(day).format("YYYY-MM-DD");
    const status = getSlotStatus(normalizedDay, time);

    if (status === "closed") {
      setModalData({ type: "open", day: normalizedDay, time });
    } else if (status === "open") {
      setModalData({ type: "reset", day: normalizedDay, time });
    } else if (status === "booked") {
      try {
        const res = await ConsultationService.getAllConsultations(1, 1, {
          date: normalizedDay,
          doctorUserId: userId,
        });
        setConsultationInfo(res.data.consultations);
        setModalData({ type: "booked", day: normalizedDay, time });
      } catch (e) {
        console.error("Ошибка при получении консультации:", e);
      }
    }
  };

  // Открытие одной временной ячейки
  async function openSingleDay(day: string, time: string) {
    try {
      const dayWeek = (dayjs(day).day() + 6) % 7;
      await ScheduleService.setSchuduleDay(time, day, userId, dayWeek);
      await fetchSchedule();
    } catch (e) {
      console.error(e);
    } finally {
      setModalData(null);
      setSelectedSlots([]);
    }
  }

  // Открытие одной временной ячейки на несколько недель
  async function openRepeating(day: string, time: string) {
    try {
      const dayWeek = (dayjs(day).day() + 6) % 7;
      await ScheduleService.setSchuduleDayRecurning(time, day, dayWeek, userId);
      await fetchSchedule();
    } catch (e) {
      console.error(e);
    } finally {
      setModalData(null);
      setSelectedSlots([]);
    }
  }

  // Открытие нескольих временных ячеек
  async function openRangeSingle(day: string, times: string[]) {
    try {
      const dayWeek = (dayjs(day).day() + 6) % 7;
      const timeGap = times.sort();
      await ScheduleService.setSchuduleGapDay(timeGap[0], timeGap[timeGap.length - 1], day, dayWeek, userId);
      await fetchSchedule();
    } catch (e) {
      console.error(e);
    } finally {
      setModalData(null);
      setSelectedSlots([]);
    }
  }

  // Открытие нескольих временных ячеек на несколько недель
  async function openRangeRepeating(day: string, times: string[]) {
    try {
      const dayWeek = (dayjs(day).day() + 6) % 7;
      const timeGap = times.sort();
      await ScheduleService.setSchuduleGapDayRecurning(timeGap[0], timeGap[timeGap.length - 1], day, dayWeek, userId);
      await fetchSchedule();
    } catch (e) {
      console.error(e);
    } finally {
      setModalData(null);
      setSelectedSlots([]);
    }
  }

  // Сбросить временную ячейку до закрытого
  async function resetSlot(day: string, time: string) {
    try {
      const key = `${day}_${time}`;
      const id = slotToId[key];
      if (!id) {
        console.warn("Нет id для этого слота, сброс невозможен");
        return;
      }
      await ScheduleService.deleteSlot(id);
      await fetchSchedule();
    } catch (e) {
      console.error(e);
    } finally {
      setModalData(null);
      setSelectedSlots([]);
    }
  }

  // Сбросить несколько временных ячеек до зактрыого
  async function closeSelectedSlots(slots: string[]) {
    try {
      const openSlots = slots.filter(slot => {
        const [day, time] = slot.split('_');
        return getSlotStatus(day, time) === 'open';
      });

      for (const slot of openSlots) {
        const [day, time] = slot.split('_');
        const key = `${day}_${time}`;
        const id = slotToId[key];

        if (id) {
          await ScheduleService.deleteSlot(id);
        }
      }

      await fetchSchedule();
    } catch (e) {
      console.error("Ошибка при закрытии слотов:", e);
    } finally {
      setModalData(null);
      setSelectedSlots([]);
    }
  }

  const weekLabel = `${dayjs(weekDaysISO[0]).format("DD MMMM")} – ${dayjs(weekDaysISO[6]).format("DD MMMM")}`;

  return (
    <div className="schedule-grid">
      <div className="schedule-grid__header">
        <div style={{ display: 'flex', gap: '30px', height: '100px', alignItems: 'center' }}>
          <h1 className="schedule-grid__title">Расписание</h1>
          <button
            className="my-button timesheet__break"
            onClick={handleBreak}
          >
            Взять перерыв
          </button>
        </div>
        <div className="schedule-grid__week-switcher">
          <button onClick={() => go(-VIEW_DAYS)} disabled={!canNavigate(-VIEW_DAYS)}>{'<'}</button>
          <span className="schedule-grid__week-label">{weekLabel}</span>
          <button onClick={() => go(VIEW_DAYS)} disabled={!canNavigate(VIEW_DAYS)}>{'>'}</button>
        </div>
      </div>

      <ShowError msg={error} className="schedule-grid__error" />

      <table className="schedule-grid__table">
        <thead className="schedule-grid__head">
          <tr>
            <th className="schedule-grid__time"></th>
            {weekDaysISO.map((d) => (
              <th key={d} className={`schedule-grid__day ${d === todayStr ? "schedule-grid__day--today" : ""} ${hoveredCol === d ? "highlight" : ""}`}>
                {dayjs(d).format("DD, dd")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {HOURS.map((time) => (
            <tr key={time}>
              <td className={`schedule-grid__time ${hoveredRow === time ? "highlight" : ""}`}>{time}</td>
              {weekDaysISO.map((day) => {
                const status = getSlotStatus(day, time);
                const isToday = day === todayStr;
                const isPast = isPastSlot(day, time);
                const isCurrentHour = isCurrentHourSlot(day, time);
                const key = `${day}_${time}`;
                const isSelected = selectedSlots.includes(key);

                let slotClass = `schedule-grid__slot`;

                if (status === "booked" && isPast) {
                  slotClass += " schedule-grid__slot--booked-past";
                } else {
                  slotClass += ` schedule-grid__slot--${status}`;
                }

                if (isToday) slotClass += " schedule-grid__slot--today";
                if (isPast && status !== "booked") slotClass += " schedule-grid__slot--past";
                if (isCurrentHour) slotClass += " schedule-grid__slot--current-hour";
                if (isSelected) slotClass += " schedule-grid__slot--selected";

                return (
                  <td
                    key={key}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      if (!isPast || (status === "booked" && isPast)) {
                        setIsSelecting(true);
                        setStartSlot(key);
                        setSelectedSlots([key]);
                      }
                    }}
                    onMouseEnter={() => {
                      if (isSelecting && startSlot) {
                        const newSelectedSlots = calculateRange(startSlot, key);
                        setSelectedSlots(newSelectedSlots);
                      }
                      if (!isPast || (status === "booked" && isPast)) {
                        setHoveredRow(time);
                        setHoveredCol(day);
                      }
                    }}
                    onMouseLeave={() => {
                      setHoveredRow(null);
                      setHoveredCol(null);
                    }}
                    onClick={() => {
                      if ((!isPast || (status === "booked" && isPast)) && selectedSlots.length <= 1) {
                        handleSingleClick(day, time);
                      }
                    }}
                    className={slotClass}
                  >
                    {status === "booked" && <span className="slot__icon">
                      {`${time} - ${String((Number(time.split(":")[0]) + 1) % 24).padStart(2, "0")}:00`}
                    </span>}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>


      {/* Выбранный диапазон */}
      {modalData && modalData.type === "range" && (
        <Modal onClose={() => { setModalData(null); setSelectedSlots([]); }} title="Открыть слоты">
          <p className="timesheet__modal__text">
            {dayjs(modalData.day).format("dddd, DD MMMM YYYY")}
          </p>
          {/* Детальная информация по слотам */}
          <div>
            {modalData.analysis.closedSlots.length > 0 && (
              <details className="schedule-grid__details">

                <summary className="schedule-grid__summary schedule-grid__summary--close">
                  Закрытые слоты ({modalData.analysis.closedSlots.length})
                </summary>

                <div className="schedule-grid__summary__toggle">
                  {modalData.analysis.closedSlots.map((slot) => {
                    const [_, time] = slot.split('_');
                    return (
                      <span className="schedule-grid__summary__toggle__block" key={slot}>
                        {time}
                      </span>
                    );
                  })}
                </div>
              </details>
            )}

            {modalData.analysis.openSlots.length > 0 && (
              <details className="schedule-grid__details">

                <summary className="schedule-grid__summary schedule-grid__summary--open">
                  Открытые слоты ({modalData.analysis.openSlots.length})
                </summary>

                <div className="schedule-grid__summary__toggle">
                  {modalData.analysis.openSlots.map((slot) => {
                    const [_, time] = slot.split('_');
                    return (
                      <span className="schedule-grid__summary__toggle__block" key={slot}>
                        {time}
                      </span>
                    );
                  })}
                </div>
              </details>
            )}

            {modalData.analysis.bookedSlots.length > 0 && (
              <details className="schedule-grid__details">

                <summary className="schedule-grid__summary schedule-grid__summary--booked">
                  Забронированные слоты ({modalData.analysis.bookedSlots.length})
                </summary>

                <div className="schedule-grid__summary__toggle">
                  {modalData.analysis.bookedSlots.map((slot) => {
                    const [_, time] = slot.split('_');
                    return (
                      <span className="schedule-grid__summary__toggle__block" key={slot}>
                        {time}
                      </span>
                    );
                  })}
                </div>
              </details>
            )}
          </div>

          <div className="timesheet__modal__actions">
            {modalData.analysis.hasClosed && (
              <button
                onClick={() => openRangeSingle(modalData.day, modalData.times)}
                className="timesheet__modal__button timesheet__modal__button--green"
              >
                Открыть выбранные слоты ({modalData.analysis.closedSlots.length} шт.)
              </button>
            )}

            {modalData.analysis.hasClosed && (
              <button
                onClick={() => openRangeRepeating(modalData.day, modalData.times)}
                className="timesheet__modal__button timesheet__modal__button--blue"
              >
                Открывать каждую неделю ({dayjs(modalData.day).format("dddd")})
              </button>
            )}

            {modalData.analysis.hasOpen && (
              <button
                onClick={() => closeSelectedSlots(selectedSlots)}
                className="timesheet__modal__button timesheet__modal__button--red"
              >
                Закрыть открытые слоты ({modalData.analysis.openSlots.length} шт.)
              </button>
            )}

            {modalData.analysis.hasBooked && (
              <div className="schedule-grid__warning">
                ⚠️ В выбранном периоде присутствуют забронированные временные слоты, изменения к ним применены не будут.
              </div>
            )}

            {modalData.analysis.hasOpen && !modalData.analysis.hasClosed && !modalData.analysis.hasBooked && (
              <div className="schedule-grid__information">
                ℹ️ Выделены только открытые слоты. Для закрытия используйте кнопку выше.
              </div>
            )}
          </div>
        </Modal>
      )}

      {modalData && modalData.type === "open" && (
        <Modal onClose={() => setModalData(null)} title="Открыть слот">
          <p className="timesheet__modal__text">
            {dayjs(modalData.day).format("dddd, DD MMMM YYYY")}, {modalData.time}
          </p>
          <div className="timesheet__modal__actions">
            <button
              onClick={() => openSingleDay(modalData.day, modalData.time)}
              className="timesheet__modal__button timesheet__modal__button--green"
            >
              Только для {dayjs(modalData.day).format("DD.MM.YYYY")}
            </button>
            <button
              onClick={() => openRepeating(modalData.day, modalData.time)}
              className="timesheet__modal__button timesheet__modal__button--blue"
            >
              🔄 Каждую неделю ({dayjs(modalData.day).format("dddd")})
            </button>
          </div>
        </Modal>
      )}

      {modalData && modalData.type === "reset" && (
        <Modal onClose={() => setModalData(null)} title="Сбросить слот">
          <p className="timesheet__modal__text">
            {dayjs(modalData.day).format("dddd, DD MMMM YYYY")}, {modalData.time}
          </p>
          <p className="timesheet__modal__text">
            Вы уверены, что хотите закрыть этот слот?
          </p>
          <div className="timesheet__modal__actions">
            <button
              onClick={() => setModalData(null)}
              className="timesheet__modal__button timesheet__modal__button--gray"
            >
              Нет
            </button>
            <button
              onClick={() => resetSlot(modalData.day, modalData.time)}
              className="timesheet__modal__button timesheet__modal__button--red"
            >
              Да, закрыть
            </button>
          </div>
        </Modal>
      )}

      {modalData && modalData.type === "booked" && consultationInfo && (
        <Modal onClose={() => setModalData(null)} title="Информация о записи">
          <>
            <div key={consultationInfo[0].id} className="consultation-card">
              <div className="consultation-card__time">
                <span className="consultation-card__date">{getDateLabel(consultationInfo[0].date)}</span>
                <span className="consultation-card__hours">{consultationInfo[0].durationTime}</span>
              </div>

              <div className="consultation-card__info">
                <div className="consultation-card__specialist">
                  Клиент: {(!consultationInfo[0].PatientSurname && !consultationInfo[0].PatientName && !consultationInfo[0].PatientPatronymic)
                    ? <span> Анонимный пользователь </span>
                    : <a target="_blank" href={`/profile/${consultationInfo[0].PatientUserId}`}> {consultationInfo[0].PatientSurname} {consultationInfo[0].PatientName} {consultationInfo[0].PatientPatronymic ?? ""} </a>
                  }
                </div>

                <div className="consultation-card__symptoms">
                  {'Симптомы: '}
                  {consultationInfo[0].Problems.length > 0 ?
                    consultationInfo[0].Problems.map((p, i) => (
                      <span key={i}>
                        {p.toLocaleLowerCase()}
                        {i < consultationInfo[0].Problems.length - 1 ? ', ' : '.'}
                      </span>
                    )) : (
                      <span>Другая проблема</span>
                    )}
                </div>

                <div className="consultation-card__details">
                  Подробно: <span>{consultationInfo[0].descriptionProblem ? consultationInfo[0]?.descriptionProblem : "Не указано."}</span>
                </div>

                {consultationInfo[0].recommendations && (
                  <div className="consultation-card__details">
                    Рекомендации: <span>
                      <a href={`${API_URL}/${consultationInfo[0].recommendations}`}>Файл</a>
                    </span>
                  </div>
                )}
              </div>
            </div>
          </>
        </Modal>
      )}
    </div>
  );
}

// Вспомогательный компонент для модальных окон
function Modal({ children, onClose, title }: { children: React.ReactNode; title: string; onClose: () => void }) {
  return (
    <div className="modal">
      <div className="timesheet__modal">
        <ModalHeader title={title} onClose={onClose} />
        {children}
      </div>
    </div>
  );
}

export default DoctorScheduleCalendar;