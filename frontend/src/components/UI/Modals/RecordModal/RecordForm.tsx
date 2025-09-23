// RecordForm.tsx
import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ru } from "date-fns/locale";
import TimeSlots from "../../../../features/account/TimeSlots/TimeSlots";
import type { OptionsResponse, Slot } from "../../../../store/consultations-store";
import './RecordModal.scss';
import ConsultationsStore from "../../../../store/consultations-store";
import { processError } from "../../../../helpers/processError";

interface ConsultationFormProps {
  specialist?: OptionsResponse;
  slotsOverride?: Slot[];
  freeMode?: boolean;
  onTimeDateSelect: (time: string | null, date: string | null, doctorId?: number) => void;
  userId?: string;
  initialDate?: string; // Добавляем начальную дату
  initialTime?: string; // Добавляем начальное время
}

const RecordForm: React.FC<ConsultationFormProps> = ({
  specialist = {} as OptionsResponse,
  slotsOverride = undefined,
  freeMode = false,
  onTimeDateSelect,
  userId = undefined,
  initialDate = undefined, // Начальная дата в формате "YYYY-MM-DD"
  initialTime = undefined  // Начальное время в формате "HH:MM"
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
        // Парсим начальную дату
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

  // Сброс начальной загрузки при смене специалиста
  useEffect(() => {
    setInitialDataLoaded(false);
  }, [specialist?.value]);

  // Загрузка расписания специалиста
  useEffect(() => {
    if (freeMode) {
      setSlots([]);
      if (!initialDataLoaded) {
        setSelectedDate(null);
        setSelectedTime(null);
      }
      return;
    }

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
        setSlots(schedule || []);

        // Если есть начальные значения, проверяем их доступность
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
              // Слот недоступен, сбрасываем выбор
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
  }, [specialist?.value, slotsOverride, userId, freeMode, initialDate, initialTime, initialDataLoaded]);

  // Доступные даты
  const availableDates: Date[] = freeMode
    ? [] // все даты доступны в freeMode
    : Array.from(
      new Set(slots.map(slot => new Date(slot.date).toDateString()))
    ).map(str => new Date(str));

  const isDateAvailable = (date: Date) => {
    if (freeMode) return true;
    
    // Проверяем, есть ли хотя бы один доступный слот на эту дату
    return availableDates.some(
      availableDate => availableDate.toDateString() === date.toDateString()
    );
  };

  // Слоты для выбранной даты
  const slotsForSelectedDate = freeMode 
    ? generateAllSlotsForDay(selectedDate)
    : slots.filter(slot => 
        selectedDate && 
        new Date(slot.date).toDateString() === selectedDate.toDateString()
      );

  // Фильтрация прошедших слотов
  const availableSlotsForSelectedDate = slotsForSelectedDate.filter(slot => !isSlotInPast(slot));

  // Проверка слота на прошедшее время
  function isSlotInPast(slot: Slot): boolean {
    const now = new Date();
    const slotDate = new Date(slot.date);
    const [hour, minute] = slot.time.split(":").map(Number);
    slotDate.setHours(hour, minute, 0, 0);
    return slotDate < now;
  }

  // Проверка валидности даты
  function isValidDate(date: Date): boolean {
    return date instanceof Date && !isNaN(date.getTime());
  }

  // Обработчик выбора даты
  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    setSelectedTime(null);
    setError("");

    if (date && !isDateAvailable(date) && !freeMode) {
      setError("Выбранная дата недоступна для записи");
    }
  };

  // Обработчик выбора времени
  const handleTimeSelect = (time: string | null) => {
    setSelectedTime(time);
    setError("");
  };

  // Передаём выбранные время и дату наверх
  useEffect(() => {
    if (!selectedDate || !selectedTime) {
      onTimeDateSelect(null, null);
      return;
    }

    const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`;

    // Ищем соответствующий слот для получения doctorId
    const matchedSlot = slots.find(
      slot =>
        new Date(slot.date).toDateString() === selectedDate.toDateString() &&
        slot.time === selectedTime
    );

    // В freeMode используем doctorId из пропсов или 0
    const doctorId = freeMode ? (specialist?.value || 0) : matchedSlot?.doctorId;

    onTimeDateSelect(selectedTime, dateStr, doctorId);
  }, [selectedDate, selectedTime, slots, specialist?.value, freeMode]);

  // Генерация слотов для freeMode (каждый час с 9:00 до 18:00)
  function generateAllSlotsForDay(date: Date | null): Slot[] {
    if (!date) return [];
    
    // Проверяем, не является ли дата сегодняшним днем
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    
    const result: Slot[] = [];
    
    for (let hour = 9; hour <= 18; hour++) {
      // Если дата сегодня, пропускаем прошедшие часы
      if (isToday && hour < today.getHours()) {
        continue;
      }
      
      // Если час совпадает с текущим, проверяем минуты
      if (isToday && hour === today.getHours() && today.getMinutes() > 0) {
        continue;
      }
      
      result.push({
        date: date.toISOString(),
        time: `${String(hour).padStart(2, "0")}:00`,
        doctorId: specialist?.value || 0,
        status: "OPEN"
      });
    }
    return result;
  }

  // Подсветка дат с доступными слотами
  const highlightDates = freeMode 
    ? [] 
    : availableDates.map(date => ({
        "react-datepicker__day--highlighted-custom": date,
        "react-datepicker__day--highlighted": date
      }));

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
      
      {selectedDate && availableSlotsForSelectedDate.length === 0 && !freeMode && (
        <div className="consultation-modal__warning">
          На выбранную дату нет доступных слотов
        </div>
      )}
    </div>
  );
};

export default RecordForm;