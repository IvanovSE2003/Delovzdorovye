import AccountLayout from "../AccountLayout";
import { useState } from "react";
import Modal, { type ConsultationData } from "../../../components/UI/Modal/Modal";

const Main: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    const handleRecordConsultation = (data: ConsultationData) => {
        console.log("Данные для записи:", data);
        // Здесь логика отправки данных на сервер
        setIsModalOpen(false);
    };

    return (
        <AccountLayout>
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onRecord={handleRecordConsultation}
            />

            <div className="main">
                <div className="main__main-block">
                    <h2 className="main__main-block__title">Дело всегда в здоровье - начните сейчас!</h2>
                    <p className="main__main-block__text">Наши специалисты составят персональный план по комплексному восстановлению здоровья, учитывая ваши привычки и возможности.</p>

                    <button
                        className="main__main-block__button"
                        onClick={() => setIsModalOpen(true)}
                    >
                        Записаться на консультацию
                    </button>
                </div>

                <div className="main__nearest">
                    <h2 className="main__nearest__title">Ближайшие консультации</h2>

                    <div className="main__nearest__block">
                        <span>Сегодня, 15:30 - 16:30</span>
                        <div className="main__nearest__specialist">
                            <strong>Специалист: </strong><a href="\">Анна Петрова</a>
                        </div>
                    </div>

                    <div className="main__nearest__block">
                        <span>Завтра, 10:00 - 11:00</span>
                        <div className="main__nearest__specialist">
                            <strong>Специалист: </strong><a href="\">Мария Иванова</a>
                        </div>
                    </div>
                </div>

                <div className="main__other">
                    {/* Дополнительный контент */}
                </div>
            </div>
        </AccountLayout>
    );
};

export default Main;