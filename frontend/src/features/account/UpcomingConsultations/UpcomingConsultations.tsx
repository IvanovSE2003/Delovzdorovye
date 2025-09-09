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

const UserConsultations: React.FC<UserConsultationsProps> = ({ id = "", mode = "ADMIN", refreshTrigger = 0 }) => {
    const [modalShift, setModalShift] = useState<boolean>(false);
    const [modalCancel, setModalCancel] = useState<boolean>(false);
    const [modalRepeat, setModalRepeat] = useState<boolean>(false);
    const [modalEdit, setModalEdit] = useState<boolean>(false);

    const [consultations, setConsultations] = useState<Consultation[]>([] as Consultation[])
    const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);

    // Получение данных предстоящих консультаций
    const fetchConsultations = async () => {
        try {
            let response;
            if (mode === "DOCTOR") response = await ConsultationService.getAllConsultions(10, 1, { consultation_status: "UPCOMING", doctorId: id });
            else response = await ConsultationService.getAllConsultions(10, 1, { consultation_status: "UPCOMING", userId: id });
            response && setConsultations(response.data.consultations);
        } catch (e) {
            const error = e as AxiosError<TypeResponse>;
            console.error('Ошибка при получение предстоящих консультации: ', error.response?.data.message)
        }
    }

    // Получаем данные при заходе на страницу
    useEffect(() => {
        fetchConsultations();
    }, [])

    // Обновление данных по сигналу извне
    useEffect(() => {
        fetchConsultations();
    }, [refreshTrigger]);

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
    const handleCancelConsultation = (reason: string, id: number) => {
        console.log(`Данные для записи ${id}: `, reason);
        // const response = await ConsultationService.cancelAppoinment(reason, id);
        // console.log(response.data);
        setModalCancel(false);
    };

    // Завершение повторения консультации
    const handleRepeatConsultation = (data: ConsultationData) => {
        console.log("Данные для записи:", data);
        // const response = await ConsultationService.repeatAppoinment(data);
        // console.log(response.data);
        setModalRepeat(false);
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
                Здесь будут находиться ваши предстоящие консультации
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
            />

            {consultations.map(consultation => (
                <div key={consultation.id} className="consultation-card">
                    <div className="consultation-card__time">
                        <span className="consultation-card__date">{getDateLabel(consultation.date)}</span>
                        <span className="consultation-card__hours">{consultation.durationTime}</span>
                    </div>

                    <div className="consultation-card__info">
                        {(mode === "PATIENT" || mode === "ADMIN") && (
                            <div className="consultation-card__specialist">
                                Специалист: <span>{consultation.DoctorSurname} {consultation.DoctorName} {consultation?.DoctorPatronymic}</span>
                            </div>
                        )}

                        {mode === "DOCTOR" && (
                            <div className="consultation-card__specialist">
                                Клиент: {(!consultation.PatientSurname && !consultation.PatientName && !consultation.PatientPatronymic)
                                    ? <span> Анонимный пользователь </span>
                                    : <span> {consultation.PatientSurname} {consultation.PatientName} {consultation.PatientPatronymic ?? ""} </span>
                                }
                            </div>
                        )}

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
        </>
    );
}

export default UserConsultations;