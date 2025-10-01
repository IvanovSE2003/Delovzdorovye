import type { Slot } from "../../../store/consultations-store";
import './TimeSlots.scss'

interface TimeSlotsProps {
  slots: Slot[];
  selectedTime?: string | null;
  selectedDay?: Date | null;
  onTimeSelect: (time: string) => void;
  showEmptyState?: boolean;
}

const TimeSlots: React.FC<TimeSlotsProps> = ({ slots, selectedTime, onTimeSelect, selectedDay, showEmptyState }) => {

  if (!selectedDay && showEmptyState) {
    return (
      <div className="time-slots__container">
        <div className="time-slots__not-select">
          Сначала выберите день в календаре слева
        </div>
      </div>
    );
  }

  if (slots.length === 0 && showEmptyState) {
    return (
      <div className="time-slots__container">
        <div className="time-slots__none">
          Для выбранного дня нет временных ячеек
        </div>
      </div>
    );
  }

  return (
    <div className="time-slots__container">
      <div className="time-slots">
        {slots.map(slot => {
          const formattedTime = slot.time.slice(0, 5);
          if (slot.status === "OPEN") {
            return (
              <button
                key={`${slot.date}-${slot.time}`}
                className={`time-slots__item ${selectedTime === slot.time ? "time-slots__item--selected" : ""}`}
                onClick={() => onTimeSelect(slot.time)}
              >
                {formattedTime}
              </button>
            );
          }
        })}
      </div>
      <p className="time-slots__selected">Вы выбрали: {selectedTime || "не выбрано"}</p>
    </div>
  );
};

export default TimeSlots;
