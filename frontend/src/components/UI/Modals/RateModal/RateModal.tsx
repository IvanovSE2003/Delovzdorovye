import { useEffect, useState } from "react";
import "./RateModal.scss";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface RateModalProps extends ModalProps {
    onRecord: (score: number, review: string, id: number) => void;
    consultationId: number;
}

const RateModal: React.FC<RateModalProps> = ({ isOpen, onClose, onRecord, consultationId }) => {
    const [score, setScore] = useState<number>(0);
    const [hover, setHover] = useState<number>(0);
    const [review, setReview] = useState<string>("");
    const [error, setError] = useState<string>("");

    // Отправка данных об оценки консултации
    const handleSubmit = () => {
        if (score === 0) {
            setError("Укажите оценку")
            return;
        }
        onRecord(score, review, consultationId);
    };

    // Отчистка формы после закрытия модалки
    useEffect(() => {
        if (!isOpen) {
            setReview("");
            setScore(0);
            setError("");
        }
    }, [isOpen])

    if (!isOpen) return;

    return (
        <div className="modal">
            <div className='consultation-modal shift-modal rate-modal'>
                <h2 className="consultation-modal__title">Выберите оценку</h2>

                <button
                    className="rate-modal__close"
                    onClick={onClose}
                >
                    X
                </button>

                <div className="rate-modal__stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <span
                            key={star}
                            className={`rate-modal__star ${(hover || score) >= star ? "rate-modal__star--active" : ""
                                }`}
                            onClick={() => setScore(star)}
                            onMouseEnter={() => setHover(star)}
                            onMouseLeave={() => setHover(0)}
                        >
                            ★
                        </span>
                    ))}
                </div>

                <textarea
                    className="rate-modal__textarea"
                    placeholder="Если хотите оставьте отзыв"
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                />

                {error && <div className="consultation-modal__error">{error}</div>}

                <button
                    className="rate-modal__button"
                    onClick={handleSubmit}
                >
                    Отправить
                </button>
            </div>
        </div>
    );
};

export default RateModal;
