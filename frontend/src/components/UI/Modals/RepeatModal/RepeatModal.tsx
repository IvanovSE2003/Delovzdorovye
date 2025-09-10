import { useEffect, useState } from 'react';
import type { ModalProps } from '../CancelModal/CancelModal';
import type { ConsultationData } from '../EditModal/EditModal';

import RecordForm from '../RecordModal/RecordForm';
import './RepeatModal.scss';
import type { Role } from '../../../../models/Auth';
import { formatDateWithoutYear } from '../../../../hooks/DateHooks';

interface RepeatModalProps extends ModalProps {
    onRecord: (data: ConsultationData) => void;
    mode?: Role;
}

const RepeatModal: React.FC<RepeatModalProps> = ({ isOpen, onClose, onRecord, consultationData, mode }) => {
    const [error, setError] = useState<string>("");
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [doctorId, setDoctorId] = useState<number|undefined>(undefined);

    const handleSubmit = () => {
        if (!selectedDate || !selectedTime) {
            setError("Пожалуйста, выберите дату и время");
            return;
        }

        onRecord({
            date: selectedDate,
            time: selectedTime,
            doctorId: doctorId,
        });
    };

    // Получение даты и времени из 
    const onTimeDateSelect = (time: string | null, date: string | null, doctorId: number | undefined) => {
        setSelectedTime(time);
        setSelectedDate(date);
        setDoctorId(doctorId);
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

                {mode === "ADMIN" && (
                    <div className="shift-modal__client">
                        Клиент: {(!consultationData.PatientSurname && !consultationData.PatientName && !consultationData.PatientPatronymic)
                            ? <span>Анонимный пользователь</span>
                            : <span>
                                {consultationData.PatientSurname} {consultationData.PatientName} {consultationData.PatientPatronymic ?? ""}, {consultationData.PatientPhone}
                            </span>
                        }
                    </div>
                )}


                <RecordForm
                    onTimeDateSelect={onTimeDateSelect}
                    specialist={{
                        value: consultationData.DoctorId,
                        label: `${consultationData.DoctorSurname} ${consultationData.DoctorName} ${consultationData?.DoctorPatronymic || ""}`
                    }}
                    userId={consultationData.PatientUserId.toString()}
                />

                <div className="shift-modal__result">
                    <p className="shift-modal__selected-time">
                        Вы выбрали: {selectedDate && selectedTime ? <>{formatDateWithoutYear(selectedDate)}, {selectedTime} </> : "не выбрано"}
                    </p>
                </div>

                {error && (
                    <div className="consultation-modal__error">{error}</div>
                )}

                <button
                    className="shift-modal__submit"
                    onClick={handleSubmit}
                    disabled={!selectedDate || !selectedTime}
                >
                    Повторить
                </button>
            </div>
        </div>
    )
}

export default RepeatModal;