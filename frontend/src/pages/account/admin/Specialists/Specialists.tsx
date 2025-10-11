import { useState } from "react";
import { observer } from "mobx-react-lite";
import AccountLayout from "../../AccountLayout";
import BasicDataTab from "./BasicDataTab";
import ProfecionalDataTab from "./ProfecionalDataTab";
import Search from "../../../../components/UI/Search/Search";
import type { IBasicData, IProfData } from "../../../../models/IDatas";
import type { ITab } from "../../../../components/UI/Tabs/Tabs";
import Tabs from "../../../../components/UI/Tabs/Tabs";
import ShowError from "../../../../components/UI/ShowError/ShowError";
import './Specialists.scss';

type TabType = "basic" | "prof";
export interface DataTabProps {
    searchTerm: string;
    setError: (message: { id: number; message: string }) => void;
    setMessage: (message: { id: number; message: string }) => void;
}

const Specialists: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabType>("basic");
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [showInfo, setShowInfo] = useState<boolean>(false);
    const [basicDatas, setBasicDatas] = useState<IBasicData[]>([]);
    const [profecionalDatas, setProfecionalDatas] = useState<IProfData[]>([]);
    const [message, setMessage] = useState<{ id: number; message: string }>({ id: 0, message: "" });
    const [error, setError] = useState<{ id: number; message: string }>({ id: 0, message: "" });

    // Вкладки
    const tabs: ITab[] = [
        { name: "basic", label: "Основные данные" },
        { name: "prof", label: "Профессиональные данные" }
    ];

    const handleInfoClick = () => {
        setShowInfo(!showInfo);
    };

    const infoContent = {
        basic: "В таблице «Основные данные» отображаются все изменения основных данных, внесённые специалистом. К ним относятся ФИО, пол и дата рождения.",
        prof: "В таблице «Профессиональные данные» отображаются все изменения профессиональных данных, внесённые специалистом. К ним относятся диплом об образовании, лицензия и специализация."
    };

    return (
        <AccountLayout>
            <ShowError msg={message} mode="MESSAGE" />
            <ShowError msg={error} />

            <div className="page-container admin-page">
                <h1 className="consultations-doctor__main-title info-title">
                    <span>
                        Изменение данных
                    </span>
                    <span
                        className="info-icon"
                        onClick={handleInfoClick}
                        title="Информация о таблицах"
                    >
                        🛈
                    </span>
                </h1>

                {/* Всплывающая подсказка */}
                {showInfo && (
                    <div className="info-tooltip">
                        <div className="info-tooltip__content">
                            <h3>Информация о таблицах</h3>
                            <p><strong>Основные данные:</strong> {infoContent.basic}</p>
                            <p><strong>Профессиональные данные:</strong> {infoContent.prof}</p>
                            <button
                                className="my-button"
                                onClick={() => setShowInfo(false)}
                            >
                                Закрыть
                            </button>
                        </div>
                    </div>
                )}

                {/* Вкладки */}
                <Tabs
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={(tabName) => setActiveTab(tabName as TabType)}
                />

                {/* Поиск */}
                <Search
                    placeholder="Поиск по ФИО, телефону, почте"
                    value={searchTerm}
                    onChange={setSearchTerm}
                />

                {/* Контент */}
                <div className="edit-info__content">
                    {activeTab === "basic" && (
                        <BasicDataTab
                            basicDatas={basicDatas}
                            searchTerm={searchTerm}
                            setBasicDatas={setBasicDatas}
                            setError={setError}
                            setMessage={setMessage}
                        />
                    )}
                    {activeTab === "prof" && (
                        <ProfecionalDataTab
                            profecionalDatas={profecionalDatas}
                            searchTerm={searchTerm}
                            setProfecionalDatas={setProfecionalDatas}
                            setError={setError}
                            setMessage={setMessage}
                        />
                    )}
                </div>
            </div>
        </AccountLayout >
    );
};

export default observer(Specialists);