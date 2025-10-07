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
        <div style={{display: 'flex', gap: '30px', height: '100px', alignItems: 'center'}}>
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
                📅 Открыть выбранные слоты ({modalData.analysis.closedSlots.length} шт.)
              </button>
            )}

            {modalData.analysis.hasClosed && (
              <button
                onClick={() => openRangeRepeating(modalData.day, modalData.times)}
                className="timesheet__modal__button timesheet__modal__button--blue"
              >
                🔄 Открывать каждую неделю ({dayjs(modalData.day).format("dddd")})
              </button>
            )}

            {modalData.analysis.hasOpen && (
              <button
                onClick={() => closeSelectedSlots(selectedSlots)}
                className="timesheet__modal__button timesheet__modal__button--red"
              >
                🔒 Закрыть открытые слоты ({modalData.analysis.openSlots.length} шт.)
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
              📅 Только для {dayjs(modalData.day).format("DD.MM.YYYY")}
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
                  {consultationInfo[0].Problems.map((p, i) => (
                    <span key={i}>
                      {p.toLocaleLowerCase()}
                      {i < consultationInfo[0].Problems.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </div>

                <div className="consultation-card__details">
                  Подробно: <span>{consultationInfo[0].other_problem ? consultationInfo[0]?.other_problem : "Не указано"}</span>
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
        <div className="timesheet__modal__header">
          <h1 className="timesheet__modal__title">{title}</h1>
          <svg version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            width="30"
            height="30"
            viewBox="0 0 256 256"
            className="timesheet__modal__close"
            onClick={onClose}
          >
            <path
              d="M0 0 C0.99386719 -0.03738281 1.98773437 -0.07476563 3.01171875 -0.11328125 C12.06000214 1.05389377 17.63538968 7.06771661 23.7578125 13.27197266 C24.66606277 14.17642624 25.57431305 15.08087982 26.51008606 16.01274109 C28.98361164 18.47663488 31.44455892 20.95274124 33.9030571 23.43161821 C36.48157451 26.02778242 39.07071142 28.61331714 41.65844727 31.20028687 C45.99578577 35.53949337 50.32533533 39.88634816 54.64990234 44.23828125 C59.65343021 49.27335373 64.66742976 54.2978012 69.68748474 59.31639254 C74.52023451 64.14792351 79.34725569 68.98513309 84.17108154 73.82557297 C86.22375321 75.88531422 88.27812212 77.94334055 90.33380127 80.00008011 C93.19603101 82.86468422 96.04966094 85.73770503 98.90234375 88.61181641 C99.75939407 89.46796036 100.6164444 90.32410431 101.49946594 91.20619202 C102.27042099 91.98567703 103.04137604 92.76516205 103.83569336 93.56826782 C104.51111679 94.24704294 105.18654022 94.92581806 105.88243103 95.62516212 C107.3125 97.3125 107.3125 97.3125 107.3125 99.3125 C107.9725 99.3125 108.6325 99.3125 109.3125 99.3125 C109.56739637 98.73311928 109.82229275 98.15373856 110.08491325 97.55680084 C111.44394438 95.07219052 112.95760755 93.41012264 114.95388794 91.40368652 C115.71076401 90.63828049 116.46764008 89.87287445 117.24745178 89.08427429 C118.07861008 88.25402237 118.90976837 87.42377045 119.76611328 86.56835938 C120.64112991 85.68662552 121.51614655 84.80489166 122.41767883 83.8964386 C124.81700692 81.48136732 127.22081434 79.07094791 129.62738276 76.6631031 C131.13248277 75.15658004 132.63614902 73.64864119 134.13930893 72.1401825 C139.38891768 66.87207305 144.64366634 61.60915417 149.90332031 56.35107422 C154.7964144 51.45918022 159.67825984 46.55625861 164.55492032 41.64798689 C168.74915864 37.42753845 172.95113214 33.21489714 177.15913379 29.00817156 C179.66909598 26.49871779 182.1758978 23.98629996 184.67496109 21.46598816 C187.46628077 18.65158597 190.2736172 15.85349985 193.08251953 13.05664062 C194.31103889 11.81126274 194.31103889 11.81126274 195.56437683 10.54072571 C200.90004817 5.26290021 205.8537701 1.0047478 213.5078125 -0.18359375 C220.31900351 -0.04736993 225.15084539 0.15084539 230.1875 5.1875 C234.71268974 10.15061133 236.45943857 13.29718007 236.5625 20.125 C236.58828125 21.14207031 236.6140625 22.15914062 236.640625 23.20703125 C235.77451466 31.40414699 229.81418696 36.21976396 224.2512207 41.71435547 C222.86067978 43.10555351 222.86067978 43.10555351 221.44204712 44.52485657 C218.90972156 47.05804029 216.36827583 49.58188926 213.82505441 52.10412741 C211.16511418 54.74527094 208.51370819 57.39495403 205.8613739 60.04373169 C200.84194332 65.05385059 195.81491687 70.05627512 190.78509635 75.05596077 C185.05731831 80.7501675 179.33809074 86.45292949 173.61955512 92.1564157 C161.86000518 103.88463649 150.08979759 115.60210066 138.3125 127.3125 C139.75667989 130.62394051 141.55035965 132.79199805 144.1081543 135.32847595 C145.29433853 136.51228096 145.29433853 136.51228096 146.50448608 137.72000122 C147.37312286 138.57673431 148.24175964 139.43346741 149.13671875 140.31616211 C150.53957199 141.7120667 151.94242401 143.10797252 153.3452301 144.50392449 C154.85205326 146.00149684 156.36131024 147.49657735 157.87124634 148.99101067 C161.01992293 152.10784511 164.16040211 155.23285152 167.29956055 158.35926819 C175.09755351 166.12319213 182.90481195 173.87778105 190.71691895 181.62750244 C196.78911065 187.65123245 202.85808189 193.67812021 208.9165659 199.71564108 C212.03575182 202.82331019 215.16175074 205.9239068 218.29304504 209.01937282 C220.69744805 211.40006008 223.09207261 213.79050924 225.48828125 216.17944336 C226.35691803 217.03415222 227.22555481 217.88886108 228.12051392 218.76947021 C228.91130341 219.56149338 229.7020929 220.35351654 230.5168457 221.16954041 C231.2055928 221.85292449 231.8943399 222.53630857 232.60395813 223.24040127 C237.26055763 228.88786832 236.89139532 235.34677597 236.3125 242.3125 C234.55074458 248.14831482 230.12686503 251.78908365 225.3125 255.3125 C222.21740187 256.34419938 219.87489709 256.5459372 216.625 256.625 C215.63113281 256.66238281 214.63726562 256.69976562 213.61328125 256.73828125 C204.56499786 255.57110623 198.98961032 249.55728339 192.8671875 243.35302734 C191.95893723 242.44857376 191.05068695 241.54412018 190.11491394 240.61225891 C187.64138836 238.14836512 185.18044108 235.67225876 182.7219429 233.19338179 C180.14342549 230.59721758 177.55428858 228.01168286 174.96655273 225.42471313 C170.62921423 221.08550663 166.29966467 216.73865184 161.97509766 212.38671875 C156.97156979 207.35164627 151.95757024 202.3271988 146.93751526 197.30860746 C142.10476549 192.47707649 137.27774431 187.63986691 132.45391846 182.79942703 C130.40124679 180.73968578 128.34687788 178.68165945 126.29119873 176.62491989 C123.42896899 173.76031578 120.57533906 170.88729497 117.72265625 168.01318359 C116.86560593 167.15703964 116.0085556 166.30089569 115.12553406 165.41880798 C114.35457901 164.63932297 113.58362396 163.85983795 112.78930664 163.05673218 C112.11388321 162.37795706 111.43845978 161.69918194 110.74256897 160.99983788 C109.3125 159.3125 109.3125 159.3125 109.3125 157.3125 C108.6525 157.3125 107.9925 157.3125 107.3125 157.3125 C107.05760363 157.89188072 106.80270725 158.47126144 106.54008675 159.06819916 C105.18105562 161.55280948 103.66739245 163.21487736 101.67111206 165.22131348 C100.91423599 165.98671951 100.15735992 166.75212555 99.37754822 167.54072571 C98.54638992 168.37097763 97.71523163 169.20122955 96.85888672 170.05664062 C95.98387009 170.93837448 95.10885345 171.82010834 94.20732117 172.7285614 C91.80799308 175.14363268 89.40418566 177.55405209 86.99761724 179.9618969 C85.49251723 181.46841996 83.98885098 182.97635881 82.48569107 184.4848175 C77.23608232 189.75292695 71.98133366 195.01584583 66.72167969 200.27392578 C61.8285856 205.16581978 56.94674016 210.06874139 52.07007968 214.97701311 C47.87584136 219.19746155 43.67386786 223.41010286 39.46586621 227.61682844 C36.95590402 230.12628221 34.4491022 232.63870004 31.95003891 235.15901184 C29.15871923 237.97341403 26.3513828 240.77150015 23.54248047 243.56835938 C22.72346756 244.3986113 21.90445465 245.22886322 21.06062317 246.08427429 C15.72495183 251.36209979 10.7712299 255.6202522 3.1171875 256.80859375 C-3.69400351 256.67236993 -8.52584539 256.47415461 -13.5625 251.4375 C-18.02982741 246.53785059 -19.83601287 243.36573425 -20 236.625 C-20.03738281 235.63113281 -20.07476563 234.63726562 -20.11328125 233.61328125 C-18.94610623 224.56499786 -12.93228339 218.98961032 -6.72802734 212.8671875 C-5.37134697 211.50481209 -5.37134697 211.50481209 -3.98725891 210.11491394 C-1.52336512 207.64138836 0.95274124 205.18044108 3.43161821 202.7219429 C6.02778242 200.14342549 8.61331714 197.55428858 11.20028687 194.96655273 C15.53949337 190.62921423 19.88634816 186.29966467 24.23828125 181.97509766 C29.27335373 176.97156979 34.2978012 171.95757024 39.31639254 166.93751526 C44.14792351 162.10476549 48.98513309 157.27774431 53.82557297 152.45391846 C55.88531422 150.40124679 57.94334055 148.34687788 60.00008011 146.29119873 C62.86468422 143.42896899 65.73770503 140.57533906 68.61181641 137.72265625 C69.46796036 136.86560593 70.32410431 136.0085556 71.20619202 135.12553406 C71.98567703 134.35457901 72.76516205 133.58362396 73.56826782 132.78930664 C74.24704294 132.11388321 74.92581806 131.43845978 75.62516212 130.74256897 C77.3125 129.3125 77.3125 129.3125 79.3125 129.3125 C79.3125 128.6525 79.3125 127.9925 79.3125 127.3125 C78.73311928 127.05760363 78.15373856 126.80270725 77.55680084 126.54008675 C75.07219052 125.18105562 73.41012264 123.66739245 71.40368652 121.67111206 C70.63828049 120.91423599 69.87287445 120.15735992 69.08427429 119.37754822 C68.25402237 118.54638992 67.42377045 117.71523163 66.56835938 116.85888672 C65.68662552 115.98387009 64.80489166 115.10885345 63.8964386 114.20732117 C61.48136732 111.80799308 59.07094791 109.40418566 56.6631031 106.99761724 C55.15658004 105.49251723 53.64864119 103.98885098 52.1401825 102.48569107 C46.87207305 97.23608232 41.60915417 91.98133366 36.35107422 86.72167969 C31.45918022 81.8285856 26.55625861 76.94674016 21.64798689 72.07007968 C17.42753845 67.87584136 13.21489714 63.67386786 9.00817156 59.46586621 C6.49871779 56.95590402 3.98629996 54.4491022 1.46598816 51.95003891 C-1.34841403 49.15871923 -4.14650015 46.3513828 -6.94335938 43.54248047 C-8.18873726 42.31396111 -8.18873726 42.31396111 -9.45927429 41.06062317 C-14.73709979 35.72495183 -18.9952522 30.7712299 -20.18359375 23.1171875 C-20.04736993 16.30599649 -19.84915461 11.47415461 -14.8125 6.4375 C-9.91285059 1.97017259 -6.74073425 0.16398713 0 0 Z "
              transform="translate(19.6875,-0.3125)"
            />
          </svg>
        </div>
        {children}
      </div>
    </div>
  );
}

export default DoctorScheduleCalendar;