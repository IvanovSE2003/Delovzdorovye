import { useEffect, useState } from 'react';
import './UpcomingConsultations.scss';
import ShiftModal from '../../../components/UI/Modals/ShiftModal/ShiftModal';
import CancelModal from '../../../components/UI/Modals/CancelModal/CancelModal';
import RepeatModal from '../../../components/UI/Modals/RepeatModal/RepeatModal';
import EditModal, { type ConsultationData } from '../../../components/UI/Modals/EditModal/EditModal';
import type { IUserDataProfile } from '../../../models/Auth';
import ConsultationService from '../../../services/ConsultationService';

interface UserConsultationsProps {
    id: string | undefined;
    profile: IUserDataProfile;
}

interface Consultation {
    id: number;
    date: string;
    time: string;
    specialist: string;
    symptoms: string;
    details: string;
}

const UserConsultations: React.FC<UserConsultationsProps> = ({ id = "", profile }) => {
    const [modalShift, setModalShift] = useState<boolean>(false);
    const [modalCancel, setModalCancel] = useState<boolean>(false);
    const [modalRepeat, setModalRepeat] = useState<boolean>(false);
    const [modalEdit, setModalEdit] = useState<boolean>(false);

    const fetchConsultations = async () => {
        const response = await ConsultationService.getAllConsultions(10, 1, { consultation_status: "UPCOMING" })
        console.log(response.data.consultations[0]);
    }

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

    const handleRepeatConsultation = (data: ConsultationData) => {
        console.log("Данные для записи:", data);
        // Здесь логика отправки данных на сервер
        setModalRepeat(false);
    };

    const handleEditConsultation = (data: ConsultationData) => {
        console.log("Данные для записи:", data);
        setModalEdit(false);
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
                profileData={profile}
            />

            <CancelModal
                isOpen={modalCancel}
                onClose={() => setModalCancel(false)}
                onRecord={handleCancelConsultation}
            />

            <RepeatModal
                isOpen={modalRepeat}
                onClose={() => setModalRepeat(false)}
                onRecord={handleRepeatConsultation}
            />

            <EditModal
                // Надо получать еще уже готовые данные для карточки
                isOpen={modalEdit}
                onClose={() => setModalEdit(false)}
                onRecord={handleEditConsultation}
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
                        <button
                            className="consultation-card__button consultation-card__button--repeat"
                            onClick={() => setModalRepeat(true)}
                        >
                            Повторить
                        </button>
                        <button
                            // Надо полчить еще уже готовые данные
                            className="consultation-card__button consultation-card__button--edit"
                            onClick={() => setModalEdit(true)}
                        >
                            Редактировать
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default UserConsultations;