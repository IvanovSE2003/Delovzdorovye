import "dayjs/locale/ru";
import { Link } from "react-router";
import { observer } from "mobx-react-lite";
import { useCallback, useContext, useEffect, useState } from "react";
import { Context } from "../../../main";
import AccountLayout from "../AccountLayout";
import { getDateLabel } from "../../../hooks/DateHooks";
import type { ConsultationData } from "../../../components/UI/Modals/EditModal/EditModal";
import type { Consultation } from "../../../features/account/UpcomingConsultations/UpcomingConsultations";
import ConsultationService from "../../../services/ConsultationService";
import UserRecordModal from "../../../components/UI/Modals/RecordModal/UserRecordModal";
import ShowError from "../../../components/UI/ShowError/ShowError";
import { processError } from "../../../helpers/processError";


// Количество элементов на одной "странице"
const PAGE_SIZE = 4;

const Main: React.FC = () => {
    const { store } = useContext(Context);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [upcomingConsultations, setUpcomingConsultations] = useState<Consultation[]>([]);
    const [page, setPage] = useState<number>(1);
    const [total, setTotal] = useState<number>(0);

    const [message, setMessage] = useState<{ id: number; message: string }>({ id: 0, message: "" });

    // Завершение записи на консультацию
    const handleRecordConsultation = async (data: ConsultationData) => {
        const RecordData = {
            ...data,
            userId: store.user.id,
        };

        try {
            if (RecordData.hasOtherProblem) {
                console.log("Это другая проблема: ", RecordData);
                await ConsultationService.createSpecificConsultation(RecordData);
                setMessage({ id: Date.now(), message: "Вы успешно записались на консультацию. В ближайшее время с вами свяжется наш администратор" });
            } else {
                await ConsultationService.createAppointment(RecordData);
                setMessage({ id: Date.now(), message: "Вы успешно записались на консультацию" });
                fetchUpcomingConsultations(page);
            }
        } catch (e) {
            processError(e, "Ошибка при записи на консультацию")
        }
    };

    // Получение данных
    const fetchUpcomingConsultations = useCallback(async (currentPage: number) => {
        try {
            const response = await ConsultationService.getAllConsultations(PAGE_SIZE, currentPage, {
                userId: store.user.id.toString(),
                consultation_status: "UPCOMING",
            });

            setTotal(response.data.totalCount ?? 0);
            setUpcomingConsultations(response.data.consultations);
        } catch (e) {
            processError(e, "Ошибка при получении ближайших консультации");
        }
    }, [store.user.id, PAGE_SIZE]);

    // Получение данных при открытии страницы
    useEffect(() => {
        fetchUpcomingConsultations(page);
    }, [page, fetchUpcomingConsultations]);

    // Итоговое количество страниц
    const totalPages = Math.ceil(total / PAGE_SIZE);

    // Основной рендер
    return (
        <AccountLayout>
            <UserRecordModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onRecord={handleRecordConsultation}
                userId={store.user.id}
            />

            <div className="main">
                <div className="main__main-block">
                    <ShowError msg={message} mode="MESSAGE" />
                    <h2 className="main__main-block__title">Дело всегда в здоровье - начните сейчас!</h2>
                    <p className="main__main-block__text">
                        Наши специалисты составят персональный план по комплексному восстановлению здоровья,
                        учитывая ваши привычки и возможности.
                    </p>

                    <button className="main__main-block__button" onClick={() => setIsModalOpen(true)}>
                        Записаться на консультацию
                    </button>
                </div>

                <div className="main__nearest">
                    <h2 className="main__nearest__title">Ближайшие консультации</h2>

                    {upcomingConsultations.length > 0 ? (
                        <>
                            {upcomingConsultations.map((u) => (
                                <div key={u.id} className="main__nearest__block">
                                    <span>
                                        {getDateLabel(u.date)}, {u.durationTime}
                                    </span>
                                    <div className="main__nearest__specialist">
                                        <strong>Специалист: </strong>
                                        <Link target="_blank" to={`/profile/${u.DoctorUserId}`}>
                                            {u.DoctorName} {u.DoctorSurname} {u?.DoctorPatronymic}
                                        </Link>
                                    </div>
                                </div>
                            ))}

                            {/* Пагинация */}
                            {totalPages > 1 && (
                                <div className="main__pagination">
                                    <button
                                        disabled={page === 1}
                                        onClick={() => setPage((p) => p - 1)}
                                    >
                                        Назад
                                    </button>
                                    <span>
                                        Стр. {page} из {totalPages}
                                    </span>
                                    <button
                                        disabled={page === totalPages}
                                        onClick={() => setPage((p) => p + 1)}
                                    >
                                        Вперёд
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="main__nearest__block">
                            <span style={{ textAlign: "center" }}>Отсутствуют ближайшие консультации</span>
                        </div>
                    )}
                </div>

                <div className="main__other">{/* Пока неизсвестно что здесь будет */}</div>
            </div>
        </AccountLayout>
    );
};

export default observer(Main);
