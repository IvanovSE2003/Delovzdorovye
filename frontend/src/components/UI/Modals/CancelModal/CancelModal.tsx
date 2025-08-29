import { useEffect, useState } from 'react';
import './CancelModal.scss'

interface CancelModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRecord: (reasons: string) => void;
}

const CancelModal: React.FC<CancelModalProps> = ({ isOpen, onClose, onRecord }) => {
    const [reasons, setReasons] = useState<string>("");
    const [error, setError] = useState<string>("");

    const handleSubmit = () => {
        console.log(reasons)
        if (!reasons) {
            setError("Пожалуйста, заполните причину отказа!");
            return;
        }

        onRecord(reasons);
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
                    <p>Вы отменяете консультацию: 7 августа, 20:30</p>
                </div>

                <div className="shift-modal__client">
                    Клиент: Иванова Мария Петрова, 8 888 888 88 88
                </div>

                <div className="cancel-modal__reason">
                    <textarea
                        id="reasons"
                        placeholder='Причина отказа'
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
                    onClick={handleSubmit}
                >
                    Отменить
                </button>
            </div>
        </div>
    )
}

export default CancelModal;