// ConsultationForm.tsx
import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ru } from "date-fns/locale";
import TimeSlots from "../../../../features/account/TimeSlots/TimeSlots";
import type { OptionsResponse } from "../../../../store/consultations-store";
import './RecordModal.scss';

interface ConsultationFormProps {
  specialist?: OptionsResponse | null;
  onSubmit: (data: {
    date: Date;
    time: string;
    problemIds: number[];
    otherProblem: string;
  }) => void;
}

const times = [
  "09:00", "09:30", "10:00", "10:30",
  "12:00", "12:30", "13:00", "13:30",
  "15:00", "16:00", "18:00", "19:30"
];

const RecordForm: React.FC<ConsultationFormProps> = ({ specialist, onSubmit }) => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [otherProblemText, setOtherProblemText] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!selectedDate || !selectedTime) {
      setError("Выберите дату и время");
      return;
    }
    if (!specialist) {
      setError("Не выбран специалист");
      return;
    }

    onSubmit({
      date: selectedDate,
      time: selectedTime,
      problemIds: [], // прокинете снаружи
      otherProblem: otherProblemText
    });
  };

  return (
    <div>
      {specialist && <p>Выбран специалист: {specialist.label}</p>}

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
          />
        </div>

        <div className="consultation-modal__time">
          <TimeSlots times={times} onSelect={setSelectedTime} />
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

      <button className="consultation-modal__submit" onClick={handleSubmit}>Записаться</button>
    </div>
  );
};

export default RecordForm;
