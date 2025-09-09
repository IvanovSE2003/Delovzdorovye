import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import "dayjs/locale/ru";
dayjs.locale("ru");
import "./Schedule.scss";
import ScheduleService from "../../../services/ScheduleService";

export type SlotStatus = "closed" | "open" | "booked";

interface ScheduleGridProps {
  onChange?: (slots: Record<string, SlotStatus>) => void;
  userId: number;
}

const hours = Array.from({ length: 24 }, (_, i) =>
  `${i.toString().padStart(2, "0")}:00`
);

const getWeekDays = (offset: number) => {
  const startOfWeek = dayjs().add(offset, "week").startOf("week");
  const monday = startOfWeek.add(0, "day");

  return Array.from({ length: 7 }, (_, i) =>
    monday.add(i, "day").format("YYYY-MM-DD")
  );
};

type ModalData =
  | { day: string; time: string; type: "open" }
  | { day: string; time: string; type: "reset" }
  | { day: string; time: string; type: "booked" };

interface ConsultationInfo {
  clientName: string;
  symptoms: string[];
  details: string;
}

const ScheduleGrid: React.FC<ScheduleGridProps> = ({ onChange, userId }) => {
  const [weekOffset, setWeekOffset] = useState(0);
  const weekDays = getWeekDays(weekOffset);

  const [slots, setSlots] = useState<Record<string, SlotStatus>>({});
  const [slotToId, setSlotToId] = useState<Record<string, number>>({});
  const [maxId, setMaxId] = useState(0);

  const [modalData, setModalData] = useState<ModalData | null>(null);
  const [consultationInfo, setConsultationInfo] =
    useState<ConsultationInfo | null>(null);

  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [hoveredCol, setHoveredCol] = useState<string | null>(null);

  const today = dayjs().format("YYYY-MM-DD");

  // загрузка расписания
  const fetchSchedule = async () => {
    try {
      const startDate = weekDays[0];
      const endDate = weekDays[6];
      const res = await ScheduleService.getScheduleWeek(
        startDate,
        endDate,
        userId
      );

      const mapped: Record<string, SlotStatus> = {};
      const idMap: Record<string, number> = {};
      let localMax = 0;

      res.data.forEach((slotObj: any) => {
        const day = dayjs(slotObj.date).format("YYYY-MM-DD");
        const time = slotObj.time.slice(0, 5);
        const key = `${day}_${time}`;

        let status: SlotStatus = "closed";
        if (slotObj.status === "OPEN") status = "open";
        if (slotObj.status === "BOOKED") status = "booked";

        mapped[key] = status;
        idMap[key] = slotObj.id;

        if (slotObj.id > localMax) {
          localMax = slotObj.id;
        }
      });

      setSlots(mapped);
      setSlotToId(idMap);
      setMaxId(localMax);

      if (onChange) onChange(mapped);
    } catch (e) {
      console.error("Ошибка при получении расписания:", e);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, [weekOffset]);

  const getSlotStatus = (day: string, time: string): SlotStatus =>
    slots[`${day}_${time}`] || "closed";

  const handleSlotClick = async (day: string, time: string) => {
    const normalizedDay = dayjs(day).format("YYYY-MM-DD");
    const status = getSlotStatus(normalizedDay, time);

    if (status === "closed") {
      setModalData({ day: normalizedDay, time, type: "open" });
    } else if (status === "open") {
      setModalData({ day: normalizedDay, time, type: "reset" });
    } else if (status === "booked") {
      try {
        // ⚠️ тут будет реальный запрос
        // const res = await ScheduleService.getConsultationInfo(normalizedDay, time, userId);
        // setConsultationInfo(res.data);

        // временный мок
        setConsultationInfo({
          clientName: "Иванов Иван Иванович",
          symptoms: ["кашель", "повышенная температура"],
          details: "Подробное описание симптомов пациента...",
        });

        setModalData({ day: normalizedDay, time, type: "booked" });
      } catch (e) {
        console.error("Ошибка при получении консультации:", e);
      }
    }
  };

  const weekLabel = `${dayjs(weekDays[0]).format("DD MMMM")} – ${dayjs(
    weekDays[6]
  ).format("DD MMMM")}`;

  return (
    <div className="schedule-grid">
      {/* Переключатель недель */}
      <div className="schedule-grid__week-switcher">
        <button
          onClick={() => setWeekOffset((prev) => Math.max(prev - 1, 0))}
          disabled={weekOffset === 0}
        >
          ←
        </button>

        <span className="schedule-grid__week-label">{weekLabel}</span>

        <button onClick={() => setWeekOffset((prev) => prev + 1)}>→</button>

        <button
          className="schedule-grid__today-btn"
          onClick={() => setWeekOffset(0)}
          disabled={weekOffset === 0}
        >
          Сегодняшняя неделя
        </button>
      </div>

      {/* Таблица */}
      <div className="overflow-x-auto">
        <table className="schedule-grid__table">
          <thead className="schedule-grid__head">
            <tr>
              <th className="schedule-grid__time"></th>
              {weekDays.map((d) => (
                <th
                  key={d}
                  className={`schedule-grid__day 
                    ${d === today ? "schedule-grid__day--today" : ""}
                    ${hoveredCol === d ? "highlight" : ""}
                  `}
                >
                  {dayjs(d).format("dd, DD MMMM")}
                </th>

              ))}
            </tr>
          </thead>
          <tbody>
            {hours.map((time) => (
              <tr
                key={time}
              >
                <td
                  className={`schedule-grid__time ${hoveredRow === time ? "highlight" : ""
                    }`}
                >
                  {time}
                </td>
                {weekDays.map((day) => {
                  const status = getSlotStatus(day, time);
                  const isToday = day === today;
                  const slotDateTime = dayjs(`${day} ${time}`, "YYYY-MM-DD HH:mm");
                  const isPast = slotDateTime.isBefore(dayjs());

                  return (
                    <td
                      key={day + time}
                      onClick={() => !isPast && handleSlotClick(day, time)}
                      className={`schedule-grid__slot schedule-grid__slot--${status} 
                        ${isToday ? "schedule-grid__slot--today" : ""}
                        ${isPast ? "schedule-grid__slot--past" : ""}
                      `}
                      onMouseEnter={() => {
                        if (!isPast) {
                          setHoveredRow(time);
                          setHoveredCol(day);
                        }
                      }}
                      onMouseLeave={() => {
                        if (!isPast) {
                          setHoveredRow(null);
                          setHoveredCol(null);
                        }
                      }}
                    >
                      {status === "booked" && !isPast && (
                        <span className="slot__icon">✔</span>
                      )}
                    </td>
                  );
                })}
              </tr>

            ))}
          </tbody>
        </table>
      </div>

      {/* Модалка открытия */}
      {modalData && modalData.type === "open" && (
        <div className="modal">
          <div className="modal__content">
            <h3>
              {dayjs(modalData.day).format("dddd").replace(/^\w/, (c) =>
                c.toUpperCase()
              )}
              , {dayjs(modalData.day).format("DD MMMM YYYY")},{" "}
              {modalData.time}
            </h3>
            <p>Выберите режим:</p>
            <div className="modal__actions">
              <button
                onClick={async () => {
                  try {
                    const dayWeek = (dayjs(modalData.day).day() + 6) % 7;
                    await ScheduleService.setschuduleDay(
                      modalData.time,
                      modalData.day,
                      false,
                      userId,
                      dayWeek
                    );
                    await fetchSchedule();
                  } catch (e) {
                    console.error("Ошибка при установке дня:", e);
                  } finally {
                    setModalData(null);
                  }
                }}
              >
                Только для этой даты
              </button>
              <button
                onClick={async () => {
                  try {
                    const dayWeek = (dayjs(modalData.day).day() + 6) % 7;
                    await ScheduleService.setschuduleDay(
                      modalData.time,
                      modalData.day,
                      true,
                      userId,
                      dayWeek
                    );
                    await fetchSchedule();
                  } catch (e) {
                    console.error("Ошибка при установке дня:", e);
                  } finally {
                    setModalData(null);
                  }
                }}
              >
                Каждую неделю
              </button>
            </div>
            <button
              className="modal__close"
              onClick={() => setModalData(null)}
            >
              Закрыть
            </button>
          </div>
        </div>
      )}

      {/* Модалка сброса */}
      {modalData && modalData.type === "reset" && (
        <div className="modal">
          <div className="modal__content">
            <h3>
              {dayjs(modalData.day).format("dddd").replace(/^\w/, (c) =>
                c.toUpperCase()
              )}
              , {dayjs(modalData.day).format("DD MMMM YYYY")},{" "}
              {modalData.time}
            </h3>
            <p>Хотите сбросить выбранную дату?</p>
            <div className="modal__actions">
              <button
                onClick={async () => {
                  try {
                    const key = `${modalData.day}_${modalData.time}`;
                    const slotId = slotToId[key];

                    if (!slotId) {
                      console.warn("Нет id для этого слота, сброс невозможен");
                      return;
                    }

                    await ScheduleService.deleteSlot(slotId);
                    await fetchSchedule();
                  } catch (e) {
                    console.error("Ошибка при удалении слота:", e);
                  } finally {
                    setModalData(null);
                  }
                }}
              >
                Сбросить
              </button>
              <button onClick={() => setModalData(null)}>Отмена</button>
            </div>
          </div>
        </div>
      )}

      {/* Модалка booked */}
      {modalData && modalData.type === "booked" && consultationInfo && (
        <div className="modal">
          <div className="modal__content">
            <h3>
              Консультация:{" "}
              {dayjs(modalData.day).format("dddd, DD MMMM YYYY")}{" "}
              {modalData.time}
            </h3>
            <p>
              <b>Клиент:</b> {consultationInfo.clientName}
            </p>
            <p>
              <b>Симптомы:</b> {consultationInfo.symptoms.join(", ")}
            </p>
            <p>
              <b>Подробно:</b> {consultationInfo.details}
            </p>

            <div className="modal__actions">
              <button onClick={() => setModalData(null)}>Закрыть</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleGrid;
