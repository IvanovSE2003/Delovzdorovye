import { useState } from "react";
import Select, { type MultiValue } from "react-select";
import ConsultationsStore, { type OptionsResponse, type Slot } from "../../../../store/consultations-store";
import RecordForm from "./RecordForm"; // подключаем форму

interface UserConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRecord: (data: { date: string; time: string; doctorId: number; problems: number[]; otherProblem: string }) => void;
}

function buildScheduleMap(slots: Slot[]) {
  const schedule: Record<string, Record<string, number[]>> = {};
  slots.forEach(({ date, time, doctorId }) => {
    if (!schedule[date]) schedule[date] = {};
    if (!schedule[date][time]) schedule[date][time] = [];
    schedule[date][time].push(doctorId);
  });
  return schedule;
}

const UserRecordModal: React.FC<UserConsultationModalProps> = ({ isOpen, onClose, onRecord }) => {
  const [problems, setProblems] = useState<OptionsResponse[]>([]);
  const [selectedProblems, setSelectedProblems] = useState<MultiValue<OptionsResponse>>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [scheduleMap, setScheduleMap] = useState<Record<string, Record<string, number[]>>>({});

  const store = new ConsultationsStore();

  const loadProblems = async () => {
    if (problems.length > 0) return;
    setProblems(await store.getProblems());
  };

  const handleProblemChange = async (selected: MultiValue<OptionsResponse>) => {
    setSelectedProblems(selected);
    const ids = selected.map(p => p.value);
    const fetchedSlots = await store.getSchedulesByProblems(ids);
    setSlots(fetchedSlots);
    setScheduleMap(buildScheduleMap(fetchedSlots));
  };

  const handleSubmit = (formData: { date: Date; time: string; problemIds: number[]; otherProblem: string }) => {
    const dateStr = formData.date.toISOString().split("T")[0];
    const doctorId = scheduleMap[dateStr]?.[formData.time]?.[0]; // первый доступный врач
    if (!doctorId) return;

    onRecord({
      date: dateStr,
      time: formData.time,
      doctorId,
      problems: formData.problemIds,
      otherProblem: formData.otherProblem,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="consultation-modal">
        <h2>Запись на консультацию</h2>
        <button onClick={onClose}>X</button>

        <Select
          isMulti
          options={problems}
          value={selectedProblems}
          onChange={handleProblemChange}
          onMenuOpen={loadProblems}
          placeholder="Выберите проблему"
        />

        {slots.length > 0 && (
          <RecordForm
            specialist={null}
            onSubmit={(formData) =>
              handleSubmit({ ...formData, problemIds: selectedProblems.map(p => p.value) })
            }
          />
        )}
      </div>
    </div>
  );
};

export default UserRecordModal;
