import React, { useState } from "react";
import "./TimeSlots.scss";

interface TimeSlotsProps {
  times: string[]; // список времени, например ["09:00", "09:30", "12:00", "18:30"]
  onSelect?: (time: string) => void; // колбэк при выборе
}

const TimeSlots: React.FC<TimeSlotsProps> = ({ times, onSelect }) => {
  const [selected, setSelected] = useState<string | null>(null);

  // Функция для разбиения времени на утро/день/вечер
  const groupTimes = (times: string[]) => {
    const morning: string[] = [];
    const day: string[] = [];
    const evening: string[] = [];

    times.forEach((time) => {
      const [h] = time.split(":").map(Number);
      if (h >= 6 && h < 12) {
        morning.push(time);
      } else if (h >= 12 && h < 18) {
        day.push(time);
      } else {
        evening.push(time);
      }
    });

    return { morning, day, evening };
  };

  const { morning, day, evening } = groupTimes(times);

  const handleSelect = (time: string) => {
    setSelected(time);
    onSelect?.(time);
  };

  const renderGroup = (title: string, slots: string[]) => {
    if (slots.length === 0) return null;
    return (
      <div className="time-slots__group">
        <div className="time-slots__title">{title}</div>
        <div className="time-slots__list">
          {slots.map((t) => (
            <button
              key={t}
              className={`time-slots__item ${
                selected === t ? "time-slots__item--selected" : ""
              }`}
              onClick={() => handleSelect(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="time-slots">
      {renderGroup("Утро", morning)}
      {renderGroup("День", day)}
      {renderGroup("Вечер", evening)}
    </div>
  );
};

export default TimeSlots;
