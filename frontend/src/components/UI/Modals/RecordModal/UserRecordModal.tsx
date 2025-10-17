import { useState } from "react";
import Select, { type MultiValue } from "react-select";
import ConsultationsStore, { type OptionsResponse, type Slot } from "../../../../store/consultations-store";
import RecordForm from "./RecordForm";
import "./RecordModal.scss";
import type { ConsultationData } from "../../../../models/consultations/ConsultationData";
import ShowError from "../../ShowError/ShowError";
import ModalHeader from "../ModalHeader/ModalHeader";

interface UserConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRecord: (data: ConsultationData) => void;
  userId: number;
}

const OTHER_PROBLEM_LABEL = "Другая проблема";

const UserRecordModal: React.FC<UserConsultationModalProps> = ({ isOpen, onClose, onRecord, userId }) => {
  const [problems, setProblems] = useState<OptionsResponse[]>([]);
  const [selectedProblems, setSelectedProblems] = useState<MultiValue<OptionsResponse>>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [error, setError] = useState<{ id: number, message: string }>({ id: 0, message: "" });

  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [descriptionProblem, setDescriptionProblem] = useState<string>("");
  const [doctorId, setDoctorId] = useState<number | undefined>(undefined);
  const [showOtherProblem, setShowOtherProblem] = useState<boolean>(false);

  const store = new ConsultationsStore();

  // Проверка, является ли опция "Другой проблемой"
  const isOtherProblem = (option: OptionsResponse): boolean => {
    return option.label === OTHER_PROBLEM_LABEL;
  };

  // Проверка, выбрана ли "Другая проблема"
  const hasOtherProblemSelected = (selected: MultiValue<OptionsResponse>): boolean => {
    return selected.some(isOtherProblem);
  };

  // Загрузка проблем в селект
  const loadProblems = async () => {
    if (problems.length > 0) return;
    const fetched = await store.getProblems();
    setProblems([...fetched, { value: fetched.length + 1, label: OTHER_PROBLEM_LABEL }]);
  };

  // Изменение селекта с проблемами
  const handleProblemChange = async (selected: MultiValue<OptionsResponse>) => {
    setShowOtherProblem(false);
    setSelectedProblems(selected);

    const hasOther = hasOtherProblemSelected(selected);
    if (hasOther) {
      setShowOtherProblem(true);
      const slots = await store.findSheduleSpecialist(userId);
      setSlots(slots);
      return;
    }

    if (selected.length === 0) {
      setSlots([]);
      return;
    }

    const ids = selected.map((p) => p.value);
    const slots = await store.getSchedulesByProblems(ids, userId);
    setSlots(slots);
  };

  // Ограничение выбора
  const isOptionDisabled = (option: OptionsResponse): boolean => {
    const hasOther = hasOtherProblemSelected(selectedProblems);
    if (isOtherProblem(option)) return false;
    return hasOther;
  };

  // Остальной код остается таким же...
  const handleSubmit = () => {
    if (!selectedDate || !selectedTime) {
      setError({ id: Date.now(), message: "Дата или время не выбраны" });
      return;
    }

    onRecord({
      time: selectedTime,
      date: selectedDate,
      descriptionProblem: descriptionProblem,
      problems: selectedProblems.map((p) => p.value),
      hasOtherProblem: showOtherProblem,
      doctorId: doctorId,
    });

    // Сброс состояния
    setSelectedDate(null);
    setSelectedTime(null);
    setDescriptionProblem("");
    setDoctorId(undefined);
    setSelectedProblems([]);
    setShowOtherProblem(false);
    onClose();
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
        <ModalHeader
          title="Запись на консультацию"
          onClose={onClose}
          className="consultation-modal__header"
        />

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

        <p className="consultation-modal__description">
          Выберите удобные дату и время в календаре ниже:
        </p>

        <RecordForm
          specialist={undefined}
          slotsOverride={slots}
          onTimeDateSelect={onTimeDateSelect}
          userId={""}
        />

        <div className="consultation-modal__other-problem">
          <p className="consultation-modal__description">
            {!showOtherProblem
              ? "Если вы хотите уточнить детали - опишите это подробно в поле ниже:"
              : <span className="consultation-modal__description-flag">
                Обязательно укажите свою проблему, которую Вы не нашли в списке:
              </span>}
          </p>
          <textarea
            name="other-problem"
            id="other-problem"
            className="consultation-modal__textarea"
            placeholder={showOtherProblem ? "Опишите свою проблему (не менее 10 символов)" : "Подробное описание проблемы..."}
            value={descriptionProblem}
            onChange={(e) => setDescriptionProblem(e.target.value)}
          />
        </div>

        <ShowError msg={error} className="consultation-modal__error" />

        <button
          className="consultation-modal__submit"
          onClick={handleSubmit}
          disabled={showOtherProblem && descriptionProblem.length <= 10}
        >
          Записаться на консультацию
        </button>
      </div>
    </div>
  );
};

export default UserRecordModal;
