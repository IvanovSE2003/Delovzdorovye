import { useState, useEffect } from "react";
import Select, { type MultiValue } from 'react-select';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ru } from "date-fns/locale";
import ConsultationsStore, { type OptionsResponse } from "../../../../store/consultations-store";
import './EditModal.scss';
interface ConsultationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRecord: (data: ConsultationData) => void;
}

export interface ConsultationData {
    id?: number;
    userId?: number;
    problems?: number[];
    otherProblem?: string;
    descriptionProblem?: string;
    date: Date | string | undefined;
    time: string | null;
    doctorId?: number;
}

const EditModal: React.FC<ConsultationModalProps> = ({ isOpen, onClose, onRecord }) => {
    const consultationStore = new ConsultationsStore();
    const [otherProblemText, setOtherProblemText] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date>();

    const [problems, setProblems] = useState<OptionsResponse[]>([]);
    const [specialists, setSpecialists] = useState<OptionsResponse[]>([]);

    const [selectedOptions, setSelectedOptions] = useState<MultiValue<OptionsResponse>>([]);

    const getProblems = async () => {
        const data = await consultationStore.getProblems();
        setProblems(data);
    }

    const getSpecialists = async () => {
        // const data = await consultationStore.findSpecialists();
        // setSpecialists(data);
    }

    useEffect(() => {
        getProblems();
        getSpecialists();
    }, []);

    const times = [
        "09:00", "09:30", "10:00", "10:30",
        "12:00", "12:30", "13:00", "13:30",
        "15:00", "16:00", "18:00", "19:30"
    ];

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

        const numericValues = selectedArray.map(option => option.value);
        // const data = await consultationStore.findDays(numericValues);
        // console.log("Ответ: ", data);
        // setShowOtherProblemInput(hasOtherProblem);
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

    useEffect(() => {
        if (!isOpen) {
            // Сброс формы при закрытии
            setSelectedOptions([]);
            setOtherProblemText("");
            // setShowOtherProblemInput(false);
            setSelectedDate(undefined);
            setSelectedTime(null);
            setError("");
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="modal">
            <div className="consultation-modal">
                <h2 className="consultation-modal__title">Запись на консультацию</h2>

                <p className="consultation-modal__client">
                    Клиент: Иванова Мария Петровна, 8 888 888 88 88
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
                    className="consultation-modal__select-problems"
                    classNamePrefix="custom-select"
                    onChange={handleProblemChange}
                    isOptionDisabled={isOptionDisabled}
                />

                <Select
                    options={specialists}
                    // value={'value'}
                    placeholder="Выберите специалиста"
                    className="consultation-modal__select-problems"
                    classNamePrefix="custom-select"
                    onChange={() => { }}
                    isClearable={true}
                />

                <p className="consultation-modal__subtitle">Выберите удобные дату и время в календаре ниже: </p>

                <div className="consultation-modal__date-time">
                    <div className="consultation-modal__calendar">
                        <DatePicker
                            selected={selectedDate}
                            onChange={(date: Date | null) => {
                                setSelectedDate(date || new Date());
                            }}
                            inline
                            locale={ru}
                            dateFormat="dd.MM.yyyy"
                            minDate={new Date()}
                            todayButton="Сегодня"
                            popperClassName="large-datepicker"
                            calendarClassName="large-datepicker"
                        />
                    </div>

                    <div className="consultation-modal__time">
                        {/* <TimeSlots times={times} onSelect={setSelectedTime} /> */}
                        <p className="consultation-modal__selected-time">
                            Вы выбрали: {selectedTime || "не выбрано"}
                        </p>
                    </div>
                </div>

                <div className="consultation-modal__other-problem">
                    <label className="consultation-modal__label" htmlFor="otherProblem">
                        Подробная информация о проблеме:
                    </label>
                    <textarea
                        id="otherProblem"
                        className="consultation-modal__textarea"
                        value={otherProblemText}
                        onChange={(e) => setOtherProblemText(e.target.value)}
                        placeholder="Подробно опишите вашу проблему..."
                        rows={4}
                    />
                </div>

                {error && (
                    <div className="consultation-modal__error">{error}</div>
                )}

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