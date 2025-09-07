import { useEffect, useState } from "react";
import HomeService from "../../../services/HomeService";
import AccountLayout from "../AccountLayout";
import type { InfoBlock } from "../../../models/InfoBlock";


const UsefulInfo = () => {
    const [data, setData] = useState<InfoBlock[]>([] as InfoBlock[]);

    const fetchData = async () => {
        const response = await HomeService.getContent("useful_info_doctor");
        setData(response.data);
    }

    useEffect(() => {
        fetchData();
    }, [])

    return (
        <AccountLayout>
            <div className="page-container usefulinfo-doctor">
                <h1 className="page-container__title">Полезная информация</h1>
                {data && data.length > 0 ? data.map((p: any) =>
                    <div key={p.id} className="usefulinfo">
                        <div className="usefulinfo-block">
                            <h2 className="usefulinfo-block__title">{p.header}</h2>
                            <p className="usefulinfo-block__text">{p.text}</p>
                        </div>
                    </div>
                ) : (
                    <div className="consultation__empty">
                        Здесь нет данных
                    </div>
                )}
            </div>
        </AccountLayout>
    )
}

export default UsefulInfo;