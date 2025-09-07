import { useState } from "react";
import Select, { type MultiValue } from "react-select";
import ConsultationsStore, { type OptionsResponse, type Slot } from "../../../../store/consultations-store";
import RecordForm from "./RecordForm";
import './RecordModal.scss';
import type { ConsultationData } from "../EditModal/EditModal";

interface UserConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRecord: (data: ConsultationData) => void;
  userId: number;
}

const UserRecordModal: React.FC<UserConsultationModalProps> = ({ isOpen, onClose, onRecord, userId }) => {
  const [problems, setProblems] = useState<OptionsResponse[]>([]);
  const [selectedProblems, setSelectedProblems] = useState<MultiValue<OptionsResponse>>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [error, setError] = useState<string>("");

  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [otherProblem, setOtherProblem] = useState<string>("");
  const [doctorId, setDoctorId] = useState<number | undefined>(undefined);

  const store = new ConsultationsStore();

  // Загрузка проблем в селект
  const loadProblems = async () => {
    if (problems.length > 0) return;
    setProblems(await store.getProblems());
  };

  // Изменение селекта с проблемами
  const handleProblemChange = async (selected: MultiValue<OptionsResponse>) => {
    setSelectedProblems(selected);
    const ids = selected.map(p => p.value);
    const fetchedSlots = await store.getSchedulesByProblems(ids, userId);
    setSlots(fetchedSlots);
  };

  // Записаться на консультацию
  const handleSubmit = () => {
    if (!selectedDate || !selectedTime || !doctorId) {
      setError("Дата или время не выбраны");
      return;
    }

    onRecord({
      time: selectedTime,
      date: selectedDate,
      otherProblemText: otherProblem,
      problems: selectedProblems.map(p => p.value),
      doctorId: doctorId,
    });

    onClose();
  };

  // Затемнение некоторые полей
  const isOptionDisabled = (option: OptionsResponse): boolean => {
    const hasOtherProblem = selectedProblems.some(opt => opt.value === 9);
    const hasRegularProblems = selectedProblems.some(opt => opt.value !== 9);

    if (option.value === 9) {
      return hasRegularProblems;
    } else {
      return hasOtherProblem;
    }
  };

  // Получить дату и время от RecordForm
  const onTimeDateSelect = (time: string | null, date: string | null, doctorId?: number) => {
    setSelectedDate(date);
    setSelectedTime(time);
    setDoctorId(doctorId);
  };

  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="consultation-modal">
        <h2 className="consultation-modal__title">Запись на консультацию</h2>
        <button className="consultation-modal__close" onClick={onClose}>X</button>

        <Select
          isMulti
          options={problems}
          value={selectedProblems}
          placeholder="Выберите одну или несколько проблем"
          className="consultation-modal__select"
          classNamePrefix="custom-select"
          onChange={handleProblemChange}
          isOptionDisabled={isOptionDisabled}
          onMenuOpen={loadProblems}
          noOptionsMessage={() => "Нет доступных проблем"}
        />

        <RecordForm
          specialist={undefined}
          slotsOverride={slots}
          onTimeDateSelect={onTimeDateSelect}
          userId={""}
        />

        <div className="consultation-modal__other-problem">
          <p>Подробно о проблеме: </p>
          <textarea
            name="other-problem"
            id="other-problem"
            className="consultation-modal__textarea"
            placeholder="Если хотите, опишите вашу проблему подробнее..."
            value={otherProblem}
            onChange={(e) => setOtherProblem(e.target.value)}
          />
        </div>

        {error && (<div className="consultation-modal__error">{error}</div>)}

        <button
          className="consultation-modal__submit"
          onClick={handleSubmit}
        >
          Записаться
        </button>
      </div>
    </div>
  );
};

export default UserRecordModal;
