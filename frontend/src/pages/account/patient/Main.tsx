import AccountLayout from "../AccountLayout";
import { useEffect, useState } from "react";
import Select from 'react-select';

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ru } from "date-fns/locale";
import TimeSlots from "../../../features/account/TimeSlots/TimeSlots";
import $api, { API_URL } from "../../../http";

const Main: React.FC = () => {
    const [record, setRecord] = useState<boolean>(false);
    const [selectedProblems, setSelectedProblems] = useState<string[]>([]);
    const [otherProblemText, setOtherProblemText] = useState<string>("");
    const [showOtherProblemInput, setShowOtherProblemInput] = useState<boolean>(false);

    const options = [
        { value: '1', label: 'Хроническая усталость' },
        { value: '2', label: 'Нарушение сна и бессонница' },
        { value: '3', label: 'Нехватка энергии в течение дня' },
        { value: '4', label: 'Отсутствие мотивации' },
        { value: '5', label: 'Пищевая зависимость' },
        { value: '6', label: 'Последствия малоподвижного образа жизни' },
        { value: '7', label: 'Тревожность' },
        { value: '8', label: 'Снижение концентрации' },
        { value: '9', label: 'Другая проблема' }
    ];

    const [selected, setSelected] = useState<string | null>(null);

    const times = [
        "09:00", "09:30", "10:00", "10:30",
        "12:00", "12:30", "13:00", "13:30",
        "15:00", "16:00", "18:00", "19:30"
    ];

    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    // Обработчик изменения выбора в Select
    const handleProblemChange = async (selectedOptions: any) => {
        const selectedValues = selectedOptions ? selectedOptions.map((opt: { value: any; }) => opt.value) : [];
        setSelectedProblems(selectedValues);

        // Проверяем, выбрана ли "Другая проблема"
        const hasOtherProblem = selectedValues.includes('9');
        setShowOtherProblemInput(hasOtherProblem);

        // Если "Другая проблема" не выбрана, очищаем текст
        if (!hasOtherProblem) {
            setOtherProblemText("");
        }

        const data = await $api.post(`${API_URL}/consultation/findDay`, {problems: selectedProblems})
        // console.log(data.slots);
    };

    useEffect(() => {
        console.log(selectedProblems);
    }, [selectedProblems]);

    useEffect(() => {
        console.log(selectedDate)
    }, [selectedDate])

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
                            className="record-modal__select-problems"
                            onChange={handleProblemChange}
                        />

                        {showOtherProblemInput && (
                            <div className="other-problem-input">
                                <label htmlFor="otherProblem">Опишите вашу проблему:</label>
                                <textarea
                                    id="otherProblem"
                                    value={otherProblemText}
                                    onChange={(e) => setOtherProblemText(e.target.value)}
                                    placeholder="Подробно опишите вашу проблему..."
                                    rows={4}
                                />
                            </div>
                        )}

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
                                <div>
                                    <TimeSlots times={times} onSelect={setSelected} />
                                    <p>Вы выбрали: {selected}</p>
                                </div>
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
                        <div
                            className="main__nearest__specialist"
                        >
                            <strong>Специалист: </strong><a href="\">Анна Петрова</a>
                        </div>
                    </div>

                    <div className="main__nearest__block">
                        <span>Завтра, 10:00 - 11:00</span>
                        <div
                            className="main__nearest__specialist"
                        >
                            <strong>Специалист: </strong><a href="\">Мария Иванова</a>
                        </div>
                    </div>

                </div>

                <div className="main__other">

                </div>
            </div>
        </AccountLayout>
    )
}

export default Main;