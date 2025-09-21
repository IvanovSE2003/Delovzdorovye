import { useState, useEffect } from "react";
import Select, { type MultiValue } from 'react-select';
import "react-datepicker/dist/react-datepicker.css";
import ConsultationsStore, { type OptionsResponse } from "../../../../store/consultations-store";
import './EditModal.scss';
import type { Consultation } from "../../../../features/account/UpcomingConsultations/UpcomingConsultations";
import { GetFormatPhone } from "../../../../helpers/formatDatePhone";
import RecordForm from "../RecordModal/RecordForm";
import ShowError from "../../ShowError/ShowError";

interface ConsultationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRecord: (data: ConsultationData) => void;
    consultationData: Consultation;
}

export interface ConsultationData {
    id?: number;
    userId?: number;
    problems?: number[];
    otherProblem?: string;
    hasOtherProblem?: boolean;
    descriptionProblem?: string;
    date: Date | string | undefined;
    time: string | null;
    doctorId?: number;
}

const EditModal: React.FC<ConsultationModalProps> = ({ isOpen, onClose, onRecord, consultationData }) => {
    const consultationStore = new ConsultationsStore();
    const [otherProblemText, setOtherProblemText] = useState<string>("");
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date>();

    const [problems, setProblems] = useState<OptionsResponse[]>([]);
    const [specialists, setSpecialists] = useState<OptionsResponse[]>([] as OptionsResponse[]);

    const [selectedSpecialist, setSelectedSpecialist] = useState<OptionsResponse>({} as OptionsResponse);
    const [selectedOptions, setSelectedOptions] = useState<MultiValue<OptionsResponse>>([]);

    const [error, setError] = useState<{id: number, message: string}>({id: 0, message: ""});

    const getProblems = async () => {
        const data = await consultationStore.getProblems();
        setProblems(data);
        const matchedProblems = problems.filter(problem =>
            consultationData.Problems.some(problemName =>
                problem.label.toLowerCase() === problemName.toLowerCase()
            )
        );
        setSelectedOptions(matchedProblems)
    }

    const getSpecialists = async () => {
        const problemIds = selectedOptions.map(value => value.value)
        const data = await consultationStore.findSpecialists(problemIds);
        setSpecialists(data);
        console.log(data.filter(value => value.value === consultationData.DoctorId)[0])
        setSelectedSpecialist(data.filter(value => value.value === consultationData.DoctorId)[0]);
    }

    const handleProblemChange = async (selected: MultiValue<OptionsResponse>) => {
        const selectedArray = Array.from(selected);

        const hasOtherProblem = selectedArray.some(option => option.value === 9);
        const hasRegularProblems = selectedArray.some(option => option.value !== 9);

        if (hasOtherProblem && hasRegularProblems) {
            const otherProblemOnly = selectedArray.filter(option => option.value === 9);
            setSelectedOptions(otherProblemOnly);
        } else {
            setSelectedOptions(selectedArray);
        }
    };

    const handleSpecialistChange = async () => {
        try {
            const response = await consultationStore.getSchedule(selectedSpecialist.value, consultationData.PatientUserId);

        } catch (e) {

        }
    }

    const isOptionDisabled = (option: OptionsResponse): boolean => {
        const hasOtherProblem = selectedOptions.some(opt => opt.value === 9);
        const hasRegularProblems = selectedOptions.some(opt => opt.value !== 9);

        if (option.value === 9) {
            return hasRegularProblems;
        } else {
            return hasOtherProblem;
        }
    };

    const handleSubmit = () => {
        if (!selectedDate || !selectedTime) {
            setError("Пожалуйста, выберите дату и время");
            return;
        }

        const problems = selectedOptions.map(option => option.value);

        // Проверяем, есть ли выбранные проблемы
        if (problems.length === 0 && !otherProblemText.trim()) {
            setError("Пожалуйста, выберите хотя бы одну проблему");
            return;
        }

        onRecord({
            problems,
            descriptionProblem: otherProblemText,
            date: selectedDate,
            time: selectedTime,
            doctorId: 0
        });

        // Сброс формы
        setSelectedOptions([]);
        setOtherProblemText("");
        // setShowOtherProblemInput(false);
        setSelectedDate(undefined);
        setSelectedTime(null);
        setError("");
    };

    const onTimeDateSelect = (time: string | null, date: string | null, doctorId?: number) => {
        console.log(time, date);
    }

    useEffect(() => {
        getProblems();
        getSpecialists();
        // console.log(consultationData)
    }, [consultationData])

    if (!isOpen) return null;

    return (
        <div className="modal">
            <div className="consultation-modal">
                <h2 className="consultation-modal__title">Запись на консультацию</h2>

                <p className="consultation-modal__client">
                    Клиент: {consultationData.PatientSurname} {consultationData.PatientName} {consultationData.PatientPatronymic ?? ""}, {GetFormatPhone(consultationData.PatientPhone)}
                </p>

                <button
                    className="consultation-modal__close"
                    onClick={onClose}
                >
                    X
                </button>

                <Select
                    isMulti
                    options={problems}
                    value={selectedOptions}
                    placeholder="Выберите одну или несколько проблем"
                    className="consultation-modal__select"
                    classNamePrefix="custom-select"
                    onChange={handleProblemChange}
                    isOptionDisabled={isOptionDisabled}
                    noOptionsMessage={() => "Нет доступных проблем"}
                />

                <Select
                    options={specialists}
                    value={selectedSpecialist}
                    placeholder="Выберите специалиста"
                    className="consultation-modal__select"
                    classNamePrefix="custom-select"
                    onChange={handleSpecialistChange}
                    noOptionsMessage={() => "Нет данных о специалистах"}
                />

                <p className="consultation-modal__subtitle">Выберите удобные дату и время в календаре ниже: </p>

                <RecordForm
                    specialist={selectedSpecialist}
                    onTimeDateSelect={onTimeDateSelect}
                    userId={consultationData.PatientUserId.toString()}
                />


                <div className="consultation-modal__other-problem">
                    <p className="consultation-modal__description">Если вы хотите уточнить детали - опишите это подробно в поле ниже:</p>
                    <textarea
                        name="other-problem"
                        id="other-problem"
                        className="consultation-modal__textarea"
                        placeholder="Подробное описание проблемы..."
                        value={otherProblemText}
                        onChange={(e) => setOtherProblemText(e.target.value)}
                    />
                </div>

                <ShowError msg={error} />

                <button
                    className="consultation-modal__submit"
                    onClick={handleSubmit}
                >
                    Сохранить
                </button>
            </div>
        </div>
    );
};

export default EditModal;