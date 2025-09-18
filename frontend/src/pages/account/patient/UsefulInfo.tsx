import { useEffect, useState } from "react";
import HomeService from "../../../services/HomeService";
import AccountLayout from "../AccountLayout";
import type { InfoBlock } from "../../../models/InfoBlock";

const UsefulInfo = () => {
    const [data, setData] = useState<InfoBlock[]>([] as InfoBlock[]);

    const fetchData = async () => {
        const response = await HomeService.getContent("useful_info_patient");
        setData(response.data.contents);
    }

    useEffect(() => {
        fetchData();
    }, [])

    if (data.length === 0 || !data) return (
        <AccountLayout>
            <div className="page-container archive">
                <h1 className="page-container__title">Полезная информация</h1>
                <div className="lk-tab lk-tab--empty">
                    <div className="lk-tab__empty-content">
                        <div className="lk-tab__empty-icon">📝</div>
                        <h3 className="lk-tab__empty-title">Пока нет полезной информации</h3>
                        <p className="lk-tab__empty-description">В скором времени она появятся</p>
                    </div>
                </div>
            </div>
        </AccountLayout>
    )

    return (
        <AccountLayout>
            <div className="page-container">
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