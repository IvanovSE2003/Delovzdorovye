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
import { getDateLabel } from '../../../helpers/formatDate';
import type { Consultation } from '../../../models/consultations/Consultation';
import type { ConsultationData } from '../../../models/consultations/ConsultationData';
import { Link } from 'react-router';
import LoaderUsefulInfo from '../../../components/UI/LoaderUsefulInfo/LoaderUsefulInfo';

interface ArchiveConsultationsProps {
    userId: number;
    userRole: Role;
    linkerRole: Role;
}

const ArchiveConsultations: React.FC<ArchiveConsultationsProps> = ({ userId, linkerRole, userRole }) => {
    const [consultations, setConsultations] = useState<Consultation[]>([]);
    const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
    const [modalRepeat, setModalRepeat] = useState(false);
    const [modalRate, setModalRate] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isVisible, setIsVisible] = useState(true);
    const [loading, setLoading] = useState<boolean>(false);
    
    const limit = linkerRole === "PATIENT" ? 2 : 4;

    const fetchConsultations = async (pageNumber = 1) => {
        try {
            setLoading(true);
            let response;
            if (userRole === "DOCTOR")
                response = await ConsultationService.getAllConsultations(limit, pageNumber, {
                    consultation_status: "ARCHIVE",
                    doctorUserId: userId
                });
            else
                response = await ConsultationService.getAllConsultations(limit, pageNumber, {
                    consultation_status: "ARCHIVE",
                    userId: userId
                });

            setConsultations(response.data.consultations || []);
            setTotalPages(response.data.totalPages);
            setPage(pageNumber);
        } catch (e) {
            processError(e, "Ошибка при получении архивных консультаций");
        } finally {
            setIsVisible(true);
            setLoading(false);
        }
    };

    const loadData = async () => {
        setIsVisible(false);
        await new Promise(resolve => setTimeout(resolve, 150));
        await fetchConsultations(page);
    };

    useEffect(() => {
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
            setLoading(true)
            await ConsultationService.repeatAppointment(data);
        } catch (e) {
            const error = e as AxiosError<TypeResponse>;
            console.error("Ошибка при повторе консультации:", error.response?.data.message);
        } finally {
            setModalRepeat(false);
            await loadData();
            setLoading(false);
        }
    };

    const handleRateConsultation = async (score: number, review: string, id: number) => {
        try {
            setLoading(true);
            await ConsultationService.rateAppointment(id, score, review);
        } catch (e) {
            const error = e as AxiosError<TypeResponse>;
            console.error("Ошибка при оценке консультации:", error.response?.data.message);
        } finally {
            setModalRate(false);
            await loadData();
            setLoading(false);
        }
    };

    const openModal = (consultation: Consultation, modalSetter: (val: boolean) => void) => {
        setSelectedConsultation(consultation);
        modalSetter(true);
    };

    if (loading) return <LoaderUsefulInfo/>;

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

            <div className={`consultations-container ${isVisible ? 'visible' : 'hidden'} ${linkerRole === "PATIENT" ? "consultations__archives" : ""}`}>
                {consultations.map((consultation) => (
                    <div key={consultation.id} className="archive-consultation-card  consultation-card">
                        <div className="consultation-card__time">
                            <span className="consultation-card__date">{getDateLabel(consultation.date)}</span>
                            <span className="consultation-card__hours">{consultation.durationTime}</span>
                        </div>

                        <div className="consultation-card__info">
                            <div className="consultation-card__specialist">
                                {linkerRole === "DOCTOR" ? (
                                    <>
                                        Клиент: {(!consultation.PatientSurname && !consultation.PatientName && !consultation.PatientPatronymic) ? (
                                            <span>Анонимный пользователь</span>
                                        ) : (
                                            <Link to={`/profile/${consultation.PatientUserId}`}>{consultation.PatientSurname} {consultation.PatientName} {consultation.PatientPatronymic ?? ""}</Link>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        Специалист: {' '}
                                        <a target="_blank" href={`/profile/${consultation.DoctorUserId}`}>
                                            {consultation.DoctorSurname} {consultation.DoctorName} {consultation.DoctorPatronymic}
                                        </a>
                                    </>
                                )}
                            </div>

                            {linkerRole !== "PATIENT" && (
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
                                        <span>{consultation.descriptionProblem || "Не указано."}</span>
                                    </div>

                                    <div className="consultation-card__recomendations">
                                        Рекомендации: {' '}
                                        {consultation.recommendations ? (
                                            <a href={`${API_URL}/${consultation.recommendations}`}>Файл</a>
                                        ) : (
                                            <span>Файл не приложен.</span>
                                        )}
                                    </div>
                                </>
                            )}

                            <div className="consultation-card__details">
                                Ваша оценка: {`  `}
                                <span className="rating-stars">
                                    {'★'.repeat(consultation.PatientScore)}
                                    {'☆'.repeat(5 - consultation.PatientScore)}
                                </span>
                            </div>
                        </div>

                        <div className="consultation-card__actions">
                            {linkerRole === "PATIENT" && !consultation.PatientScore && (
                                <button
                                    className="consultation-card__button consultation-card__button--rate"
                                    onClick={() => openModal(consultation, setModalRate)}
                                >
                                    Оценить
                                </button>
                            )}

                            {linkerRole !== "DOCTOR" && (
                                <button
                                    className="consultation-card__button consultation-card__button--repeat"
                                    onClick={() => openModal(consultation, setModalRepeat)}
                                >
                                    Повторить
                                </button>
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
                className="consultation-card__pagination"
            />
        </>
    );
};

export default ArchiveConsultations;