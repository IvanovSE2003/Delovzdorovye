import { useEffect, useState } from 'react';
import type { ModalProps } from '../CancelModal/CancelModal';
import dayjs from "dayjs";

import RecordForm from '../RecordModal/RecordForm';
import './ShiftModal.scss'
import type { Role } from '../../../../models/Auth';
import type { ConsultationData } from '../../../../models/consultations/ConsultationData';
import { formatDateWithoutYear } from '../../../../helpers/formatDate';
import type { Consultation } from '../../../../models/consultations/Consultation';
import ModalHeader from '../ModalHeader/ModalHeader';
import { GetFormatPhone } from '../../../../helpers/formatPhone';

interface ShiftModalProps extends ModalProps {
    onRecord: (data: ConsultationData) => void;
    mode: Role;
}

const normalizeTime = (t: string) => {
    const m = t.match(/(\d{1,2}):(\d{2})/);
    if (!m) return t;
    const hh = m[1].padStart(2, "0");
    const mm = m[2];
    return `${hh}:${mm}`;
};

const getStartFromRange = (range: string) => {
    const start = range.split(/[–—-]/)[0]?.trim() ?? "";
    return normalizeTime(start);
};

const ShiftModal: React.FC<ShiftModalProps> = ({ isOpen, onClose, onRecord, consultationData = {} as Consultation, mode }) => {
    const [error, setError] = useState<string>("");
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    // Перенести консультацию
    const handleSubmit = () => {
        if (!selectedDate || !selectedTime) {
            setError("Пожалуйста, выберите дату и время");
            return;
        }

        const sameDay = dayjs(consultationData.date).isSame(dayjs(selectedDate), "day");
        const currentStart = getStartFromRange(consultationData.durationTime);
        const newStart = normalizeTime(selectedTime);

        if (sameDay && currentStart === newStart) {
            setError("Вы выбрали то же самое время, выберите другое");
            return;
        }

        onRecord({
            id: consultationData.id,
            date: selectedDate,
            time: selectedTime,
            userId: consultationData.PatientUserId,
            doctorId: consultationData.DoctorId,
        });

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

    if (!isOpen) return;

    return (
        <div className="modal">
            <div className='shift-modal consultation-modal'>

                <ModalHeader title="Перенос консультации" onClose={onClose} />

                <div className="shift-modal__information">
                    <p>Вы переносите консультацию: {formatDateWithoutYear(consultationData.date)}, {consultationData.durationTime}</p>
                </div>


                {mode === "ADMIN" && (
                    <div className="shift-modal__client">
                        <p className="consultation-modal__client">
                            Клиент: {(!consultationData.PatientSurname && !consultationData.PatientName && !consultationData.PatientPatronymic)
                                ? 
                                <span>Анонимный пользователь</span>
                                : 
                                <span>
                                    {consultationData.PatientSurname} {consultationData.PatientName} {consultationData.PatientPatronymic ?? ""}, {GetFormatPhone(consultationData.PatientPhone)}
                                </span>
                            }
                        </p>
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
                        <strong>Вы выбрали: </strong> {selectedDate && selectedTime ? `${formatDateWithoutYear(selectedDate)}, ${selectedTime}` : "не выбрано"}
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
                    disabled={!selectedDate || !selectedTime}
                    title={!selectedDate || !selectedTime ? "Выберите дату и время" : "Перенести"}
                >
                    Перенести
                </button>
            </div>
        </div>
    )
}

export default ShiftModal;