import type { Slot } from "../../../store/consultations-store";
import './TimeSlots.scss'

interface TimeSlotsProps {
  slots: Omit<Slot, "doctorId">[];
  selectedTime: string | null;
  onTimeSelect: (time: string) => void;
}

const TimeSlots: React.FC<TimeSlotsProps> = ({ slots, selectedTime, onTimeSelect }) => {

  if (slots.length === 0) {
    return <div className="time-slots__none">Сначала выберите день в календаре слева</div>;
  }

  return (
    <div className="time-slots">
      {slots.map(slot => {
        const formattedTime = slot.time.slice(0, 5);
        return (
          <button
            key={`${slot.date}-${slot.time}`}
            className={`time-slots__item ${selectedTime === slot.time ? "time-slots__item--selected" : ""}`}
            onClick={() => onTimeSelect(slot.time)}
          >
            {formattedTime}
          </button>

        );
      })}
    </div>
  );
};

export default TimeSlots;
