import { useEffect, useState } from 'react';
import type { ConsultationData } from '../EditModal/EditModal';
import type { Consultation } from '../../../../features/account/UpcomingConsultations/UpcomingConsultations';

import RecordForm from '../RecordModal/RecordForm';
import './ShiftModal.scss'

interface ShiftModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRecord: (data: ConsultationData) => void;
    consultationData: Consultation;
}

const ShiftModal: React.FC<ShiftModalProps> = ({ isOpen, onClose, onRecord, consultationData = {} as Consultation, }) => {
    const [error, setError] = useState<string>("");
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    // Перенести консультацию
    const handleSubmit = () => {
        if (!selectedDate || !selectedTime) {
            setError("Пожалуйста, выберите дату и время");
            return;
        }

        onRecord({
            id: consultationData.id,
            date: selectedDate,
            time: selectedTime
        });

        // Сброс формы
        setSelectedDate(null);
        setSelectedTime(null);
        setError("");
    };

    // Передача данные с RecordForm
    const onTimeDateSelect = (time: string | null, date: string | null) => {
        setSelectedTime(time);
        setSelectedDate(date);
    }

    // Сброс формы при закрытии
    useEffect(() => {
        if (!isOpen) {
            setSelectedDate(null);
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
                    <p>Вы переносите консультацию: {consultationData.date}, {consultationData.durationTime}</p>
                </div>


                <div className="shift-modal__client">
                    <p className="consultation-modal__client">
                        Клиент: {consultationData.PatientName} {consultationData.PatientSurname} {consultationData?.PatientPatronymic}
                    </p>
                </div>

                <RecordForm
                    onTimeDateSelect={onTimeDateSelect}
                    specialist={{
                        // value: consultationData.DoctorId,
                        value: 2,
                        label: `${consultationData.DoctorSurname} ${consultationData.DoctorName} ${consultationData?.DoctorPatronymic || ""}`
                    }}
                />

                <div className="shift-modal__result">
                    <p className="shift-modal__selected-time">
                        <strong>Вы выбрали: </strong> {selectedDate && selectedTime ? `${selectedTime}, ${new Date(selectedDate).toLocaleDateString()}` : "не выбрано"}
                    </p>
                    <p className='shift-modal__selected-specialist'>
                        <strong>Специалист: </strong> {consultationData.DoctorSurname} {consultationData.DoctorName} {consultationData?.DoctorPatronymic}
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