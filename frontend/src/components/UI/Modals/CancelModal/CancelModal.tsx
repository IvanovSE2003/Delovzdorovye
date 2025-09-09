import { useEffect, useState } from 'react';
import './CancelModal.scss'
import type { Consultation } from '../../../../features/account/UpcomingConsultations/UpcomingConsultations';
import { getDateLabel } from '../../../../hooks/DateHooks';

export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    consultationData: Consultation;
}

interface CancelModalProps extends ModalProps {
    onRecord: (reasons: string, id: number) => void;
}

const CancelModal: React.FC<CancelModalProps> = ({ isOpen, onClose, onRecord, consultationData }) => {
    const [reasons, setReasons] = useState<string>("");
    const [error, setError] = useState<string>("");

    const handleSubmit = () => {
        if (!reasons) {
            setError("Пожалуйста, заполните причину отказа!");
            return;
        }

        onRecord(reasons, consultationData.id);
    };

    useEffect(() => {
        if (!isOpen) {

        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="modal">
            <div className='shift-modal'>
                <h2 className="consultation-modal__title">Отмена консультации</h2>

                <button
                    className="consultation-modal__close"
                    onClick={onClose}
                >
                    X
                </button>

                <div className="shift-modal__information">
                    <p>Вы отменяете консультацию: {getDateLabel(consultationData.date)}, {consultationData.durationTime}</p>
                </div>

                <div className="shift-modal__client">
                    Клиент: {consultationData.PatientSurname} {consultationData.PatientName} {consultationData?.PatientPatronymic}, 8 888 888 88 88
                </div>

                <div className="cancel-modal__reason">
                    <textarea
                        id="reasons"
                        placeholder='Причина отказа (не менее 10 символов)'
                        value={reasons}
                        onChange={(e) => setReasons(e.target.value)}
                    />
                </div>

                <div className="cancel-modal__notification">
                    🔔 Средства будут возвращены в течении 3 дней.
                </div>

                {error && (
                    <div className="consultation-modal__error">{error}</div>
                )}

                <button
                    className='shift-modal__submit'
                    disabled={reasons.length <= 10}
                    onClick={handleSubmit}
                >
                    Отменить
                </button>
            </div>
        </div>
    )
}

export default CancelModal;