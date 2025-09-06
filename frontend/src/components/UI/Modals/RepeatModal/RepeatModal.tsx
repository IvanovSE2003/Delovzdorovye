import { useEffect, useState } from 'react';
import { type OptionsResponse } from '../../../../store/consultations-store';
import type { MultiValue } from 'react-select';
import type { ModalProps } from '../CancelModal/CancelModal';
import type { ConsultationData } from '../EditModal/EditModal';

import RecordForm from '../RecordModal/RecordForm';
import './RepeatModal.scss';

interface RepeatModalProps extends ModalProps {
    onRecord: (data: ConsultationData) => void;
}

const RepeatModal: React.FC<RepeatModalProps> = ({ isOpen, onClose, onRecord, consultationData }) => {
    const [error, setError] = useState<string>("");
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    const handleSubmit = () => {
        if (!selectedDate || !selectedTime) {
            setError("Пожалуйста, выберите дату и время");
            return;
        }

        onRecord({
            date: selectedDate,
            time: selectedTime,
            doctorId: 0
        });
    };

    // Получение даты и времени из 
    const onTimeDateSelect = (time: string | null, date: string | null) => {
        setSelectedTime(time);
        setSelectedDate(date);
    }

    // Сброс формы при закрытии
    useEffect(() => {
        if (!isOpen) {
            setError("");
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="modal">
            <div className='shift-modal consultation-modal'>
                <h2 className="consultation-modal__title">Повтор консультации</h2>

                <button
                    className="consultation-modal__close"
                    onClick={onClose}
                >
                    X
                </button>

                <div className="shift-modal__information">
                    <p>Вы повторяете консультацию у специалиста: </p>
                    <p>{consultationData.DoctorSurname} {consultationData.DoctorName} {consultationData?.DoctorPatronymic}</p>
                </div>


                <div className="shift-modal__client">
                    Клиент: {consultationData.PatientSurname} {consultationData.PatientName} {consultationData.PatientPatronymic}, {consultationData.PatientPhone}
                </div>

                <RecordForm
                    onTimeDateSelect={onTimeDateSelect}
                    specialist={{
                        value: consultationData.DoctorId,
                        label: `${consultationData.DoctorSurname} ${consultationData.DoctorName} ${consultationData?.DoctorPatronymic || ""}`
                    }}
                />

                <div className="shift-modal__result">
                    <p className="shift-modal__selected-time">
                        Вы выбрали: {selectedDate && selectedTime ? <>{selectedDate} {selectedTime} </> : "не выбрано"}
                    </p>
                </div>

                {error && (
                    <div className="consultation-modal__error">{error}</div>
                )}

                <button
                    className="shift-modal__submit"
                    onClick={handleSubmit}
                >
                    Повторить
                </button>
            </div>
        </div>
    )
}

export default RepeatModal;