import { observer } from "mobx-react-lite";
import type { ConsultationData } from "../../../components/UI/Modals/EditModal/EditModal";
import UserRecordModal from "../../../components/UI/Modals/RecordModal/UserRecordModal";
import { Context } from "../../../main";
import AccountLayout from "../AccountLayout";
import { useContext, useEffect, useState } from "react";
import ConsultationService from "../../../services/ConsultationService";
import type { TypeResponse } from "../../../models/response/DefaultResponse";
import type { AxiosError } from "axios";
import type { Consultation } from "../../../features/account/UpcomingConsultations/UpcomingConsultations";
import { Link } from "react-router";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import { getDateLabel } from "../../../hooks/DateHooks";

dayjs.locale("ru");

const PAGE_SIZE = 4;

const Main: React.FC = () => {
    const { store } = useContext(Context);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [upcomingConsultations, setUpcomingConsultations] = useState<Consultation[]>([]);
    const [page, setPage] = useState<number>(1);
    const [total, setTotal] = useState<number>(0);

    const handleRecordConsultation = async (data: ConsultationData) => {
        const RecordData = {
            ...data,
            userId: store.user.id,
        };

        if (RecordData.otherProblem) {
            console.log("Была выбрана другая проблема!");
            return;
        } else {
            await ConsultationService.createAppointment(RecordData);
            fetchUpcomingConsultations(page);
        }
    };

    const fetchUpcomingConsultations = async (currentPage: number) => {
        try {
            const response = await ConsultationService.getAllConsultations(PAGE_SIZE, currentPage, {
                userId: store.user.id.toString(),
                consultation_status: "UPCOMING",
            });

            // предполагаю, что API возвращает totalCount (проверь)
            setTotal(response.data.totalCount ?? 0);

            setUpcomingConsultations(response.data.consultations);
        } catch (e) {
            const error = e as AxiosError<TypeResponse>;
            console.error("Ошибка при получении ближайших консультаций: ", error.response?.data.message);
        }
    };

    useEffect(() => {
        fetchUpcomingConsultations(page);
    }, [page]);

    const totalPages = Math.ceil(total / PAGE_SIZE);

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

                <div className="main__other">{/* Дополнительный контент */}</div>
            </div>
        </AccountLayout>
    );
};

export default observer(Main);
