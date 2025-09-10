import { useContext, useEffect, useState } from "react";
import AccountLayout from "../AccountLayout";
import { API_URL } from "../../../http";
import type { TypeResponse } from "../../../models/response/DefaultResponse";
import type { AxiosError } from "axios";
import UserService from "../../../services/UserService";
import { Context } from "../../../main";
import { observer } from "mobx-react-lite";
import { getDateLabel } from "../../../hooks/DateHooks";

export interface Recomendations {
    doctorName: string;
    doctorSurname: string;
    doctorPatronymic?: string;
    date: string;
    time: string;
    recomendation: string | null;
    specialization: string[];
}

const Recomendations: React.FC = () => {
    const { store } = useContext(Context);
    const [recomendations, setRecomendations] = useState<Recomendations[]>([] as Recomendations[])

    // Получение данных о рекомендациях
    const fetchRecomendation = async () => {
        try {
            const response = await UserService.getRecomendation(store.user.id);
            setRecomendations(response.data);
        } catch (e) {
            const error = e as AxiosError<TypeResponse>;
            console.error("Ошибка при получении рекомендаций: ", error.response?.data.message);
        }
    }

    // Получение данных при открытии страницы
    useEffect(() => {
        fetchRecomendation();
    }, [])

    return (
        <AccountLayout>
            <div className="page-container recomendations">

                <h2 className="page-container__title">Рекомендации от специалистов</h2>

                <div className="recomendations__blocks">
                    {recomendations.length > 0 ? recomendations.map((recomend, index) => (
                        <div key={index} className="block">
                            <h3>{recomend.doctorName} {recomend.doctorSurname} {recomend.doctorPatronymic}
                                {` (${recomend.specialization.join(", ")})`}
                            </h3>
                            <div className="block__info">
                                {recomend.recomendation && recomend.recomendation.length > 0 ? (
                                    <a target="_blank" href={`${API_URL}/${recomend.recomendation}`}>Документ</a>
                                ) : (
                                    <div>Документ не был загружен</div>
                                )}
                                <div className="date">
                                    {getDateLabel(recomend.date)}, {recomend.time.slice(0, 5)}
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="block">
                            <h3
                                style={{ textAlign: 'center' }}
                            >
                                Рекомендации для пользователя не найдены
                            </h3>
                        </div>
                    )}
                </div>
            </div>
        </AccountLayout >
    )
}

export default observer(Recomendations);