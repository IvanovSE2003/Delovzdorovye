import { useEffect, useState } from "react";
import type { InfoBlock } from "../../models/InfoBlock";
import HomeService from "../../services/HomeService";
import AccountLayout from "./AccountLayout";
import { processError } from "../../helpers/processError";
import LoaderUsefulInfo from "../../components/UI/LoaderUsefulInfo/LoaderUsefulInfo";

interface UsefulInfoLayoutProps {
    content: string;
}

const UsefulInfoLayout: React.FC<UsefulInfoLayoutProps> = ({ content }) => {
    const [data, setData] = useState<InfoBlock[]>([] as InfoBlock[]);
    const [loading, setLoading] = useState<boolean>(false);

    // Загрузка полезной информации
    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await HomeService.getContent(content);
            setData(response.data.contents);
        } catch (e) {
            processError(e, "Ошибка при загрузке полезной информации");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, [])

    if (loading) return (
        <AccountLayout>
            <div className="page-container">
                <h1 className="consultations-doctor__main-title">Полезная информация</h1>
                <LoaderUsefulInfo />
            </div>
        </AccountLayout>
    )

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
                <h1 className="consultations-doctor__main-title">Полезная информация</h1>
                <div className="usefulinfo">
                    {data.map((p: InfoBlock) =>
                        <div key={p.id} className="usefulinfo-block">
                            <h2 className="usefulinfo-block__title">{p.header}</h2>
                            <p className="usefulinfo-block__text">{p.text}</p>
                        </div>
                    )}
                </div>
            </div>
        </AccountLayout>
    )
}

export default UsefulInfoLayout;