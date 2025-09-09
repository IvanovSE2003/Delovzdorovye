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
  onTimeDateSelect: (time: string | null, date: string | null, doctorId?: number) => void;
  userId?: string;
}


const RecordForm: React.FC<ConsultationFormProps> = ({
  specialist = {} as OptionsResponse,
  slotsOverride = undefined,
  onTimeDateSelect,
  userId=undefined
}) => {
  const store = new ConsultationsStore();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);

  // Загружаем расписание (только если не переданы slotsOverride)
  useEffect(() => {
    if (slotsOverride !== undefined) {
      setSlots(slotsOverride);
      if (slotsOverride.length == 0) {
        setSelectedDate(null);
        setSelectedTime(null);
      }
      return;
    }

    const loadSpecialistSchedule = async () => {
      if (!specialist?.value) return;
      try {
        console.log(specialist.value);
        const schedule = await store.getSchedule(specialist.value, Number(userId));
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

  // Передаём выбранные время, дату и врача наверх
  useEffect(() => {
    if (!selectedDate || !selectedTime) {
      onTimeDateSelect(null, null, undefined);
      return;
    }

    const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`;

    // Ищем слот по дате и времени
    const matchedSlot = slots.find(
      slot =>
        new Date(slot.date).toDateString() === selectedDate.toDateString() &&
        slot.time === selectedTime
    );

    onTimeDateSelect(selectedTime, dateStr, matchedSlot?.doctorId);
  }, [selectedDate, selectedTime, slots]);


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

        <TimeSlots
          slots={slotsForSelectedDate}
          selectedTime={selectedTime}
          onTimeSelect={setSelectedTime}
        />
      </div>

      {error && <div className="consultation-modal__error">{error}</div>}
    </div>
  );
};

export default RecordForm;
