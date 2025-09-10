import { useState } from "react";
import Select, { type MultiValue } from "react-select";
import ConsultationsStore, { type OptionsResponse, type Slot } from "../../../../store/consultations-store";
import RecordForm from "./RecordForm";
import "./RecordModal.scss";
import type { ConsultationData } from "../EditModal/EditModal";

interface UserConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRecord: (data: ConsultationData) => void;
  userId: number;
}

const OTHER_PROBLEM_ID = 9;

const UserRecordModal: React.FC<UserConsultationModalProps> = ({
  isOpen,
  onClose,
  onRecord,
  userId,
}) => {
  const [problems, setProblems] = useState<OptionsResponse[]>([]);
  const [selectedProblems, setSelectedProblems] = useState<MultiValue<OptionsResponse>>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [error, setError] = useState<string>("");

  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [descriptionProblem, SetDescriptionProblem] = useState<string>("");
  const [doctorId, setDoctorId] = useState<number | undefined>(undefined);

  const [showOtherProblem, setShowOtherProblem] = useState<boolean>(false);

  const store = new ConsultationsStore();

  // Загрузка проблем в селект
  const loadProblems = async () => {
    if (problems.length > 0) return;
    const fetched = await store.getProblems();
    setProblems([...fetched, { value: OTHER_PROBLEM_ID, label: "Другая проблема" }]);
  };

  // Изменение селекта с проблемами
  const handleProblemChange = async (selected: MultiValue<OptionsResponse>) => {
    const hasOther = selected.some((p) => p.value === OTHER_PROBLEM_ID);
    setShowOtherProblem(false);

    if (hasOther) {
      // оставляем только "Другая проблема"
      const normalizedSelected = selected.filter((p) => p.value === OTHER_PROBLEM_ID);
      setSelectedProblems(normalizedSelected);
      setShowOtherProblem(true);

      // очищаем слоты, т.к. календарь должен быть свободным
      setSlots([]);
      return;
    }

    setSelectedProblems(selected);

    if (selected.length === 0) {
      setSlots([]);
      return;
    }

    try {
      const ids = selected.map((p) => p.value);
      const fetchedSlots = await store.getSchedulesByProblems(ids, userId);
      setSlots(fetchedSlots);
    } catch (err) {
      console.error("Ошибка при загрузке расписания по проблемам:", err);
      setError("Не удалось загрузить расписание");
    }
  };
  
  // Записаться на консультацию
  const handleSubmit = () => {
    if (!selectedDate || !selectedTime) {
      setError("Дата или время не выбраны");
      return;
    }

    onRecord({
      time: selectedTime,
      date: selectedDate,
      descriptionProblem: descriptionProblem,
      problems: selectedProblems.map((p) => p.value),
      doctorId: doctorId,
      otherProblem: showOtherProblem,
    });

    // Сброс состояния
    setSelectedDate(null);
    setSelectedTime(null);
    SetDescriptionProblem("");
    setDoctorId(undefined);
    setSelectedProblems([]);

    onClose();
  };

  // Ограничение выбора
  const isOptionDisabled = (option: OptionsResponse): boolean => {
    const hasOtherProblem = selectedProblems.some((opt) => opt.value === OTHER_PROBLEM_ID);
    if (option.value === OTHER_PROBLEM_ID) return false;
    return hasOtherProblem;
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

        <p className="consultation-modal__description">
          Выберите удобные дату и время в календаре ниже:
        </p>

        <RecordForm
          specialist={undefined}
          slotsOverride={slots}
          freeMode={showOtherProblem}
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
            onChange={(e) => SetDescriptionProblem(e.target.value)}
          />
        </div>

        {error && <div className="consultation-modal__error">{error}</div>}

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
