import { useEffect, useState } from 'react';
import './UpcomingConsultations.scss';
import ShiftModal from '../../../components/UI/Modals/ShiftModal/ShiftModal';
import CancelModal from '../../../components/UI/Modals/CancelModal/CancelModal';
import RepeatModal from '../../../components/UI/Modals/RepeatModal/RepeatModal';
import EditModal, { type ConsultationData } from '../../../components/UI/Modals/EditModal/EditModal';
import ConsultationService from '../../../services/ConsultationService';
import type { TypeResponse } from '../../../models/response/DefaultResponse';
import type { AxiosError } from 'axios';
import { getDateLabel } from '../../../hooks/DateHooks';
import type { Role } from '../../../models/Auth';
import Pagination from '../../../components/UI/Pagination/Pagination';

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

    // Получение данных предстоящих консультаций
    const fetchConsultations = async () => {
        try {

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
            const error = e as AxiosError<TypeResponse>;
            console.error('Ошибка при получение предстоящих консультации: ', error.response?.data.message)
        } finally {
            setIsVisible(true);
        }
    }

    // Загружаем при заходе и при изменении страницы
    useEffect(() => {
        const loadData = async () => {
            setIsVisible(false);
            await new Promise(resolve => setTimeout(resolve, 150)); // Небольшая задержка перед загрузкой
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
            console.log("Данные для переноса консультации:", data);
            await ConsultationService.shiftAppointment(data);
            setModalShift(false);
        } catch (e) {
            const error = e as AxiosError<TypeResponse>;
            console.error("Ошибка при переносе консультации: ", error.response?.data.message);
        }
    };

    // Завершение отмены консультации
    const handleCancelConsultation = async (reason: string, id: number) => {
        try {
            await ConsultationService.cancelAppointment(reason, id);

            // Убираем отменённую консультацию из локального стейта
            setConsultations(prev => prev.filter(c => c.id !== id));

            setModalCancel(false);
        } catch (e) {
            const error = e as AxiosError<TypeResponse>;
            console.error("Ошибка при отмене консультации: ", error.response?.data.message);
        } finally {
            // на всякий случай можно подгрузить ещё раз, если нужно синхронизировать с бэком
            fetchConsultations();
        }
    };

    // Завершение повторения консультации
    const handleRepeatConsultation = async (data: ConsultationData) => {
        try {
            const response = await ConsultationService.repeatAppointment(data);
            console.log(response.data);
        } catch (e) {
            const error = e as AxiosError<TypeResponse>;
            console.error("Ошибка при повторе консультации: ", error.response?.data.message);
        } finally {
            setModalRepeat(false);
        }
    };

    // Завершение редактирование консультации
    const handleEditConsultation = (newData: ConsultationData) => {
        console.log("Новые данные для консультации:", newData);
        // const response = await ConsultationService.editAppoinment(newData);
        // console.log(response.data);
        setModalEdit(false);
    };

    // Обработка сликов по кнопкам карточек с консультациями
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
                Здесь будут находиться предстоящие консультации
            </div>
        </div>
    );

    return (
        <>
            <ShiftModal
                isOpen={modalShift}
                consultationData={selectedConsultation || {} as Consultation}
                onClose={() => setModalShift(false)}
                onRecord={handleShiftConsultation}
                mode={mode}
            />

            <CancelModal
                isOpen={modalCancel}
                consultationData={selectedConsultation || {} as Consultation}
                onClose={() => setModalCancel(false)}
                onRecord={handleCancelConsultation}
                mode={mode}
            />

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
                                        Симптомы подробно: <span>{consultation.other_problem ? consultation?.other_problem : "Не указано"}</span>
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
                                    <RepeatModal
                                        isOpen={modalRepeat}
                                        consultationData={selectedConsultation || {} as Consultation}
                                        onClose={() => setModalRepeat(false)}
                                        onRecord={handleRepeatConsultation}
                                    />

                                    <EditModal
                                        isOpen={modalEdit}
                                        onClose={() => setModalEdit(false)}
                                        onRecord={handleEditConsultation}
                                    />

                                    <button
                                        className="consultation-card__button consultation-card__button--repeat"
                                        onClick={() => setModalRepeat(true)}
                                    >
                                        Повторить
                                    </button>
                                    <button
                                        className="consultation-card__button consultation-card__button--edit"
                                        onClick={() => setModalEdit(true)}
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
        </>
    );
}

export default UserConsultations;