import { useState } from "react";
import Select, { type MultiValue } from "react-select";
import RecordForm from "./RecordForm";
import ConsultationsStore, { type OptionsResponse } from "../../../../store/consultations-store";
import './RecordModal.scss'

interface AdminConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRecord: (data: any) => void;
}

const AdminRecordModal: React.FC<AdminConsultationModalProps> = ({ isOpen, onClose, onRecord }) => {
  const [problems, setProblems] = useState<OptionsResponse[]>([]);
  const [specialists, setSpecialists] = useState<OptionsResponse[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<MultiValue<OptionsResponse>>([]);
  const [selectedSpecialist, setSelectedSpecialist] = useState<OptionsResponse | null>(null);

  const store = new ConsultationsStore();

  const loadProblems = async () => {
    if (problems.length > 0) return;
    setProblems(await store.getProblems());
  };

  const handleProblemChange = async (selected: MultiValue<OptionsResponse>) => {
    setSelectedOptions(selected);
    const ids = selected.map(opt => opt.value);
    console.log("Проблемы: ", ids)
    const specs = await store.findSpecialists(ids);
    console.log("Специалист: ", specs);
    // setSpecialists(specs);
  };

  const isOptionDisabled = (option: OptionsResponse): boolean => {
    const hasOtherProblem = selectedOptions.some(opt => opt.value === 9);
    const hasRegularProblems = selectedOptions.some(opt => opt.value !== 9);

    if (option.value === 9) {
      return hasRegularProblems;
    } else {
      return hasOtherProblem;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="consultation-modal">
        <h2 className="consultation-modal__title">Запись клиента (админ)</h2>
        <button className="consultation-modal__close" onClick={onClose}>X</button>

        <Select
          isMulti
          options={problems}
          value={selectedOptions}
          placeholder="Выберите одну или несколько проблем"
          className="consultation-modal__select-problems"
          classNamePrefix="custom-select"
          onChange={handleProblemChange}
          isOptionDisabled={isOptionDisabled}
          onMenuOpen={loadProblems}
        />

        <Select
          options={specialists}
          value={selectedSpecialist}
          onChange={(val) => setSelectedSpecialist(val as OptionsResponse)}
          placeholder="Выберите специалиста"
          className="consultation-modal__select-problems"
          isClearable
          classNamePrefix="custom-select"
        />

        <RecordForm
          specialist={selectedSpecialist}
          onSubmit={(data) => {
            onRecord({ ...data, problems: selectedOptions.map(o => o.value) });
            onClose();
          }}
        />
      </div>
    </div>
  );
};

export default AdminRecordModal;
