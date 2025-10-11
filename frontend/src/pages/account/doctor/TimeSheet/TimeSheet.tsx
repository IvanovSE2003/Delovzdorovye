import { useContext, useState } from "react";
import AccountLayout from "../../AccountLayout";
import { Context } from "../../../../main";
import { observer } from "mobx-react-lite";
import ScheduleGrid from "../../../../components/UI/Schedule/Schedule";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ru } from "date-fns/locale";
import ShowError from "../../../../components/UI/ShowError/ShowError";
import "./TimeSheet.scss";
import DoctorService from "../../../../services/DoctorService";
import { processError } from "../../../../helpers/processError";
import ModalHeader from "../../../../components/UI/Modals/ModalHeader/ModalHeader";
export type SlotStatus = "closed" | "open" | "booked";

const TimeSheet: React.FC = () => {
    const { store } = useContext(Context);
    const [modal, setModal] = useState<boolean>(false);
    const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
    const [error, setError] = useState<{ id: number; message: string }>({ id: 0, message: "" })
    const [message, setMessage] = useState<{ id: number; message: string }>({ id: 0, message: "" });
    const [updateCounter, setUpdateCounter] = useState<number>(0);
    const [startDate, endDate] = dateRange;

    // Обработка изменения расписания
    const handleScheduleChange = (slots: Record<string, SlotStatus>) => {
        // console.log("Текущее расписание:", slots);
    };

    // Обработка взятия перерыва
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
                setMessage({ id: Date.now(), message: response.data.message });
            }
        } catch (e) {
            processError(e, "Ошибка при взятии перерыва", setError);
        } finally {
            setModal(false);
            setUpdateCounter((c) => c + 1)
        }
    };

    // Затврашний день
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    return (
        <AccountLayout>
            <div className="page-container timesheet">
                <ShowError msg={message} mode="MESSAGE" />
                <ShowError msg={error} />

                <ScheduleGrid
                    onChange={handleScheduleChange}
                    updateTrigger={updateCounter}
                    userId={store.user.id}
                    handleBreak={() => setModal(true)}
                />
            </div>

            {modal && (
                <div className="modal">
                    <div className="timesheet__modal">
                        <ModalHeader title="Взять перерыв" onClose={() => setModal(false)} />

                        <div className="timesheet__date">
                            <div className="timesheet__celendar">
                                <DatePicker
                                    selected={startDate}
                                    onChange={(update: [Date | null, Date | null]) => setDateRange(update)}
                                    startDate={startDate}
                                    endDate={endDate}
                                    minDate={tomorrow}
                                    maxDate={new Date(new Date().setMonth(new Date().getMonth() + 2))}
                                    locale={ru}
                                    selectsRange
                                    dateFormat="dd.MM.yyyy"
                                    inline
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

                        <div className="timesheet__text-modal">
                            <strong className="timesheet__warning">
                                ⚠️  Вы можете взять перерыв, тогда удалятся все свободные ячейки времени в выбранном интервале.
                            </strong>

                            <strong className="timesheet__warning">
                                ⚠️ Перерыв не может длиться более 2-х месяцев.
                            </strong>

                            <strong className="timesheet__warning">
                                ⚠️ Ячейки времени, на которые были записаны клиенты, останутся в расписании — необходимо будет провести запланированные консультации или согласовать с администратором.
                            </strong>
                        </div>

                        <ShowError
                            msg={error}
                        />

                        <button
                            onClick={handleApplyBreak}
                            className="my-button timesheet__button"
                        >
                            Применить
                        </button>
                    </div>
                </div>
            )
            }
        </AccountLayout >
    );
};

export default observer(TimeSheet);
