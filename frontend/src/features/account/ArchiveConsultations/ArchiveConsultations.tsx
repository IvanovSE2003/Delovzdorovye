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

interface ArchiveConsultationsProps {
    id?: string;
    mode?: "ADMIN" | "PATIENT";
}

const ArchiveConsultations: React.FC<ArchiveConsultationsProps> = ({ id = undefined, mode = "ADMIN" }) => {
    const [consultations, setConsultations] = useState<Consultation[]>([] as Consultation[]);
    const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);

    const [modalRepeat, setModalRepeat] = useState<boolean>(false);
    const [modalRate, setModalRate] = useState<boolean>(false);

    // Получение архивных консультаци
    const fetchConsultations = async () => {
        try {
            const response = await ConsultationService.getAllConsultions(10, 1, { consultation_status: "ARCHIVE", userId: id })
            setConsultations(response.data.consultations);
            console.log(response.data)
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
    const handleRateConsultation = (score: number, review: string, id: number) => {
        console.log(`Оценка для консультации: ${id}: `, score);
        console.log(`Отзыв для консультации: ${id}: `, review);
        // const response = await ConsultationService.rateAppoinment(data);
        // console.log(response.data);
        setModalRate(false);
    }

    // Нажатие на кнопки карточек консультаций
    const handleClickButton = (data: Consultation, fun: (bool: boolean) => void) => {
        setSelectedConsultation(data);
        fun(true);
    }

    if (consultations.length === 0) return <div className="archive-consultations__empty">Нет архивных консультаций</div>;

    return (
        <>
            <RepeatModal
                isOpen={modalRepeat}
                consultationData={selectedConsultation || {} as Consultation}
                onClose={() => setModalRepeat(false)}
                onRecord={handleRepeatConsultation}
            />

            <div className="archive-consultations__list">
                {consultations.map((consultation) => (
                    <div key={consultation.id} className="archive-consultation-card">
                        <div className="archive-consultation-card__time">
                            <span className="archive-consultation-card__date">{consultation.date}</span>
                            <span className="archive-consultation-card__hours">{consultation.durationTime}</span>
                        </div>

                        <div className="archive-consultation-card__info">
                            <div className="archive-consultation-card__specialist">
                                Специалист: <span>{consultation.DoctorSurname} {consultation.DoctorName} {consultation?.DoctorPatronymic}</span>
                            </div>

                            <div className="archive-consultation-card__symptoms">
                                Симптомы: <span>{consultation.Problems}</span>
                            </div>

                            <div className="archive-consultation-card__details">
                                Симптомы подробно: <span>{consultation.other_problem ? consultation.other_problem : "Не указано"}</span>
                            </div>
                        </div>

                        <div className="archive-consultation-card__actions">
                            {mode === "PATIENT" && (
                                <>
                                    <RateModal
                                        isOpen={modalRate}
                                        onClose={() => handleClickButton(consultation, setModalRate)}
                                        onRecord={handleRateConsultation}
                                    />


                                    <button
                                        className="archive-consultation-card__button arhive-consultation-card__button--rate"
                                        onClick={() => handleClickButton(consultation, setModalRepeat)}
                                    >
                                        Оценить
                                    </button>
                                </>
                            )}

                            <button
                                className="archive-consultation-card__button arhive-consultation-card__button--repeat"
                                onClick={() => setModalRepeat(true)}
                            >
                                Повторить
                            </button>

                            <div className="archive-consultation-card__recomendations">
                                {`Рекомендации: `}
                                {consultation.recommendations ? (
                                    <a href={`${API_URL}/${consultation.recommendations}`}>
                                        Файл
                                    </a>
                                ) : (
                                    "Файл не приложен"
                                )}
                            </div>
                        </div>

                        <div className="archive-consultation-card__divider"></div>
                    </div>
                ))}
            </div>
        </>
    );
};

export default ArchiveConsultations;