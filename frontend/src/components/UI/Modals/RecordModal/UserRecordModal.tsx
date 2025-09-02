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

  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");

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
    const fetchedSlots = await store.getSchedulesByProblems(ids);
    setSlots(fetchedSlots);
  };

  const handleSubmit = () => {
    if (!selectedDate || !selectedTime) {
      console.log("Дата или время не выбраны");
      return;
    }

    console.log({
      userId,
      time: selectedTime,
      date: selectedDate,
      problems: selectedProblems.map(p => p.value)
    })
  }


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

  const onTimeDateSelect = (time: string, date: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
    console.log(time, date);
  }

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
          specialist={null}
          slotsOverride={slots}
          onTimeDateSelect={onTimeDateSelect}
        />

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
