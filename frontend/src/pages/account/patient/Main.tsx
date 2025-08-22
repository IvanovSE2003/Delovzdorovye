import AccountLayout from "../AccountLayout";
import { useEffect, useState } from "react";
import Select from 'react-select';

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ru } from "date-fns/locale";

const Main: React.FC = () => {
    const [record, setRecord] = useState<boolean>(false);
    const [selectedProblems, setSelectedProblems] = useState<string[]>([]);
    const options = [
        { value: '1', label: 'Хроническая усталость' },
        { value: '2', label: 'Нарушение сна и бессонница' },
        { value: '3', label: 'Нехватка энергии в течение дня' },
        { value: '4', label: 'Отсутствие мотивации' }
    ];

    const [selectedDate, setSelectedDate] = useState<Date | null>(null);


    useEffect(() => {
        console.log(selectedProblems)
    }, []);

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

                        <Select
                            isMulti
                            options={options}
                            placeholder="Выберите одну или несколько проблем"
                            onChange={(selected) => setSelectedProblems(selected.map(opt => opt.value))}
                        />

                        <p className="record-modal__title-date">Выберите удобные дату и время: </p>

                        <div className="record-modal__date-time">
                            <div className="celendary-block">
                                <DatePicker
                                    selected={selectedDate}
                                    onChange={(date: Date | null) => {
                                        setSelectedDate(date || new Date()); 
                                    }}
                                    inline
                                    locale={ru}
                                    dateFormat="dd.MM.yyyy"
                                    minDate={new Date()}
                                    todayButton="Сегодня"
                                    popperClassName="large-datepicker"
                                    calendarClassName="large-datepicker"
                                />
                            </div>

                            <div className="time-block">
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