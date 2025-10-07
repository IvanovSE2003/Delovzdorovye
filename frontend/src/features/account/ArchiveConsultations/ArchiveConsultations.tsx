import { useState, useEffect } from 'react';
import './ArchiveConsultations.scss';
import RepeatModal from '../../../components/UI/Modals/RepeatModal/RepeatModal';
import RateModal from '../../../components/UI/Modals/RateModal/RateModal';
import ConsultationService from '../../../services/ConsultationService';
import { API_URL } from '../../../http';
import type { AxiosError } from 'axios';
import type { TypeResponse } from '../../../models/response/DefaultResponse';
import type { Role } from '../../../models/Auth';
import Pagination from '../../../components/UI/Pagination/Pagination';
import { processError } from '../../../helpers/processError';
import { getDateLabel } from '../../../helpers/formatDatePhone';
import type { Consultation } from '../../../models/consultations/Consultation';
import type { ConsultationData } from '../../../models/consultations/ConsultationData';

interface ArchiveConsultationsProps {
    userId?: number;
    mode?: Role;
}

const ArchiveConsultations: React.FC<ArchiveConsultationsProps> = ({ userId, mode = "ADMIN" }) => {
    const [consultations, setConsultations] = useState<Consultation[]>([]);
    const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
    const [modalRepeat, setModalRepeat] = useState(false);
    const [modalRate, setModalRate] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isVisible, setIsVisible] = useState(true);

    const limit = mode === "PATIENT" ? 2 : 4;

    const fetchConsultations = async (pageNumber = 1) => {
        try {
            const filters: any = { consultation_status: "ARCHIVE" };

            if (mode === "DOCTOR") filters.doctorUserId = userId;
            else filters.userId = userId;

            const response = await ConsultationService.getAllConsultations(limit, pageNumber, filters);
            setConsultations(response.data.consultations || []);
            setTotalPages(response.data.totalPages);
            setPage(pageNumber);
        } catch (e) {
            processError(e, "Ошибка при получении архивных консультаций");
        } finally {
            setIsVisible(true);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setIsVisible(false);
            await new Promise(resolve => setTimeout(resolve, 150));
            await fetchConsultations(page);
        };
        loadData();
    }, [page]);

    // Обработчик изменения страницы
    const handlePageChange = (newPage: number) => {
        setIsVisible(false);
        setTimeout(() => {
            setPage(newPage);
        }, 150);
    };

    const handleRepeatConsultation = async (data: ConsultationData) => {
        try {
            await ConsultationService.repeatAppointment(data);
        } catch (e) {
            const error = e as AxiosError<TypeResponse>;
            console.error("Ошибка при повторе консультации:", error.response?.data.message);
        } finally {
            setModalRepeat(false);
        }
    };

    const handleRateConsultation = async (score: number, review: string, id: number) => {
        try {
            await ConsultationService.rateAppointment(id, score, review);
        } catch (e) {
            const error = e as AxiosError<TypeResponse>;
            console.error("Ошибка при оценке консультации:", error.response?.data.message);
        } finally {
            setModalRate(false);
        }
    };

    const openModal = (consultation: Consultation, modalSetter: (val: boolean) => void) => {
        setSelectedConsultation(consultation);
        modalSetter(true);
    };

    if (!consultations || (consultations && consultations.length === 0)) return (
        <div className="consultation-card">
            <div className="consultation-card__specialist" style={{ textAlign: 'center' }}>
                Здесь будут находиться посещенные консультации
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

            <RateModal
                isOpen={modalRate}
                consultationId={selectedConsultation?.id || 0}
                onClose={() => setModalRate(false)}
                onRecord={handleRateConsultation}
            />

            <div className={`consultations-container ${isVisible ? 'visible' : 'hidden'} ${mode === "PATIENT" ? "consultations__archives" : ""}`}>
                {consultations.map((consultation) => (
                    <div key={consultation.id} className="consultation-card">
                        <div className="consultation-card__time">
                            <span className="consultation-card__date">{getDateLabel(consultation.date)}</span>
                            <span className="consultation-card__hours">{consultation.durationTime}</span>
                        </div>

                        <div className="consultation-card__info">
                            <div className="consultation-card__specialist">
                                {mode === "DOCTOR" ? (
                                    <>
                                        Клиент: {(!consultation.PatientSurname && !consultation.PatientName && !consultation.PatientPatronymic) ? (
                                            <span>Анонимный пользователь</span>
                                        ) : (
                                            <span>{consultation.PatientSurname} {consultation.PatientName} {consultation.PatientPatronymic ?? ""}</span>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        Специалист: {' '}
                                        <a target="_blank" href={`/profile/${consultation.DoctorUserId}`}>
                                            {consultation.DoctorSurname} {consultation.DoctorName} {consultation.DoctorPatronymic}
                                        </a>

                                        {consultation.PatientScore && (
                                            <>
                                                <br />
                                                <span className="consultation-card__details">
                                                    Ваша оценка: {consultation.PatientScore}
                                                </span>
                                            </>
                                        )}
                                    </>
                                )}
                            </div>

                            {mode !== "PATIENT" && (
                                <>
                                    <div className="consultation-card__symptoms">
                                        Симптомы: {' '}
                                        {consultation.Problems.map((p, i) => (
                                            <span key={i}>
                                                {p.toLocaleLowerCase()}
                                                {i < consultation.Problems.length - 1 ? ', ' : '.'}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="consultation-card__details">
                                        Подробно: {' '}
                                        <span>{consultation.other_problem || "Не указано"}</span>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="consultation-card__actions">
                            {mode === "PATIENT" && !consultation.PatientScore && (
                                <button
                                    className="consultation-card__button consultation-card__button--rate"
                                    onClick={() => openModal(consultation, setModalRate)}
                                >
                                    Оценить
                                </button>
                            )}

                            {(mode === "PATIENT" || mode === "ADMIN") && (
                                <button
                                    className="consultation-card__button consultation-card__button--repeat"
                                    onClick={() => openModal(consultation, setModalRepeat)}
                                >
                                    Повторить
                                </button>
                            )}

                            {mode !== "PATIENT" && (
                                <div className="consultation-card__recomendations">
                                    Рекомендации: {' '}
                                    {consultation.recommendations ? (
                                        <a href={`${API_URL}/${consultation.recommendations}`}>Файл</a>
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

            <Pagination
                page={page}
                totalPages={totalPages}
                onChange={handlePageChange}
            />
        </>
    );
};

export default ArchiveConsultations;