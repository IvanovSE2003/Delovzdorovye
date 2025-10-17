import { useState } from 'react';
import type { Role } from '../../../../models/Auth';
import type { Consultation } from '../../../../models/consultations/Consultation';
import { formatDateWithoutYear } from '../../../../helpers/formatDate';
import './CancelModal.scss'
import ModalHeader from '../ModalHeader/ModalHeader';
import { GetFormatPhone } from '../../../../helpers/formatPhone';

export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    consultationData: Consultation;
}

interface CancelModalProps extends ModalProps {
    onRecord: (reasons: string, id: number, userId: number) => void;
    mode?: Role;
    userId: number;
}

const CancelModal: React.FC<CancelModalProps> = ({ isOpen, onClose, onRecord, consultationData, mode, userId }) => {
    const [reasons, setReasons] = useState<string>("");

    // Отмена консультации
    const handleSubmit = () => {
        onRecord(reasons, consultationData.id, userId);
    };

    // Если модалка зактыра ничего не возвращать
    if (!isOpen) return;

    return (
        <div className="modal">
            <div className='shift-modal cancel-modal'>
                <ModalHeader title="Отмена консультации" onClose={onClose} />

                <div className="shift-modal__information">
                    <p>Вы отменяете консультацию: {formatDateWithoutYear(consultationData.date)}, {consultationData.durationTime}</p>
                </div>

                {mode === "ADMIN" && (
                    <div className="shift-modal__client">
                        Клиент: {(!consultationData.PatientSurname && !consultationData.PatientName && !consultationData.PatientPatronymic)
                            ? <span>Анонимный пользователь</span>
                            : <span>
                                {consultationData.PatientSurname} {consultationData.PatientName} {consultationData.PatientPatronymic ?? ""}, {GetFormatPhone(consultationData.PatientPhone)}
                            </span>
                        }
                    </div>
                )}

                {mode !== "ADMIN" && (
                    <>
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
                    </>
                )}

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