import { useContext, useEffect, useState } from "react";
import AccountLayout from "../AccountLayout";
import { API_URL } from "../../../http";
import type { TypeResponse } from "../../../models/response/DefaultResponse";
import type { AxiosError } from "axios";
import UserService from "../../../services/UserService";
import { Context } from "../../../main";
import { observer } from "mobx-react-lite";

export interface Recomendations {
    doctorName: string;
    doctorSurname: string;
    doctorPatronymic?: string;
    date: string;
    time: string;
    recomendation: string | null;
    specialization: string[];
}

const Recomendations = () => {
    const { store } = useContext(Context);
    const [recomendations, setRecomendations] = useState<Recomendations[]>([] as Recomendations[])

    const fetchRecomendation = async () => {
        try {
            const response = await UserService.getRecomendation(store.user.id);
            setRecomendations(response.data);
        } catch(e) {
            const error = e as AxiosError<TypeResponse>;
            console.error("Ошибка при получении рекомендаций: ", error.response?.data.message);
        }
    }

    useEffect(() => {
        fetchRecomendation();
    }, [])

    return (
        <AccountLayout>
            <div className="page-container recomendations">

                <h2 className="page-container__title">Рекомендации от специалистов</h2>

                {recomendations ? recomendations.map(recomend => (
                    <div className="block">
                        <h3>{recomend.doctorName} {recomend.doctorSurname} {recomend.doctorPatronymic} 
                            ({recomend.recomendation})
                        </h3>
                        <div className="block__info">
                            <a href={`${API_URL}/${recomend.recomendation}`}>Документ</a>
                            <div className="date">{recomend.date} {recomend.time}</div>
                        </div>
                    </div>
                )) : (
                    <div className="consultation__empty">Нет данных</div>
                )}

                {/* <div className="recomendations__blocks">
                    <div className="block">
                        <h3>Рекомендация от Анна Петрова, Нутрициолог</h3>
                        <div className="block__info">
                            <a href="/">Документ</a>
                            <div className="date">
                                05.08, 13:33
                            </div>
                        </div>
                    </div>

                    <div className="block">
                        <h3>Рекомендация от Анна Иванова, Психолог</h3>
                        <div className="block__info">
                            <a href="/">Документ</a>
                            <div className="date">
                                04.08, 20:00
                            </div>
                        </div>
                    </div>
                </div> */}

            </div>
        </AccountLayout >
    )
}

export default observer(Recomendations);