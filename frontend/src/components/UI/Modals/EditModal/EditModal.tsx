import { useState, useEffect } from "react";
import Select, { type MultiValue } from "react-select";
import RecordForm from "../RecordModal/RecordForm";
import ConsultationsStore, { type OptionsResponse } from "../../../../store/consultations-store";
import "./EditModal.scss";
import { observer } from "mobx-react-lite";
import { GetFormatDate } from "../../../../helpers/formatDate";
import LoaderUsefulInfo from "../../LoaderUsefulInfo/LoaderUsefulInfo";
import ShowError from "../../ShowError/ShowError";
import { processError } from "../../../../helpers/processError";
import type { ConsultationData } from "../../../../models/consultations/ConsultationData";
import type { Consultation } from "../../../../models/consultations/Consultation";
import ModalHeader from "../ModalHeader/ModalHeader";
import { GetFormatPhone } from "../../../../helpers/formatPhone";

interface ConsultationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRecord: (data: ConsultationData) => void;
    consultationData: Consultation;
}

const EditModal: React.FC<ConsultationModalProps> = ({ isOpen, onClose, onRecord, consultationData }) => {
    const store = new ConsultationsStore();

    const [problems, setProblems] = useState<OptionsResponse[]>([]);
    const [specialists, setSpecialists] = useState<OptionsResponse[]>([]);
    const [doctorId, setDoctorId] = useState<number | undefined>(consultationData.DoctorId);

    const [selectedProblems, setSelectedProblems] = useState<MultiValue<OptionsResponse>>([]);
    const [selectedSpecialist, setSelectedSpecialist] = useState<OptionsResponse | undefined>(undefined);
    const [selectedDate, setSelectedDate] = useState<string>(consultationData.date);
    const [selectedTime, setSelectedTime] = useState<string>(consultationData.durationTime);
    const [descriptionProblem, setDescriptionProblem] = useState<string>(consultationData.descriptionProblem ?? "");
    const [editDateTime, setEditDateTime] = useState<boolean>(false);

    const [error, setError] = useState<{ id: number; message: string }>({ id: 0, message: "" });
    const [loading, setLoading] = useState<boolean>(false);
    const [initialDataLoaded, setInitialDataLoaded] = useState<boolean>(false);

    // Функция для полного сброса состояния
    const resetState = () => {
        setProblems([]);
        setSpecialists([]);
        setDoctorId(consultationData.DoctorId);
        setSelectedProblems([]);
        setSelectedSpecialist(undefined);
        setSelectedDate(consultationData.date);
        setSelectedTime(consultationData.durationTime);
        setDescriptionProblem(consultationData.descriptionProblem ?? "");
        setEditDateTime(false);
        setError({ id: 0, message: "" });
        setLoading(false);
        setInitialDataLoaded(false);
    };

    // Сброс данных при изменении проблемы
    const resetOnProblemChange = () => {
        setSelectedSpecialist(undefined);
        setDoctorId(undefined);
        setSelectedDate(consultationData.date);
        setSelectedTime(consultationData.durationTime);
        setEditDateTime(false);
        setSpecialists([]);
    };

    // Сброс данных при изменении специалиста
    const resetOnSpecialistChange = () => {
        setSelectedDate(consultationData.date);
        setSelectedTime(consultationData.durationTime);
        setEditDateTime(false);
        setDoctorId(undefined);
    };

    // Загружаем проблемы и специалистов
    useEffect(() => {
        if (!isOpen) return;

        const initData = async () => {
            setLoading(true);
            setError({ id: 0, message: "" });

            try {
                const probs = await store.getProblems();
                setProblems(probs);

                // Выставляем текущие проблемы из consultationData
                const matchedProblems = probs.filter((p) =>
                    consultationData.Problems?.some(
                        (problemName: any) => p.label.toLowerCase() === problemName.toLowerCase()
                    )
                );
                setSelectedProblems(matchedProblems);

                // Грузим специалистов для текущих проблем
                if (matchedProblems.length > 0) {
                    const ids = matchedProblems.map((p) => p.value);
                    const specs = await store.findSpecialists(ids);
                    setSpecialists(specs);

                    const matchedDoctor = specs.find((s) => s.value === consultationData.DoctorId);
                    if (matchedDoctor) {
                        setSelectedSpecialist(matchedDoctor);
                        setDoctorId(matchedDoctor.value);
                    }
                }

                setDescriptionProblem(consultationData.descriptionProblem ?? "");
                setSelectedDate(consultationData.date);
                setSelectedTime(consultationData.durationTime);
                setInitialDataLoaded(true);
            } catch (e) {
                processError(e, "Ошибка при загрузке данных");
            } finally {
                setLoading(false);
            }
        };

        initData();
    }, [isOpen]);

    // Сброс состояния при закрытии модального окна
    useEffect(() => {
        if (!isOpen) {
            resetState();
        }
    }, [isOpen]);

    // Изменение проблем
    const handleProblemChange = async (selected: MultiValue<OptionsResponse>) => {
        const previousProblems = selectedProblems.map(p => p.value);
        const newProblems = selected.map(p => p.value);

        // Проверяем, действительно ли изменились проблемы
        const problemsChanged =
            previousProblems.length !== newProblems.length ||
            !previousProblems.every(problem => newProblems.includes(problem));

        if (problemsChanged) {
            setSelectedProblems(selected);
            resetOnProblemChange();

            if (selected.length > 0) {
                const ids = selected.map((opt) => opt.value);
                const specs = await store.findSpecialists(ids);
                setSpecialists(specs);
            } else {
                setSpecialists([]);
            }
        }
    };

    // Изменение специалиста
    const handleSpecialistChange = (value: OptionsResponse | null) => {
        const newSpecialist = value as OptionsResponse;
        const previousSpecialistId = selectedSpecialist?.value;

        // Проверяем, действительно ли изменился специалист
        if (newSpecialist?.value !== previousSpecialistId) {
            setSelectedSpecialist(newSpecialist);
            setDoctorId(newSpecialist?.value);

            if (newSpecialist?.value !== consultationData.DoctorId) {
                resetOnSpecialistChange();
            }
        }
    };

    // Логика запрета выбора "Другая проблема" вместе с другими
    const isOptionDisabled = (option: OptionsResponse): boolean => {
        const hasOtherProblem = selectedProblems.some((opt) => opt.value === 9);
        const hasRegularProblems = selectedProblems.some((opt) => opt.value !== 9);
        return option.value === 9 ? hasRegularProblems : hasOtherProblem;
    };

    // Получение даты и времени от RecordForm
    const selectTimeDate = (time: string | null, date: string | null, docId?: number) => {
        setSelectedDate(date || "");
        setSelectedTime(time || "");
        if (docId) {
            setDoctorId(docId);
            // Обновляем выбранного специалиста если изменился doctorId
            const newSpecialist = specialists.find(s => s.value === docId);
            if (newSpecialist && newSpecialist.value !== selectedSpecialist?.value) {
                setSelectedSpecialist(newSpecialist);
            }
        }
    };

    // Сохранение изменений
    const handleSubmit = () => {
        if (!selectedDate || !selectedTime) {
            setError({ id: Date.now(), message: "Дата и время не выбраны" });
            return;
        }

        if (!doctorId) {
            setError({ id: Date.now(), message: "Врач не выбран" });
            return;
        }

        if (selectedProblems.length === 0) {
            setError({ id: Date.now(), message: "Необходимо выбрать хотя бы одну проблему" });
            return;
        }

        const startTime = selectedTime.includes("-")
            ? selectedTime.split("-")[0].trim()
            : selectedTime;

        onRecord({
            id: consultationData.id,
            userId: consultationData.PatientUserId,
            time: startTime,
            date: selectedDate,
            descriptionProblem,
            problems: selectedProblems.map((p) => p.value),
            doctorId: doctorId,
            hasOtherProblem: selectedProblems.some(p => p.value === 9),
        });

        setError({ id: 0, message: "" });
        onClose();
    };

    const applyDateTime = () => {
        setEditDateTime(false);
    };

    const cancelDateTimeEdit = () => {
        setSelectedDate(consultationData.date);
        setSelectedTime(consultationData.durationTime);
        setEditDateTime(false);
    };

    if (!isOpen) return null;

    return (
        <div className="modal">
            <div className="consultation-modal">
                <ModalHeader title="Редактирование консультации" onClose={onClose} />

                {loading && !initialDataLoaded ? (
                    <LoaderUsefulInfo />
                ) : (
                    <>
                        <p className="consultation-modal__client">
                            Клиент: {consultationData.PatientSurname} {consultationData.PatientName} {consultationData.PatientPatronymic ?? ""}, {GetFormatPhone(consultationData.PatientPhone)}
                        </p>

                        <Select
                            isMulti
                            options={problems}
                            value={selectedProblems}
                            placeholder="Выберите одну или несколько проблем"
                            className="consultation-modal__select"
                            classNamePrefix="custom-select"
                            onChange={handleProblemChange}
                            isOptionDisabled={isOptionDisabled}
                            noOptionsMessage={() => "Нет доступных проблем"}
                            isDisabled={loading}
                        />

                        <Select
                            options={specialists}
                            value={selectedSpecialist}
                            onChange={handleSpecialistChange}
                            placeholder="Выберите специалиста"
                            className="consultation-modal__select"
                            isClearable
                            classNamePrefix="custom-select"
                            noOptionsMessage={() =>
                                selectedProblems.length === 0
                                    ? "Сначала выберите проблему"
                                    : "Нет доступных специалистов"
                            }
                            isDisabled={loading || selectedProblems.length === 0}
                        />

                        <div className="shift-modal__information">
                            <p>
                                {selectedDate && selectedTime ? (
                                    `Запись на: ${GetFormatDate(selectedDate)}, ${selectedTime}`
                                ) : (
                                    "Дата и время не выбраны"
                                )}
                            </p>
                            {!editDateTime && selectedSpecialist &&  (
                                <button
                                    className="my-button"
                                    onClick={() => setEditDateTime(true)}
                                    disabled={!selectedSpecialist}
                                >
                                    Изменить дату и время
                                </button>
                            )}
                            {!editDateTime && !selectedSpecialist && (
                                <p>Для изменения даты записи выберите специалиста!</p>
                            )}
                        </div>

                        {editDateTime && selectedSpecialist && (
                            <div className="edit-modal__edit-time">
                                <RecordForm
                                    specialist={selectedSpecialist}
                                    onTimeDateSelect={selectTimeDate}
                                    userId={consultationData.PatientUserId.toString()}
                                    initialDate={selectedDate}
                                    initialTime={selectedTime}
                                />
                                <div className="edit-modal__buttons">
                                    <button className="my-button" onClick={cancelDateTimeEdit}>
                                        Отмена
                                    </button>
                                    <button className="my-button edit-modal__comfirm" onClick={applyDateTime}>
                                        Применить
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="consultation-modal__field">
                            <div className="consultation-modal__label">Подробно о проблеме:</div>
                            <textarea
                                name="other-problem"
                                id="other-problem"
                                className="consultation-modal__textarea"
                                placeholder="Подробное описание проблемы..."
                                value={descriptionProblem}
                                onChange={(e) => setDescriptionProblem(e.target.value)}
                                rows={4}
                                disabled={loading}
                            />
                        </div>

                        <ShowError msg={error} />

                        <button
                            className="consultation-modal__submit"
                            onClick={handleSubmit}
                            disabled={loading || !selectedDate || !selectedTime || !doctorId || selectedProblems.length === 0}
                        >
                            {loading ? "Сохранение..." : "Сохранить изменения"}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default observer(EditModal);