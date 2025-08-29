import { useEffect, useState } from 'react';
import './UpcomingConsultations.scss';
import BatchService from '../../../services/BatchService';
import ShiftModal from '../../../components/UI/Modals/ShiftModal/ShiftModal';
import type { ConsultationData } from '../../../components/UI/Modals/RecordModal/RecordModal';
import CancelModal from '../../../components/UI/Modals/CancelModal/CancelModal';

interface UserConsultationsProps {
    id: string | undefined;
}

interface Consultation {
    id: number;
    date: string;
    time: string;
    specialist: string;
    symptoms: string;
    details: string;
}

const UserConsultations: React.FC<UserConsultationsProps> = ({ id = "" }) => {
    const fetchConsultations = () => {
        // const response = BatchService.getAllConsultions(id);
        // console.log(response);
    }
    const [modalShift, setModalShift] = useState<boolean>(false);
    const [modalCancel, setModalCancel] = useState<boolean>(false);

    useEffect(() => {
        fetchConsultations();
    }, [])

    const handleShiftConsultation = (data: ConsultationData) => {
        console.log("Данные для записи:", data);
        // Здесь логика отправки данных на сервер
        setModalShift(false);
    };

    const handleCancelConsultation = (reason: string) => {
        console.log("Данные для записи:", reason);
        // Здесь логика отправки данных на сервер
        setModalCancel(false);
    };

    const consultations: Consultation[] = [
        {
            id: 1,
            date: 'Завтра',
            time: '15:30-16:30',
            specialist: 'Анна Петрова',
            symptoms: 'Головная боль',
            details: 'Периодические головные боли в течение последних двух недель, усиливаются к вечеру'
        },
    ];

    return (
        <div className="user-consultations">
            <ShiftModal
                isOpen={modalShift}
                onClose={() => setModalShift(false)}
                onRecord={handleShiftConsultation}
            />

            <CancelModal
                isOpen={modalCancel}
                onClose={() => setModalCancel(false)}
                onRecord={handleCancelConsultation}
            />

            <h2 className='user-consultations__title'>Предстоящие консультации</h2>

            {consultations.map(consultation => (
                <div key={consultation.id} className="consultation-card">
                    <div className="consultation-card__time">
                        <span className="consultation-card__date">{consultation.date}</span>
                        <span className="consultation-card__hours">{consultation.time}</span>
                    </div>

                    <div className="consultation-card__info">
                        <div className="consultation-card__specialist">
                            Специалист: <span>{consultation.specialist}</span>
                        </div>

                        <div className="consultation-card__symptoms">
                            Симптомы: <span>{consultation.symptoms}</span>
                        </div>

                        <div className="consultation-card__details">
                            Симптомы подробно: <span>{consultation.details}</span>
                        </div>
                    </div>

                    <div className="consultation-card__actions">
                        <button
                            className="consultation-card__button consultation-card__button--transfer"
                            onClick={() => setModalShift(true)}
                        >
                            Перенести
                        </button>
                        <button
                            className="consultation-card__button consultation-card__button--cancel"
                            onClick={() => setModalCancel(true)}
                        >
                            Отменить
                        </button>
                        <button className="consultation-card__button consultation-card__button--repeat">
                            Повторить
                        </button>
                        <button className="consultation-card__button consultation-card__button--edit">
                            Редактировать
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default UserConsultations;