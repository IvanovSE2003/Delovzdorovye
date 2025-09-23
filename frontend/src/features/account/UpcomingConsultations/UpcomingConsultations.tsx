import { lazy, Suspense, useEffect, useState } from 'react';
import './UpcomingConsultations.scss';
import ConsultationService from '../../../services/ConsultationService';
import { getDateLabel } from '../../../hooks/DateHooks';
import type { Role } from '../../../models/Auth';
import Pagination from '../../../components/UI/Pagination/Pagination';
import { processError } from '../../../helpers/processError';
import ShowError from '../../../components/UI/ShowError/ShowError';
import LoaderUsefulInfo from '../../../components/UI/LoaderUsefulInfo/LoaderUsefulInfo';
import type { ConsultationData } from '../../../components/UI/Modals/EditModal/EditModal';

// Замените прямые импорты на ленивые
const ShiftModal = lazy(() => import('../../../components/UI/Modals/ShiftModal/ShiftModal'));
const CancelModal = lazy(() => import('../../../components/UI/Modals/CancelModal/CancelModal'));
const RepeatModal = lazy(() => import('../../../components/UI/Modals/RepeatModal/RepeatModal'));
const EditModal = lazy(() => import('../../../components/UI/Modals/EditModal/EditModal'));

export interface Consultation {
    id: number;
    durationTime: string;
    date: string;
    DoctorId: number;
    DoctorName: string;
    DoctorSurname: string;
    DoctorPatronymic?: string;
    DoctorUserId: number;
    PatientUserId: number;
    PatientName: string;
    PatientSurname: string;
    PatientPatronymic?: string;
    PatientPhone: string;
    PatientScore: number;
    PatientComment: string;
    Problems: string[];
    score?: number;
    comment?: string;
    reason_cancel?: string;
    recommendations?: string;
    other_problem?: string;
}

export interface UserConsultationsProps {
    id?: string;
    mode?: Role;
    refreshTrigger?: number;
}

const PAGE_SIZE = 4;

