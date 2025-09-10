import { useState, useEffect } from 'react';
import './ArchiveConsultations.scss';
import RepeatModal from '../../../components/UI/Modals/RepeatModal/RepeatModal';
import type { ConsultationData } from '../../../components/UI/Modals/EditModal/EditModal';
import ConsultationService from '../../../services/ConsultationService';
import type { Consultation } from '../UpcomingConsultations/UpcomingConsultations';
import { API_URL } from '../../../http';
import type { AxiosError } from 'axios';
import type { TypeResponse } from '../../../models/response/DefaultResponse';
import RateModal from '../../../components/UI/Modals/RateModal/RateModal';
import { getDateLabel } from '../../../hooks/DateHooks';
import type { Role } from '../../../models/Auth';

interface ArchiveConsultationsProps {
    id?: string;
    mode?: Role;
}

const ArchiveConsultations: React.FC<ArchiveConsultationsProps> = ({ id = undefined, mode = "ADMIN" }) => {
    const [consultations, setConsultations] = useState<Consultation[]>([] as Consultation[]);
    const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);

    const [modalRepeat, setModalRepeat] = useState<boolean>(false);
    const [modalRate, setModalRate] = useState<boolean>(false);

    // Получение архивных консультаци
    const fetchConsultations = async () => {
        try {
            let response;
            if (mode === "DOCTOR") response = await ConsultationService.getAllConsultions(10, 1, { consultation_status: "ARCHIVE", doctorId: id });
            else if (mode === "PATIENT") response = await ConsultationService.getAllConsultions(2, 1, { consultation_status: "ARCHIVE", userId: id });
            else response = await ConsultationService.getAllConsultions(10, 1, { consultation_status: "ARCHIVE", userId: id });

            response && setConsultations(response.data.consultations);
        } catch (e) {
            const error = e as AxiosError<TypeResponse>;
            console.error('Ошибка при получение архивных консультации: ', error.response?.data.message)
        }
    }

    // Получение данных при открытии страницы
    useEffect(() => {
        fetchConsultations();
    }, [])

    // Завершение повтора консультации
    const handleRepeatConsultation = (data: ConsultationData) => {
        console.log("Данные для повтора консультации:", data);
        // const response = await ConsultationService.repeatAppoinment(data);
        // console.log(response.data);
        setModalRepeat(false);
    };

    // Завершение оценки консультации
    const handleRateConsultation = async (score: number, review: string, id: number) => {
        try {
            const response = await ConsultationService.rateAppointment(id, score, review);
            console.log(response.data);
        } catch (e) {
            const error = e as AxiosError<TypeResponse>;
            console.error("Ошибка при оценки консультации: ", error.response?.data.message);
        } finally {
            setModalRate(false);
        }
    }

    // Нажатие на кнопки карточек консультаций
    const handleClickButton = (data: Consultation, fun: (bool: boolean) => void) => {
        setSelectedConsultation(data);
        fun(true);
    }

    if (consultations.length === 0) return (
        <div className="consultation-card">
            <div
                style={{ textAlign: 'center' }}
                className="consultation-card__specialist"
            >
                Здесь будут находиться ваши посещенные консультации
            </div>
        </div>
    );

    return (
        <>
            <RepeatModal
                isOpen={modalRepeat}
                consultationData={selectedConsultation || {} as Consultation}
                onClose={() => setModalRepeat(false)}
                onRecord={handleRepeatConsultation}
            />

            <div className={`consultations__list ${mode === "PATIENT" && "consultations__archives"}`}>
                {consultations.map((consultation) => (
                    <div key={consultation.id} className="consultation-card">
                        <div className="consultation-card__time">
                            <span className="consultation-card__date">{getDateLabel(consultation.date)}</span>
                            <span className="consultation-card__hours">{consultation.durationTime}</span>
                        </div>

                        <div className="consultation-card__info">
                            {mode === "DOCTOR" ? (
                                <div className="consultation-card__specialist">
                                    Клиент: {(!consultation.PatientSurname && !consultation.PatientName && !consultation.PatientPatronymic)
                                        ? <span> Анонимный пользователь </span>
                                        : <span> {consultation.PatientSurname} {consultation.PatientName} {consultation.PatientPatronymic ?? ""} </span>
                                    }
                                </div>
                            ) : (
                                <div className="consultation-card__specialist">
                                    {"Специалист: "}
                                    <a target='_blank' href={`/profile/${consultation.DoctorUserId}`}>
                                        {consultation.DoctorSurname} {consultation.DoctorName} {consultation?.DoctorPatronymic}
                                    </a>
                                </div>
                            )}

                            {mode !== "PATIENT" && (
                                <>
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
                                        Симптомы подробно: <span>{consultation.other_problem ? consultation.other_problem : "Не указано"}</span>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="consultation-card__actions">
                            {mode === "PATIENT" && (
                                <>
                                    <RateModal
                                        isOpen={modalRate}
                                        consultationId={consultation.id}
                                        onClose={() => setModalRate(false)}
                                        onRecord={handleRateConsultation}
                                    />


                                    <button
                                        className="consultation-card__button consultation-card__button--rate"
                                        onClick={() => handleClickButton(consultation, setModalRate)}
                                    >
                                        Оценить
                                    </button>
                                </>
                            )}

                            {(mode === "PATIENT" || mode === "ADMIN") && (
                                <button
                                    className="consultation-card__button consultation-card__button--repeat"
                                    onClick={() => handleClickButton(consultation, setModalRepeat)}
                                >
                                    Повторить
                                </button>
                            )}

                            {mode !== "PATIENT" && (
                                <div className="consultation-card__recomendations">
                                    {`Рекомендации: `}
                                    {consultation.recommendations ? (
                                        <a href={`${API_URL}/${consultation.recommendations}`}>
                                            Файл
                                        </a>
                                    ) : (
                                        "Файл не приложен"
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="consultation-card__divider"></div>
                    </div>
                ))}
            </div>
        </>
    );
};

export default ArchiveConsultations;