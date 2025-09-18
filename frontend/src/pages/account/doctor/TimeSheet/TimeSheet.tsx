import { useContext, useState } from "react";
import AccountLayout from "../../AccountLayout";
import { Context } from "../../../../main";
import { observer } from "mobx-react-lite";
import ScheduleGrid, { type SlotStatus } from "../../../../components/UI/Schedule/Schedule";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ru } from "date-fns/locale";
import ShowError from "../../../../components/UI/ShowError/ShowError";
import "./TimeSheet.scss";
import DoctorService from "../../../../services/DoctorService";
import { processError } from "../../../../helpers/processError";

const TimeSheet: React.FC = () => {
    const { store } = useContext(Context);
    const [modal, setModal] = useState<boolean>(false);
    const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
    const [error, setError] = useState<{ id: number; message: string }>({ id: 0, message: "" })
    const [message, setMessage] = useState<string>("");
    const [startDate, endDate] = dateRange;

    const handleScheduleChange = (slots: Record<string, SlotStatus>) => {
        console.log("Текущее расписание:", slots);
    };

    const handleApplyBreak = async () => {
        if (!startDate || !endDate) {
            setError({ id: Date.now(), message: "Выберите диапазон дат перерыва" });
            return;
        }

        try {
            // Функция для корректировки даты (добавляем 1 день)
            const adjustDate = (date: Date) => {
                const adjustedDate = new Date(date);
                adjustedDate.setDate(adjustedDate.getDate() + 1);
                return adjustedDate.toISOString().split("T")[0];
            };

            const response = await DoctorService.applyBreak(store.user.id, adjustDate(startDate), adjustDate(endDate))
            if (response.data.success) {
                setDateRange([null, null]);
                setMessage(response.data.message);
            }
        } catch (e) {
            processError(e, "Ошибка при взятии перерыва", setError);
        } finally {
            setModal(false);
        }
    };

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    return (
        <AccountLayout>
            <div className="page-container timesheet">
                <h2 className="page-container__title">Ваше расписание</h2>
                <button className="consultation-modal__close" onClick={() => setModal(false)}>X</button>
                <p className="timesheet__description">Настраивайте расписание как вам удобно</p>

                {message && (<div className="timesheet__message">{message}</div>)}

                <ScheduleGrid
                    onChange={handleScheduleChange}
                    userId={store.user.id}
                />

                <br />
                <button
                    className="my-button timesheet__break"
                    onClick={() => setModal(true)}
                >
                    Взять перерыв
                </button>
            </div>

            {modal && (
                <div className="modal">
                    <div className="timesheet__modal">
                        <h2 className="consultation-modal__title">Взять перерыв</h2>
                        <button className="consultation-modal__close" onClick={() => setModal(false)}>X</button>

                        <div className="timesheet__date">
                            <div className="timesheet__celendar">
                                <DatePicker
                                    selected={startDate}
                                    onChange={(update: [Date | null, Date | null]) => setDateRange(update)}
                                    startDate={startDate}
                                    endDate={endDate}
                                    locale={ru}
                                    selectsRange
                                    dateFormat="dd.MM.yyyy"
                                    inline
                                    minDate={tomorrow}
                                />
                            </div>
                        </div>

                        <div className="timesheet__selected-dates">
                            {startDate && endDate ? (
                                <p>Выбран перерыв с <strong>{startDate.toLocaleDateString('ru-RU')}</strong> по <strong>{endDate.toLocaleDateString('ru-RU')}</strong></p>
                            ) : startDate ? (
                                <p>Выберите дату окончания перерыва</p>
                            ) : (
                                <p>Выберите диапазон дат для перерыва</p>
                            )}
                        </div>

                        <ShowError
                            msg={error}
                        />

                        <div className="timesheet__text-modal">
                            <strong className="timesheet__warning">
                                ⚠️  Вы можете взять перерыв, тогда удалятся все свободные ячейки времени в выбранном интервале.
                            </strong>

                            <strong className="timesheet__warning">
                                ⚠️ Перерыв не может длиться более 2-ух месяцев.
                            </strong>

                            <strong className="timesheet__warning">
                                ⚠️ Ячейки времени, на которые были записаны клиенты, останутся в расписании — необходимо будет провести запланированные консультации.
                            </strong>
                        </div>

                        <button
                            onClick={handleApplyBreak}
                            className="my-button timesheet__button"
                        >
                            Применить
                        </button>
                    </div>
                </div>
            )}
        </AccountLayout>
    );
};

export default observer(TimeSheet);
