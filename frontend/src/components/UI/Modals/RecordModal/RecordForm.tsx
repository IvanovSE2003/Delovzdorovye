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
  freeMode?: boolean;
  onTimeDateSelect: (time: string | null, date: string | null, doctorId?: number) => void;
  userId?: string;
}

const RecordForm: React.FC<ConsultationFormProps> = ({
  specialist = {} as OptionsResponse,
  slotsOverride = undefined,
  freeMode = false,
  onTimeDateSelect,
  userId = undefined
}) => {
  const store = new ConsultationsStore();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);

  useEffect(() => {
    if (freeMode) {
      setSlots([]);
      setSelectedDate(null);
      setSelectedTime(null);
      return;
    }

    if (slotsOverride !== undefined) {
      setSlots(slotsOverride);
      if (slotsOverride.length === 0) {
        setSelectedDate(null);
        setSelectedTime(null);
      }
      return;
    }

    const loadSpecialistSchedule = async () => {
      if (!specialist?.value) return;
      try {
        const schedule = await store.getSchedule(specialist.value, Number(userId));
        setSlots(schedule || []);
      } catch (error) {
        console.error("Ошибка загрузки расписания:", error);
        setError("Не удалось загрузить расписание специалиста");
      }
    };

    loadSpecialistSchedule();
  }, [specialist?.value, slotsOverride, userId, freeMode]);

  // Доступные даты
  const availableDates: Date[] = freeMode
    ? [] // все даты доступны
    : Array.from(
        new Set(slots.map(slot => new Date(slot.date).toDateString()))
      ).map(str => new Date(str));

  const isDateAvailable = (date: Date) => freeMode || availableDates.some(
    availableDate => availableDate.toDateString() === date.toDateString()
  );

  // Слоты для выбранной даты
  const slotsForSelectedDate = (freeMode ? generateAllSlotsForDay(selectedDate) : slots.filter(
    slot => selectedDate && new Date(slot.date).toDateString() === selectedDate.toDateString()
  )).filter(slot => !isSlotInPast(slot));

  // Проверка слота на прошедшее время
  function isSlotInPast(slot: Slot): boolean {
    const now = new Date();
    const slotDate = new Date(slot.date);
    const [hour, minute] = slot.time.split(":").map(Number);
    slotDate.setHours(hour, minute, 0, 0);
    return slotDate < now;
  }

  // Передаём выбранные время и дату наверх
  useEffect(() => {
    if (!selectedDate || !selectedTime) {
      return;
    }

    const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`;

    const matchedSlot = slots.find(
      slot =>
        new Date(slot.date).toDateString() === selectedDate.toDateString() &&
        slot.time === selectedTime
    );

    onTimeDateSelect(selectedTime, dateStr, matchedSlot?.doctorId);
  }, [selectedDate, selectedTime, slots]);

  // Генерация слотов для freeMode (каждые 30 минут с 9:00 до 18:00)
  function generateAllSlotsForDay(date: Date | null): Slot[] {
    if (!date) return [];
    const result: Slot[] = [];
    for (let hour = 9; hour <= 18; hour++) {
      for (let min of [0, 30]) {
        result.push({
          date: date.toISOString(),
          time: `${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`,
          doctorId: 0,
          status: "OPEN"
        });
      }
    }
    return result;
  }

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
            maxDate={new Date(new Date().setMonth(new Date().getMonth() + 2))}
            todayButton="Сегодня"
            filterDate={isDateAvailable}
            highlightDates={freeMode ? [] : [{ available: availableDates }]}
          />
        </div>

        <TimeSlots
          slots={slotsForSelectedDate}
          selectedDay={selectedDate}
          selectedTime={selectedTime}
          onTimeSelect={setSelectedTime}
        />
      </div>

      {error && <div className="consultation-modal__error">{error}</div>}
    </div>
  );
};

export default RecordForm;
