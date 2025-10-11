import type { AxiosError } from "axios";
import { observer } from "mobx-react-lite";
import { useContext, useState, useEffect } from "react";
import { API_URL } from "../../../../http";
import { Context } from "../../../../main";
import type { TypeResponse } from "../../../../models/response/DefaultResponse";
import UserService from "../../../../services/UserService";
import AccountLayout from "../../AccountLayout";
import './Recomendations.scss';
import { getDateLabel } from "../../../../helpers/formatDatePhone";
import { Link } from "react-router";
import LoaderUsefulInfo from "../../../../components/UI/LoaderUsefulInfo/LoaderUsefulInfo";


export interface Recomendations {
    doctorName: string;
    doctorSurname: string;
    doctorPatronymic?: string;
    doctorUserId: number;
    date: string;
    time: string;
    recomendation: string | null;
    specialization: string[];
}

const Recomendations: React.FC = () => {
    const { store } = useContext(Context);
    const [recomendations, setRecomendations] = useState<Recomendations[]>([] as Recomendations[])
    const [loading, setLoading] = useState<boolean>(false);

    // Получение данных о рекомендациях
    const fetchRecomendation = async () => {
        try {
            setLoading(true);
            const response = await UserService.getRecomendation(store.user.id);
            setRecomendations(response.data);
        } catch (e) {
            const error = e as AxiosError<TypeResponse>;
            console.error("Ошибка при получении рекомендаций: ", error.response?.data.message);
        } finally {
            setLoading(false);
        }
    }

    // Получение данных при открытии страницы
    useEffect(() => {
        fetchRecomendation();
    }, [])

    if(loading) return (
        <AccountLayout>
            <h2 className="consultations-doctor__main-title">Рекомендации от специалистов</h2>
            <LoaderUsefulInfo/>
        </AccountLayout>
    )

    return (
        <AccountLayout>
            <h2 className="consultations-doctor__main-title">Рекомендации от специалистов</h2>
            <div className="page-container recomendations">
                <div className="recomendations__blocks">
                    {recomendations.length > 0 ? recomendations.map((recomend, index) => (
                        <div key={index} className="block">
                            <h3><Link to={`/profile/${recomend.doctorUserId}`}>{recomend.doctorName} {recomend.doctorSurname} {recomend.doctorPatronymic}</Link>
                                {` (${recomend.specialization?.join(", ")})`}
                            </h3>
                            <div className="block__info">
                                {recomend.recomendation && recomend.recomendation.length > 0 ? (
                                    <div>
                                        Рекомендация: {` `}
                                        <Link target="_blank" to={`${API_URL}/${recomend.recomendation}`}>Файл</Link>
                                    </div>
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
                                📋 Рекомендации не найдены
                            </h3>
                        </div>
                    )}
                </div>
            </div>
        </AccountLayout >
    )
}

export default observer(Recomendations);