// RecordForm.tsx
import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ru } from "date-fns/locale";
import TimeSlots from "../../../../features/account/TimeSlots/TimeSlots";
import type { OptionsResponse, Slot } from "../../../../store/consultations-store";
import './RecordModal.scss';
import ConsultationsStore from "../../../../store/consultations-store";

interface ConsultationFormProps {
  specialist?: OptionsResponse;
  slotsOverride?: Slot[];
  onTimeDateSelect: (time: string | null, date: string | null) => void;
}

const RecordForm: React.FC<ConsultationFormProps> = ({
  specialist = {} as OptionsResponse,
  slotsOverride = [] as Slot[],
  onTimeDateSelect,
}) => {
  const store = new ConsultationsStore();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);

  // Загружаем расписание (только если не переданы slotsOverride)
  useEffect(() => {
    if (slotsOverride.length > 0) {
      setSlots(slotsOverride);
      return;
    }

    const loadSpecialistSchedule = async () => {
      if (!specialist?.value) return;
      try {
        const schedule = await store.getSchedule(specialist.value);
        setSlots(schedule || []);
      } catch (error) {
        console.error("Ошибка загрузки расписания:", error);
        setError("Не удалось загрузить расписание специалиста");
      }
    };

    loadSpecialistSchedule();
  }, [specialist, slotsOverride]);

  // Проверка доступных дат
  const availableDates: Date[] = Array.from(
    new Set(slots.map(slot => new Date(slot.date).toDateString()))
  ).map(str => new Date(str));

  const isDateAvailable = (date: Date) => {
    return availableDates.some(
      availableDate => availableDate.toDateString() === date.toDateString()
    );
  };

  // Слоты только для выбранной даты
  const slotsForSelectedDate = slots.filter(
    slot =>
      selectedDate &&
      new Date(slot.date).toDateString() === selectedDate.toDateString()
  );

  // Передаём выбранные время и дату наверх
  useEffect(() => {
    const dateStr = selectedDate ? selectedDate.toISOString().split("T")[0] : null;
    onTimeDateSelect(selectedTime, dateStr);
  }, [selectedDate, selectedTime]);

  return (
    <div>
      <div className="consultation-modal__date-time">
        <div className="consultation-modal__calendar">
          <DatePicker
            selected={selectedDate}
            onChange={(date: Date | null) => {
              setSelectedDate(date);
              setSelectedTime(null);
            }}
            inline
            locale={ru}
            dateFormat="dd.MM.yyyy"
            minDate={new Date()}
            todayButton="Сегодня"
            filterDate={isDateAvailable}
            highlightDates={[{ available: availableDates }]}
          />
        </div>

        <div className="consultation-modal__time">
          <TimeSlots
            slots={slotsForSelectedDate}
            selectedTime={selectedTime}
            onTimeSelect={setSelectedTime}
          />
          <p>Вы выбрали: {selectedTime || "не выбрано"}</p>
        </div>
      </div>

      {error && <div className="consultation-modal__error">{error}</div>}
    </div>
  );
};

export default RecordForm;
