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
  const startOfWeek = dayjs()
    .add(offset, "week")
    .startOf("week");
  const monday = startOfWeek.add(0, "day");

  return Array.from({ length: 7 }, (_, i) =>
    monday.add(i, "day").format("YYYY-MM-DD")
  );
};


type ModalData =
  | { day: string; time: string; reset?: false }
  | { day: string; time: string; reset: true };

const ScheduleGrid: React.FC<ScheduleGridProps> = ({ onChange, userId }) => {
  const [weekOffset, setWeekOffset] = useState(0);
  const weekDays = getWeekDays(weekOffset);

  const [slots, setSlots] = useState<Record<string, SlotStatus>>({});
  const [slotToId, setSlotToId] = useState<Record<string, number>>({});
  const [maxId, setMaxId] = useState(0);

  const [modalData, setModalData] = useState<ModalData | null>(null);

  // загрузка расписания
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const startDate = weekDays[0];
        const endDate = weekDays[6];
        const res = await ScheduleService.getScheduleWeek(startDate, endDate, userId);

        const mapped: Record<string, SlotStatus> = {};
        const idMap: Record<string, number> = {};
        let localMax = maxId;

        res.data.forEach((slotObj: any) => {
          const day = dayjs(slotObj.date).format("YYYY-MM-DD");
          const time = slotObj.time.slice(0, 5);
          const key = `${day}_${time}`;

          // статус из API
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

    fetchSchedule();
  }, [weekOffset]);

  const ensureSlotId = (day: string, time: string): number => {
    const key = `${day}_${time}`;
    if (slotToId[key]) return slotToId[key];

    const newId = maxId + 1;
    setSlotToId((prev) => ({ ...prev, [key]: newId }));
    setMaxId(newId);
    console.log(`Создан новый slotId=${newId} для ${key}`);
    return newId;
  };

  const toggleSlot = (day: string, time: string, mode: "once" | "weekly") => {
    setSlots((prev) => {
      const updated = { ...prev };

      if (mode === "once") {
        const key = `${day}_${time}`;
        const current = prev[key] || "closed";
        updated[key] = current === "closed" ? "open" : "closed";
      } else {
        const weekday = dayjs(day).day();
        weekDays.forEach((d) => {
          if (dayjs(d).day() === weekday) {
            const key = `${d}_${time}`;
            const current = prev[key] || "closed";
            updated[key] = current === "closed" ? "open" : "closed";
          }
        });
      }

      if (onChange) onChange(updated);
      return updated;
    });
  };

  const getSlotStatus = (day: string, time: string): SlotStatus =>
    slots[`${day}_${time}`] || "closed";

  const handleSlotClick = (day: string, time: string) => {
    const normalizedDay = dayjs(day).format("YYYY-MM-DD");
    const status = getSlotStatus(normalizedDay, time);

    if (status === "closed") {
      setModalData({ day: normalizedDay, time });
    } else {
      setModalData({ day: normalizedDay, time, reset: true });
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
                <th key={d} className="schedule-grid__day">
                  {dayjs(d).format("dd, DD MMMM")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hours.map((time) => (
              <tr key={time} className="schedule-grid__row">
                <td className="schedule-grid__time">{time}</td>
                {weekDays.map((day) => {
                  const status = getSlotStatus(day, time);
                  return (
                    <td
                      key={day + time}
                      onClick={() => handleSlotClick(day, time)}
                      className={`schedule-grid__slot schedule-grid__slot--${status}`}
                    >
                      {status === "booked" && (
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
      {modalData && !modalData.reset && (
        <div className="modal">
          <div className="modal__content">
            <h3>
              {dayjs(modalData.day).format("DD MMMM YYYY")}, {modalData.time}
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
                    toggleSlot(modalData.day, modalData.time, "once");
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
                    toggleSlot(modalData.day, modalData.time, "weekly");
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
            <button className="modal__close" onClick={() => setModalData(null)}>
              Закрыть
            </button>
          </div>
        </div>
      )}

      {/* Модалка сброса */}
      {modalData && modalData.reset && (
        <div className="modal">
          <div className="modal__content">
            <h3>
              {dayjs(modalData.day).format("DD MMMM YYYY")}, {modalData.time}
            </h3>
            <p>Хотите сбросить выбранную дату?</p>
            <div className="modal__actions">
              <button
                onClick={async () => {
                  try {
                    const slotId = ensureSlotId(modalData.day, modalData.time);
                    await ScheduleService.deleteSlot(slotId);
                    toggleSlot(modalData.day, modalData.time, "once");
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
    </div>
  );
};

export default ScheduleGrid;