const UserConsultations: React.FC<UserConsultationsProps> = ({ id = "", mode = "ADMIN", refreshTrigger = 0 }) => {
    const [modalShift, setModalShift] = useState<boolean>(false);
    const [modalCancel, setModalCancel] = useState<boolean>(false);
    const [modalRepeat, setModalRepeat] = useState<boolean>(false);
    const [modalEdit, setModalEdit] = useState<boolean>(false);

    const [consultations, setConsultations] = useState<Consultation[]>([] as Consultation[])
    const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);

    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    const [message, setMessage] = useState<{ id: number, message: string }>({ id: 0, message: "" });
    const [error, setError] = useState<{ id: number, message: string }>({ id: 0, message: "" });
    const [loading, setLoading] = useState<boolean>(false);

    // Получение данных предстоящих консультаций
    const fetchConsultations = async () => {
        try {
            setLoading(true)
            let response;
            if (mode === "DOCTOR")
                response = await ConsultationService.getAllConsultations(PAGE_SIZE, page, {
                    consultation_status: "UPCOMING",
                    doctorId: id
                });
            else if (mode === "PATIENT")
                response = await ConsultationService.getAllConsultations(1, page, {
                    consultation_status: "UPCOMING",
                    userId: id
                });
            else
                response = await ConsultationService.getAllConsultations(PAGE_SIZE, page, {
                    consultation_status: "UPCOMING",
                    userId: id
                });

            if (response) {
                setConsultations(response.data.consultations);
                setTotal(response.data.totalPages || 0);
            }
        } catch (e) {
            processError(e, "Ошибка при получении предстоящих консультаций")
        } finally {
            setIsVisible(true);
            setLoading(false);
        }
    }

    // Загружаем при заходе и при изменении страницы
    useEffect(() => {
        const loadData = async () => {
            setIsVisible(false);
            await new Promise(resolve => setTimeout(resolve, 150));
            await fetchConsultations();
        };
        loadData();
    }, [page]);

    // Обновление данных по сигналу извне
    useEffect(() => {
        fetchConsultations();
    }, [refreshTrigger]);

    // Обработчик изменения страницы
    const handlePageChange = (newPage: number) => {
        setIsVisible(false);
        setTimeout(() => {
            setPage(newPage);
        }, 150);
    };

    // Завершение переноса консультации
    const handleShiftConsultation = async (data: ConsultationData) => {
        try {
            await ConsultationService.shiftAppointment(data);
            setModalShift(false);
            await fetchConsultations();
        } catch (e) {
            processError(e, "Ошибка при переносе консультации", setError);
        }
    };

    // Завершение отмены консультации
    const handleCancelConsultation = async (reason: string, id: number) => {
        try {
            await ConsultationService.cancelAppointment(reason, id);
            setConsultations(prev => prev.filter(c => c.id !== id));
        } catch (e) {
            processError(e, "Ошибка при отмене консультации", setError);
        } finally {
            setModalCancel(false);
            await fetchConsultations();
        }
    };

    // Завершение повторения консультации
    const handleRepeatConsultation = async (data: ConsultationData) => {
        try {
            const response = await ConsultationService.repeatAppointment(data);
            console.log(response.data);
        } catch (e) {
            processError(e, "Ошибка при повторе консультации", setError);
        } finally {
            setModalRepeat(false);
            await fetchConsultations();
        }
    };

    // Завершение редактирование консультации
    const handleEditConsultation = async (newData: ConsultationData) => {
        try {
            setLoading(true);
            const response = await ConsultationService.editAppointment(newData);
            if (response.data.success) setMessage({ id: Date.now(), message: response.data.message })
            else setError({ id: Date.now(), message: `Ошибка: ${response.data.message}` })
        } catch (e) {
            processError(e, "Ошибка при редактировании консультации")
        } finally {
            setModalEdit(false);
            await fetchConsultations();
            setLoading(false);
        }
    };

    // Обработка сликов по кнопкам карточек с консультациями
    const handleClickButton = (data: Consultation, fun: (bool: boolean) => void) => {
        setSelectedConsultation(data);
        fun(true);
    }

    if (loading) return <LoaderUsefulInfo />

    if (consultations.length === 0) return (
        <div className="consultation-card">
            <div
                style={{ textAlign: 'center' }}
                className="consultation-card__specialist"
            >
                Здесь будут находиться предстоящие консультации
            </div>
        </div>
    );

    return (
        <div className='upcomming-cousultations'>
            <Suspense fallback={<LoaderUsefulInfo />}>
                <ShiftModal
                    isOpen={modalShift}
                    consultationData={selectedConsultation || {} as Consultation}
                    onClose={() => setModalShift(false)}
                    onRecord={handleShiftConsultation}
                    mode={mode}
                />
            </Suspense>

            <Suspense fallback={<LoaderUsefulInfo />}>
                <CancelModal
                    isOpen={modalCancel}
                    consultationData={selectedConsultation || {} as Consultation}
                    onClose={() => setModalCancel(false)}
                    onRecord={handleCancelConsultation}
                    mode={mode}
                />
            </Suspense>

            <ShowError msg={error} />
            <ShowError msg={message} mode='MESSAGE' />

            <div className={`consultations-container ${isVisible ? 'visible' : 'hidden'}`}>
                {consultations.map(consultation => (
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

                            {mode !== "PATIENT" ? (
                                <>
                                    <div className="consultation-card__symptoms">
                                        {'Симптомы: '}
                                        {consultation.Problems.map((p, i) => (
                                            <span key={i}>
                                                {p.toLocaleLowerCase()}
                                                {i < consultation.Problems.length - 1 ? ', ' : ''}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="consultation-card__details">
                                        Подробно: <span>{consultation.other_problem ? consultation?.other_problem : "Не указано"}</span>
                                    </div>
                                </>
                            ) : (
                                <div className="consultation-card__symptoms">
                                    Условия:<span> Бесплатные отмена и перенос более чем за 12 часов</span>
                                </div>
                            )}
                        </div>

                        <div className="consultation-card__actions">
                            {(mode === "PATIENT" || mode === "ADMIN") && (
                                <>
                                    <button
                                        className="consultation-card__button consultation-card__button--transfer"
                                        onClick={() => handleClickButton(consultation, setModalShift)}
                                    >
                                        Перенести
                                    </button>
                                    <button
                                        className="consultation-card__button consultation-card__button--cancel"
                                        onClick={() => handleClickButton(consultation, setModalCancel)}
                                    >
                                        Отменить
                                    </button>
                                </>
                            )}

                            {mode === "ADMIN" && (
                                <>
                                    <Suspense fallback={<LoaderUsefulInfo />}>
                                        <RepeatModal
                                            isOpen={modalRepeat}
                                            consultationData={selectedConsultation || {} as Consultation}
                                            onClose={() => setModalRepeat(false)}
                                            onRecord={handleRepeatConsultation}
                                        />
                                    </Suspense>

                                    <Suspense fallback={<LoaderUsefulInfo />}>
                                        <EditModal
                                            isOpen={modalEdit}
                                            consultationData={selectedConsultation || {} as Consultation}
                                            onClose={() => setModalEdit(false)}
                                            onRecord={handleEditConsultation}
                                        />
                                    </Suspense>

                                    <button
                                        className="consultation-card__button consultation-card__button--repeat"
                                        onClick={() => handleClickButton(consultation, setModalRepeat)}
                                    >
                                        Повторить
                                    </button>
                                    <button
                                        className="consultation-card__button consultation-card__button--edit"
                                        onClick={() => handleClickButton(consultation, setModalEdit)}
                                    >
                                        Редактировать
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <Pagination
                page={page}
                totalPages={total}
                onChange={handlePageChange}
            />
        </div>
    );
}

export default UserConsultations;