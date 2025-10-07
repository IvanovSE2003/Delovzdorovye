import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ru } from "date-fns/locale";
import TimeSlots from "../../../../features/account/TimeSlots/TimeSlots";
import type { OptionsResponse, Slot } from "../../../../store/consultations-store";
import './RecordModal.scss';
import ConsultationsStore from "../../../../store/consultations-store";
import { processError } from "../../../../helpers/processError";
import { formatDateToYYYYMMDD } from "../../../../helpers/formatDatePhone";

interface ConsultationFormProps {
  specialist?: OptionsResponse;
  slotsOverride?: Slot[];
  onTimeDateSelect: (time: string | null, date: string | null, doctorId?: number) => void;
  userId?: string;
  initialDate?: string;
  initialTime?: string;
}

const RecordForm: React.FC<ConsultationFormProps> = ({
  specialist = {} as OptionsResponse,
  slotsOverride = undefined,
  onTimeDateSelect,
  userId = undefined,
  initialDate = undefined,
  initialTime = undefined
}) => {
  const store = new ConsultationsStore();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);

  // Инициализация начальных значений
  useEffect(() => {
    if (initialDate && initialTime && !initialDataLoaded) {
      try {
        const [year, month, day] = initialDate.split('-').map(Number);
        const date = new Date(year, month - 1, day);

        if (isValidDate(date)) {
          setSelectedDate(date);
          setSelectedTime(initialTime);
          setInitialDataLoaded(true);
        }
      } catch (error) {
        console.error("Error parsing initial date/time:", error);
      }
    }
  }, [initialDate, initialTime, initialDataLoaded]);

  // Сброс при смене специалиста
  useEffect(() => {
    setInitialDataLoaded(false);
  }, [specialist?.value]);

  // Загрузка расписания специалиста
  useEffect(() => {
    if (slotsOverride !== undefined) {
      setSlots(slotsOverride);
      if (slotsOverride.length === 0 && !initialDataLoaded) {
        setSelectedDate(null);
        setSelectedTime(null);
      }
      return;
    }

    const loadSpecialistSchedule = async () => {
      if (!specialist?.value) {
        setSlots([]);
        if (!initialDataLoaded) {
          setSelectedDate(null);
          setSelectedTime(null);
        }
        return;
      }

      try {
        const schedule = await store.getSchedule(specialist.value, Number(userId));
        console.log(schedule)
        setSlots(schedule || []);

        if (initialDate && initialTime && !initialDataLoaded) {
          const [year, month, day] = initialDate.split('-').map(Number);
          const date = new Date(year, month - 1, day);

          if (isValidDate(date)) {
            const isSlotAvailable = schedule?.some(slot =>
              new Date(slot.date).toDateString() === date.toDateString() &&
              slot.time === initialTime
            );

            if (isSlotAvailable) {
              setSelectedDate(date);
              setSelectedTime(initialTime);
            } else {
              setSelectedDate(null);
              setSelectedTime(null);
            }
            setInitialDataLoaded(true);
          }
        }
      } catch (e) {
        processError(e, "Ошибка при загрузке расписания специалиста");
        setSlots([]);
        if (!initialDataLoaded) {
          setSelectedDate(null);
          setSelectedTime(null);
        }
      }
    };

    loadSpecialistSchedule();
  }, [specialist?.value, slotsOverride, userId, initialDate, initialTime, initialDataLoaded]);

  // Доступные даты
  const availableDates: Date[] = Array.from(
    new Set(slots.map(slot => new Date(slot.date).toDateString()))
  ).map(str => new Date(str));

  const isDateAvailable = (date: Date) =>
    availableDates.some(d => d.toDateString() === date.toDateString());

  // Слоты для выбранной даты
  const slotsForSelectedDate = slots.filter(slot =>
    selectedDate &&
    new Date(slot.date).toDateString() === selectedDate.toDateString()
  );

  // Фильтрация прошедших слотов
  const availableSlotsForSelectedDate = slotsForSelectedDate.filter(slot => !isSlotInPast(slot));

  function isSlotInPast(slot: Slot): boolean {
    const now = new Date();
    const slotDate = new Date(slot.date);
    const [hour, minute] = slot.time.split(":").map(Number);
    slotDate.setHours(hour, minute, 0, 0);
    return slotDate < now;
  }

  function isValidDate(date: Date): boolean {
    return date instanceof Date && !isNaN(date.getTime());
  }

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    setSelectedTime(null);
    setError("");

    if (date && !isDateAvailable(date)) {
      setError("Выбранная дата недоступна для записи");
    }
  };

  const handleTimeSelect = (time: string | null) => {
    setSelectedTime(time);
    setError("");
  };

  useEffect(() => {
    if (!selectedDate || !selectedTime) {
      onTimeDateSelect(null, null, undefined);
      return;
    }

    const StringDate = formatDateToYYYYMMDD(selectedDate)
    const matchedSlot = slots.find(
      slot => slot.date === StringDate && slot.time.slice(0, 5) === selectedTime
    );
    const doctorId = matchedSlot?.doctorId;

    onTimeDateSelect(selectedTime, StringDate, doctorId);
  }, [selectedDate, selectedTime, slots, specialist?.value]);

  const highlightDates = [
    {
      "react-datepicker__day--highlighted-custom": availableDates,
      "react-datepicker__day--highlighted": availableDates
    }
  ];

  return (
    <div>
      <div className="consultation-modal__date-time">
        <div className="consultation-modal__calendar">
          <DatePicker
            selected={selectedDate}
            onChange={handleDateChange}
            inline
            locale={ru}
            dateFormat="dd.MM.yyyy"
            minDate={new Date()}
            maxDate={new Date(new Date().setMonth(new Date().getMonth() + 2))}
            todayButton="Сегодня"
            filterDate={isDateAvailable}
            highlightDates={highlightDates}
            disabledKeyboardNavigation
          />
        </div>

        <TimeSlots
          slots={availableSlotsForSelectedDate}
          selectedDay={selectedDate}
          selectedTime={selectedTime}
          onTimeSelect={handleTimeSelect}
          showEmptyState={true}
        />
      </div>

      {error && <div className="consultation-modal__error">{error}</div>}

      {selectedDate && availableSlotsForSelectedDate.length === 0 && (
        <div className="consultation-modal__warning">
          На выбранную дату нет доступных слотов
        </div>
      )}
    </div>
  );
};

export default RecordForm;
