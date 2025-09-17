import { useState } from "react";
import { observer } from "mobx-react-lite";
import AccountLayout from "../../AccountLayout";
import BasicDataTab from "./BasicDataTab";
import ProfecionalDataTab from "./ProfecionalDataTab";
import Search from "../../../../components/UI/Search/Search";
import type { IBasicData, IProfData } from "../../../../models/IDatas";
import type { ITab } from "../../../../components/UI/Tabs/Tabs";
import Tabs from "../../../../components/UI/Tabs/Tabs";


type TabType = "basic" | "prof";
export interface DataTabProps {
    searchTerm: string;
    setError: (error: string) => void;
    setMessage: (message: string) => void;
}

const Specialists: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabType>("basic");
    const [searchTerm, setSearchTerm] = useState<string>("");

    // отдельные стейты для вкладок
    const [basicDatas, setBasicDatas] = useState<IBasicData[]>([]);
    const [profecionalDatas, setProfecionalDatas] = useState<IProfData[]>([]);

    const [message, setMessage] = useState<string>("");
    const [error, setError] = useState<string>("");

    // Вкладки
    const tabs: ITab[] = [
        { name: "basic", label: "Основные данные" },
        { name: "prof", label: "Профессиональные данные" }
    ];

    return (
        <AccountLayout>
            {message && <div className="alert alert-success">{message}</div>}
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="page-container">
                <h1 className="admin-page__title">Редактирование профилей</h1>

                {/* Вкладки */}
                <Tabs
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={(tabName) => setActiveTab(tabName as TabType)}
                />

                {/* Поиск */}
                <div className="admin-page__search">
                    <Search
                        placeholder="Поиск по фамилии, имени, отчеству специалиста"
                        value={searchTerm}
                        onChange={setSearchTerm}
                    />
                </div>

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
        </AccountLayout>
    );
};


export default observer(Specialists);