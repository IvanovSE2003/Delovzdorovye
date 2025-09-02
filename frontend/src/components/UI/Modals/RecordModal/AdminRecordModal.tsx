import { useState } from "react";
import Select, { type MultiValue } from "react-select";
import RecordForm from "./RecordForm";
import ConsultationsStore, { type OptionsResponse } from "../../../../store/consultations-store";
import './RecordModal.scss'

interface AdminConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRecord: (data: any) => void;
  userId?: string;
}

const AdminRecordModal: React.FC<AdminConsultationModalProps> = ({ isOpen, onClose, onRecord, userId = "" }) => {
  const [problems, setProblems] = useState<OptionsResponse[]>([]);
  const [specialists, setSpecialists] = useState<OptionsResponse[]>([]);
  const [selectedProblems, setselectedProblems] = useState<MultiValue<OptionsResponse>>([]);
  const [selectedSpecialist, setSelectedSpecialist] = useState<OptionsResponse | null>(null);
  const store = new ConsultationsStore();

  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");

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
      setSelectedSpecialist(null);
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

  const selectTimeDate = (time: string, date: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
  }

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

        {/* <RecordForm
          specialist={selectedSpecialist}
          problems={selectedProblems.map(value => value.value)}
          selectTimeDate={selectTimeDate}
          userId={userId}
        /> */}
      </div>
    </div>
  );
};

export default AdminRecordModal;
