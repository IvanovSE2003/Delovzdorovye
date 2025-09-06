import { useEffect, useState } from "react";
import AccountLayout from "../AccountLayout";
import type { InfoBlock } from "../admin/EditUsefulInformations/EditUsefulInformations";
import type { AxiosError } from "axios";
import type { TypeResponse } from "../../../models/response/DefaultResponse";
import AdminService from "../../../services/AdminService";

const UsefulInfo: React.FC = () => {
    const [data, setData] = useState<InfoBlock[]>([] as InfoBlock[]);

    // Получение полезной информации для клиента
    const fetchData = async () => {
        try {
            const response = await AdminService.getClientUsefulBlock();
            setData(response.data)
            console.log(response.data);
        } catch (e) {
            const error = e as AxiosError<TypeResponse>
            console.error("Ошибка при получение полезной информации: ", error.response?.data.message);
        }
    }

    // Получение данных при загрузки страницы
    useEffect(() => {
        fetchData();
    }, [])

    if (data.length === 0) return (
        <AccountLayout>
            <div className="userfulinfo__none">нет данных</div>
        </AccountLayout>
    );

    return (
        <AccountLayout>
            <h2 className="userfulinfo__title">Полезная информация</h2>
            <div className="userfulinfo__blocks">
                {data && data.map(d => (
                    <div className="userfulinfo__block">
                        <h3 className="userfulinfo__block__title">{d.header}</h3>
                        <p className="userfulinfo__block__text">{d.text}</p>
                    </div>
                ))}
            </div>
        </AccountLayout>
    )
}

export default UsefulInfo;