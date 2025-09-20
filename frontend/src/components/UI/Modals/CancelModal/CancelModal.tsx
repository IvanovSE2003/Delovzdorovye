import { useState } from 'react';
import './CancelModal.scss'
import type { Consultation } from '../../../../features/account/UpcomingConsultations/UpcomingConsultations';
import { formatDateWithoutYear } from '../../../../hooks/DateHooks';
import type { Role } from '../../../../models/Auth';
import ShowError from '../../ShowError/ShowError';

export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    consultationData: Consultation;
}

interface CancelModalProps extends ModalProps {
    onRecord: (reasons: string, id: number) => void;
    mode?: Role;
}

const CancelModal: React.FC<CancelModalProps> = ({ isOpen, onClose, onRecord, consultationData, mode }) => {
    const [reasons, setReasons] = useState<string>("");
    const [error, setError] = useState<{ id: number; message: string }>({ id: 0, message: "" });

    // Отмена консультации
    const handleSubmit = () => {
        if (!reasons) {
            setError({ id: Date.now(), message: "Пожалуйста, заполните причину отказа!" });
            return;
        }

        onRecord(reasons, consultationData.id);
    };

    // Если модалка зактыра ничего не возвращать
    if (!isOpen) return null;

    // Основной рендер
    return (
        <div className="modal">
            <div className='shift-modal cancel-modal'>
                <h2 className="consultation-modal__title">Отмена консультации</h2>

                <button
                    className="consultation-modal__close"
                    onClick={onClose}
                >
                    X
                </button>

                <div className="shift-modal__information">
                    <p>Вы отменяете консультацию: {formatDateWithoutYear(consultationData.date)}, {consultationData.durationTime}</p>
                </div>

                {mode === "ADMIN" && (
                    <div className="shift-modal__client">
                        Клиент: {(!consultationData.PatientSurname && !consultationData.PatientName && !consultationData.PatientPatronymic)
                            ? <span>Анонимный пользователь</span>
                            : <span>
                                {consultationData.PatientSurname} {consultationData.PatientName} {consultationData.PatientPatronymic ?? ""}, {consultationData.PatientPhone}
                            </span>
                        }
                    </div>
                )}

                <p className="consultation-modal__description">
                    Если вам удобно, поделитесь причиной отмены (это поможет нам стать лучше):
                </p>

                <div className="cancel-modal__reason">
                    <textarea
                        id="reasons"
                        placeholder='Причина отмены'
                        value={reasons}
                        onChange={(e) => setReasons(e.target.value)}
                    />
                </div>

                <div className="cancel-modal__notification">
                    🔔 Средства будут возвращены в течении 3 дней.
                </div>

                <ShowError msg={error} />

                <button
                    className='shift-modal__submit'
                    onClick={handleSubmit}
                >
                    Отменить
                </button>
            </div>
        </div>
    )
}

export default CancelModal;