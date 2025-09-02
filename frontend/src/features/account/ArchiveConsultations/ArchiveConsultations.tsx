import { useState, useEffect } from 'react';
import './ArchiveConsultations.scss';
import RepeatModal from '../../../components/UI/Modals/RepeatModal/RepeatModal';
import type { ConsultationData } from '../../../components/UI/Modals/EditModal/EditModal';
import ConsultationService from '../../../services/ConsultationService';
import type { Consultation } from '../UpcomingConsultations/UpcomingConsultations';
import { API_URL } from '../../../http';


const ArchiveConsultations: React.FC = () => {
    const [consultations, setConsultations] = useState<Consultation[]>([] as Consultation[]);
    const [modalRepeat, setModalRepeat] = useState<boolean>(false);

    const fetchConsultations = async () => {
        const response = await ConsultationService.getAllConsultions(10, 1, { consultation_status: "ARCHIVE" })
    }

    useEffect(() => {
        fetchConsultations();
    }, [])


    const handleDownloadRecommendation = (fileUrl: string) => {
        // Логика скачивания файла рекомендации
        window.open(fileUrl, '_blank');
    };

    const handleRepeatConsultation = (data: ConsultationData) => {
        console.log("Данные для записи:", data);
        // Здесь логика отправки данных на сервер
        setModalRepeat(false);
    };

    return (
        <div className="archive-consultations">
            <RepeatModal
                isOpen={modalRepeat}
                onClose={() => setModalRepeat(false)}
                onRecord={handleRepeatConsultation}
            />


            <h2 className="archive-consultations__title">Архив консультаций</h2>

            {consultations.length === 0 ? (
                <div className="archive-consultations__empty">Нет архивных консультаций</div>
            ) : (
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
                                <button
                                    className="archive-consultation-card__button"
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
            )}
        </div>
    );
};

export default ArchiveConsultations;