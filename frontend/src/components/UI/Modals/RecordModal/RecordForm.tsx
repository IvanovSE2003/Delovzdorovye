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
  specialist?: OptionsResponse | null;
  problems?: number[];
  userId?: string;
  slotsOverride?: Slot[];
  selectTimeDate: (time: string, date: string) => void;
}

const RecordForm: React.FC<ConsultationFormProps> = ({
  specialist,
  problems = [],
  userId = "",
  slotsOverride,
  selectTimeDate
}) => {
  const store = new ConsultationsStore();

  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [otherProblemText, setOtherProblemText] = useState("");
  const [error, setError] = useState("");
  const [slots, setSlots] = useState<Omit<Slot, "doctorId">[]>([]);

  // Загружаем расписание (только если не переданы slotsOverride)
  useEffect(() => {
    if (slotsOverride) {
      setSlots(slotsOverride);
      return;
    }

    const loadSpecialistSchedule = async () => {
      if (!specialist) return;
      try {
        const schedule = await store.getSchedule(specialist.value);
        setSlots(schedule);
      } catch (error) {
        console.error('Ошибка загрузки расписания:', error);
        setError('Не удалось загрузить расписание специалиста');
      }
    };

    loadSpecialistSchedule();
  }, [specialist, slotsOverride]);

  // Проверка доступных дат
  const availableDates: Date[] = Array.from(
    new Set(
      slots.map(slot => new Date(slot.date).toDateString())
    )
  ).map(str => new Date(str));
  const isDateAvailable = (date: Date) => {
    return availableDates.some(availableDate =>
      availableDate.toDateString() === date.toDateString()
    );
  };

  // Проверка выбрана ли дата в календаре
  const slotsForSelectedDate = slots.filter(
    slot => new Date(slot.date).toDateString() === selectedDate?.toDateString()
  );

  // Обработка записи консультации
  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime) {
      setError("Выберите дату и время");
      return;
    }

    try {
      if (!slotsOverride) {
        // админский сценарий
        await store.createAppointment({
          userId,
          time: selectedTime,
          problems,
          date: selectedDate.toISOString(),
        });
      }

      console.log(selectedDate, selectedTime)
      selectTimeDate(selectedDate.toDateString(), selectedTime);
      setError("");
    } catch (e) {
      console.error("Ошибка при записи на консультацию:", e);
      setError("Не удалось записаться на консультацию. Попробуйте позже.");
    }
  };

  useEffect(() => {
    console.log(selectedDate, selectedTime)
    selectTimeDate(selectedTime??"", selectedDate?.toDateString()??"");
  }, [selectedDate, selectedDate])

  return (
    <div>
      <div className="consultation-modal__date-time">
        <div className="consultation-modal__calendar">
          <DatePicker
            selected={selectedDate}
            onChange={(date: Date | null) => setSelectedDate(date || new Date())}
            inline
            locale={ru}
            dateFormat="dd.MM.yyyy"
            minDate={new Date()}
            todayButton="Сегодня"
            filterDate={(date) => isDateAvailable(date)}
            highlightDates={[{ "available": availableDates }]}
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

      <div>
        <label className="consultation-modal__label" htmlFor="otherProblem">
          Подробная информация о проблеме:
        </label>
        <textarea
          id="otherProblem"
          value={otherProblemText}
          onChange={(e) => setOtherProblemText(e.target.value)}
          className="consultation-modal__textarea"
          placeholder="Опишите проблему..."
          rows={4}
        />
      </div>

      {error && <div className="consultation-modal__error">{error}</div>}
    </div>
  );
};

export default RecordForm;
