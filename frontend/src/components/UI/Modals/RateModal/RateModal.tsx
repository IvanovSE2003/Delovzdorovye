import { useState } from "react";
import "./RateModal.scss";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface RateModalProps extends ModalProps {
    onRecord: (score: number, review: string, id: number) => void;
}

const RateModal: React.FC<RateModalProps> = ({ isOpen, onClose, onRecord}) => {
    const [score, setScore] = useState<number>(0);
    const [hover, setHover] = useState<number>(0);
    const [review, setReview] = useState<string>("");

    // Отправка данных об оценки консултации
    const handleSubmit = () => {
        console.log("Оценка:", score);
        console.log("Отзыв:", review);
        onRecord(score, review, 0);
    };

    if (!isOpen) return;

    return (
        <div className="modal">
            <div className="rate-modal">
                <h2 className="rate-modal__title">Выберите оценку</h2>

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
                    placeholder="Отзыв (не менее 10 символов)"
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                />

                <button
                    className="rate-modal__button"
                    onClick={handleSubmit}
                    disabled={review.length<=10}
                >
                    Отправить
                </button>
            </div>
        </div>
    );
};

export default RateModal;
