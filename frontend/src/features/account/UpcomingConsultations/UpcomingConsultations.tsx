import { useEffect, useState } from 'react';
import './UpcomingConsultations.scss';
import ShiftModal from '../../../components/UI/Modals/ShiftModal/ShiftModal';
import CancelModal from '../../../components/UI/Modals/CancelModal/CancelModal';
import RepeatModal from '../../../components/UI/Modals/RepeatModal/RepeatModal';
import EditModal, { type ConsultationData } from '../../../components/UI/Modals/EditModal/EditModal';
import ConsultationService from '../../../services/ConsultationService';

interface UserConsultationsProps {
    id: string | undefined;
}

export interface Consultation {
    id: number;
    durationTime: string;
    date: string;
    DoctorId: number;
    DoctorName: string;
    DoctorSurname: string;
    DoctorPatronymic?: string;
    PatientName: string;
    PatientSurname: string;
    PatientPatronymic?: string;
    Problems: string[];
    score?: number;
    comment?: string;
    reason_cancel?: string;
    recommendations?: string;
    other_problem?: string;
}

const UserConsultations: React.FC<UserConsultationsProps> = ({ id = "" }) => {
    const [modalShift, setModalShift] = useState<boolean>(false);
    const [modalCancel, setModalCancel] = useState<boolean>(false);
    const [modalRepeat, setModalRepeat] = useState<boolean>(false);
    const [modalEdit, setModalEdit] = useState<boolean>(false);
    const [consultations, setConsultations] = useState<Consultation[]>([] as Consultation[])

    const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);

    const fetchConsultations = async () => {
        const response = await ConsultationService.getAllConsultions(10, 1, { consultation_status: "UPCOMING", userId: id });
        setConsultations(response.data.consultations);
    }

    useEffect(() => {
        fetchConsultations();
    }, [])

    const handleShiftConsultation = (data: ConsultationData) => {
        console.log("Данные для переноса:", data);
        // Здесь логика отправки данных на сервер
        setModalShift(false);
    };

    const clickShiftConsultation = (consultation: Consultation) => {
        setSelectedConsultation(consultation);
        setModalShift(true);
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

    return (
        <div className="user-consultations">
            <ShiftModal
                isOpen={modalShift}
                consultationData={selectedConsultation || {} as Consultation}
                onClose={() => setModalShift(false)}
                onRecord={handleShiftConsultation}
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
                    id: {consultation.id} {/*  Отладочная печать */}
                    <div className="consultation-card__time">
                        <span className="consultation-card__date">{consultation.date}</span>
                        <span className="consultation-card__hours">{consultation.durationTime}</span>
                    </div>

                    <div className="consultation-card__info">
                        <div className="consultation-card__specialist">
                            Специалист: <span>{consultation.DoctorSurname} {consultation.DoctorName} {consultation?.DoctorPatronymic}</span>
                        </div>

                        <div className="consultation-card__symptoms">
                            {'Симптомы: '}
                            {consultation.Problems.map((p, i) => (
                                <span key={i}>
                                    {p.toLocaleLowerCase()}
                                    {i < consultation.Problems.length - 1 ? ', ' : '.'}
                                </span>
                            ))}
                        </div>

                        <div className="consultation-card__details">
                            Симптомы подробно: <span>{consultation.other_problem ? consultation?.other_problem : "Не указано"}</span>
                        </div>
                    </div>

                    <div className="consultation-card__actions">
                        <button
                            className="consultation-card__button consultation-card__button--transfer"
                            onClick={() => clickShiftConsultation(consultation)}
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