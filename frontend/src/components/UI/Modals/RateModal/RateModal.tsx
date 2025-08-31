import { useState } from "react";
import "./RateModal.scss";

interface RateModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const RateModal: React.FC<RateModalProps> = ({ isOpen, onClose }) => {
    const [rating, setRating] = useState<number>(0);
    const [hover, setHover] = useState<number>(0);
    const [review, setReview] = useState<string>("");

    const handleSubmit = () => {
        console.log("Оценка:", rating);
        console.log("Отзыв:", review);
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
                            className={`rate-modal__star ${(hover || rating) >= star ? "rate-modal__star--active" : ""
                                }`}
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHover(star)}
                            onMouseLeave={() => setHover(0)}
                        >
                            ★
                        </span>
                    ))}
                </div>

                <textarea
                    className="rate-modal__textarea"
                    placeholder="Отзыв"
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                />

                <button className="rate-modal__button" onClick={handleSubmit}>
                    Отправить
                </button>
            </div>
        </div>
    );
};

export default RateModal;
