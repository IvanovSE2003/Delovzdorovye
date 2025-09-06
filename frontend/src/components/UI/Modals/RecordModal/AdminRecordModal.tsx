import { useEffect, useState } from "react";
import Select, { type MultiValue } from "react-select";
import RecordForm from "./RecordForm";
import ConsultationsStore, { type OptionsResponse } from "../../../../store/consultations-store";
import './RecordModal.scss'

interface AdminConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onRecord: (data: any) => void;
}

const AdminRecordModal: React.FC<AdminConsultationModalProps> = ({ isOpen, onClose, onRecord, userId=undefined }) => {
  const [problems, setProblems] = useState<OptionsResponse[]>([] as OptionsResponse[]);
  const [specialists, setSpecialists] = useState<OptionsResponse[]>([] as OptionsResponse[]);
  const [doctorId, setDoctorId] = useState<number | undefined>(undefined);
  const [error, setError] = useState<string>("");
  const store = new ConsultationsStore();

  const [selectedProblems, setselectedProblems] = useState<MultiValue<OptionsResponse>>([]);
  const [selectedSpecialist, setSelectedSpecialist] = useState<OptionsResponse | undefined>(undefined);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [otherProblem, setOtherProblem] = useState<string>("");

  // Получение всех проблем
  const loadProblems = async () => {
    if (problems.length > 0) return;
    setProblems(await store.getProblems());
  };

  // Изменение селекта с проблемами
  const handleProblemChange = async (selected: MultiValue<OptionsResponse>) => {
    setselectedProblems(selected);

    if (selected.length === 0) {
      setSpecialists([]);
      setSelectedSpecialist(undefined);
      return;
    }

    const ids = selected.map(opt => opt.value);
    const specs = await store.findSpecialists(ids);

    const specialistsOptions: OptionsResponse[] = specs.map(spec => ({
      value: spec.id,
      label: `${spec.user.surname} ${spec.user.name} ${spec.user.patronymic}`
    }));

    setSpecialists(specialistsOptions);
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

  // Получение даты и времени от RecordForm
  const selectTimeDate = (time: string | null, date: string | null, doctorId?: number) => {
    setSelectedDate(date);
    setSelectedTime(time);
    setDoctorId(doctorId);
  }

  // Записать человека на консультацию
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

    setselectedProblems([]);
    setSelectedSpecialist(undefined);
    setSelectedTime(null);
    setSelectedDate(null);
    setDoctorId(undefined);
    setOtherProblem("");
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="consultation-modal">
        <h2 className="consultation-modal__title">Запись клиента</h2>
        <button className="consultation-modal__close" onClick={onClose}>X</button>

        {/* Проблемы */}
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

        {/* Специалисты */}
        <Select
          options={specialists}
          value={selectedSpecialist}
          onChange={(value) => setSelectedSpecialist(value as OptionsResponse)}
          placeholder="Выберите специалиста"
          className="consultation-modal__select"
          isClearable
          classNamePrefix="custom-select"
          noOptionsMessage={() =>
            selectedProblems.length === 0
              ? "Сначала выберите проблему"
              : "Нет доступных специалистов"
          }
        />

        <RecordForm
          specialist={selectedSpecialist}
          onTimeDateSelect={selectTimeDate}
          userId={userId||""}
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
          disabled={!selectedDate || !selectedTime}
        >
          Записать
        </button>
      </div>
    </div>
  );
};

export default AdminRecordModal;
