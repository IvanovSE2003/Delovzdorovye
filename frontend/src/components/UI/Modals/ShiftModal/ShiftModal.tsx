import DatePicker from 'react-datepicker';
import './ShiftModal.scss'
import TimeSlots from '../../../../features/account/TimeSlots/TimeSlots';
import { useEffect, useState } from 'react';
import ConsultationsStore, { type OptionsResponse } from '../../../../store/consultations-store';
import { ru } from 'date-fns/locale';
import type { MultiValue } from 'react-select';
import type { ConsultationData } from '../RecordModal/RecordModal';

interface ShiftModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRecord: (data: ConsultationData) => void;
}


const ShiftModal: React.FC<ShiftModalProps> = ({ isOpen, onClose, onRecord }) => {
    const consultationStore = new ConsultationsStore();
    const [otherProblemText, setOtherProblemText] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date>();
    const [selectedOptions, setSelectedOptions] = useState<MultiValue<OptionsResponse>>([]);

    const times = [
        "09:00", "09:30", "10:00", "10:30",
        "12:00", "12:30", "13:00", "13:30",
        "15:00", "16:00", "18:00", "19:30"
    ];

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
            otherProblemText: otherProblemText,
            date: selectedDate,
            time: selectedTime
        });

        // Сброс формы
        setSelectedOptions([]);
        setOtherProblemText("");
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
            <div className='shift-modal consultation-modal'>
            <h2 className="consultation-modal__title">Перенос консультации</h2>

            <button
                className="consultation-modal__close"
                onClick={onClose}
            >
                X
            </button>

            <div className="shift-modal__information">
                <p>Вы переносите консультацию: 4 августа, 15:30</p>
            </div>


            <div className="shift-modal__client">Клиент: Иванова Мария Петровна, 8 888 888 88 88</div>

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
                    <TimeSlots times={times} onSelect={setSelectedTime} />
                </div>
            </div>

            <div className="shift-modal__result">
                <p className="shift-modal__selected-time">
                    Вы выбрали: {selectedTime || "не выбрано"}
                </p>
                <p className='shift-modal__selected-specialist'>
                    <strong>Специалист: </strong> Анна Петрова
                </p>
            </div>

            {error && (
                <div className="consultation-modal__error">{error}</div>
            )}

            <button
                className="shift-modal__submit"
                onClick={handleSubmit}
            >
                Перенести
            </button>
        </div>
        </div>
    )
}

export default ShiftModal;