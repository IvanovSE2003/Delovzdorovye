import AccountLayout from "../AccountLayout";
import { useState } from "react";

const Main: React.FC = () => {
    const [record, setRecord] = useState<boolean>(false);

    return (
        <AccountLayout>
            {record && (
                <div className="modal">
                    <div className="record-modal">
                        <h2 className="record-modal__title">Запись на консультацию</h2>
                        <button
                            className="record-modal__close"
                            onClick={() => setRecord(prev => !prev)}
                        >
                            X
                        </button>

                        <select className="record-modal__problems" defaultValue="" name="promblems" id="problems">
                            <option value="">Выберите одну или несколько проблем</option>
                            <option value="1">Хроническая усталость</option>
                            <option value="2">Нарушение сна и бессонница</option>
                            <option value="3">Нехватка энергии в течении дня</option>
                            <option value="4">Отсутствие мотивации</option>
                        </select>

                        <p className="record-modal__title-date">Выберите удобные дату и время: </p>

                        <div className="record-modal__date-time">
                            <div className="celendary">
                                Календарь
                            </div>

                            <div className="time">
                                Время
                            </div>
                        </div>

                        <button className="record-modal__button">
                            Записаться на консультацию
                        </button>
                    </div>
                </div>
            )}

            <div className="main">
                <div className="main__main-block">
                    <h2 className="main__main-block__title">Дело всегда в здоровье - начните сейчас!</h2>
                    <p className="main__main-block__text">Наши специалисты составят персональный план по комплексному восстановлению здоровья, учитывая ваши привычки и возможности.</p>

                    <button
                        className="main__main-block__button"
                        onClick={() => setRecord(prev => !prev)}
                    >
                        Записаться на консультацию
                    </button>
                </div>

                <div className="main__nearest">
                    <h2 className="main__nearest__title">Ближайшие консультации</h2>

                    <div className="main__nearest__block">
                        <span>Сегодня, 15:30 - 16:30</span>
                        <div><strong>Специалист: </strong><a href="\">Анна Петрова</a></div>
                    </div>

                    <div className="main__nearest__block">
                        <span>Завтра, 10:00 - 11:00</span>
                        <div><strong>Специалист: </strong><a href="\">Мария Иванова</a></div>
                    </div>

                </div>

                <div className="main__other">

                </div>
            </div>
        </AccountLayout>
    )
}

export default Main;