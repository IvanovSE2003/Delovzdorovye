import { useEffect, useState } from 'react';
import type { ModalProps } from '../CancelModal/CancelModal';
import RecordForm from '../RecordModal/RecordForm';
import type { Role } from '../../../../models/Auth';
import { formatDateWithoutYear } from '../../../../helpers/formatDate';
import type { ConsultationData } from '../../../../models/consultations/ConsultationData';
import ShowError from '../../ShowError/ShowError';
import ModalHeader from '../ModalHeader/ModalHeader';
import './RepeatModal.scss';
import '../ShiftModal/ShiftModal.scss';
import { GetFormatPhone } from '../../../../helpers/formatPhone';

interface RepeatModalProps extends ModalProps {
    onRecord: (data: ConsultationData) => void;
    mode?: Role;
}

const RepeatModal: React.FC<RepeatModalProps> = ({ isOpen, onClose, onRecord, consultationData, mode }) => {
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [descriptionProblem, setDescriptionProblem] = useState<string>("");
    const [error, setError] = useState<{ id: number; message: string }>({ id: 0, message: "" })

    const handleSubmit = () => {
        if (!selectedDate || !selectedTime) {
            setError({ id: Date.now(), message: "Пожалуйста, выберите дату и время" });
            return;
        }

        onRecord({
            date: selectedDate,
            time: selectedTime,
            descriptionProblem,
            id: consultationData.id,
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
            setSelectedDate(null);
            setSelectedTime(null);
            setError({ id: Date.now(), message: "" });
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="modal">
            <div className='shift-modal consultation-modal'>
                <ModalHeader title="Повтор консультации" onClose={onClose} />

                <div className="shift-modal__information">
                    <p>Вы повторяете консультацию у специалиста: </p>
                    <p>{consultationData.DoctorSurname} {consultationData.DoctorName} {consultationData?.DoctorPatronymic}</p>
                </div>

                {mode === "ADMIN" && (
                    <div className="shift-modal__client">
                        Клиент: {(!consultationData.PatientSurname && !consultationData.PatientName && !consultationData.PatientPatronymic)
                            ? <span>Анонимный пользователь</span>
                            : <span>
                                {consultationData.PatientSurname} {consultationData.PatientName} {consultationData.PatientPatronymic ?? ""}, {GetFormatPhone(consultationData.PatientPhone)}
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

                <textarea
                    name="descriptionProblem"
                    id="descriptionProblem"
                    className="consultation-modal__textarea"
                    placeholder='Если хотите можете написать подробности проблемы'
                    value={descriptionProblem}
                    onChange={(e) => setDescriptionProblem(e.target.value)}
                />

                <div className="shift-modal__result">
                    <p className="shift-modal__selected-time">
                        Вы выбрали: {selectedDate && selectedTime ? <>{formatDateWithoutYear(selectedDate)}, {selectedTime} </> : "не выбрано"}
                    </p>
                </div>

                <ShowError msg={error} />

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