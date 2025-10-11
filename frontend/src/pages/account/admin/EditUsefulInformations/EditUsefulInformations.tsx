import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import AccountLayout from "../../AccountLayout";
import "./EditUsefulInformations.scss";
import SpecialistInfoTab from "./LKtabs/SpecialistInfoTab";
import ClientInfoTab from "./LKtabs/ClientInfoTab";
import Tabs from "../../../../components/UI/Tabs/Tabs";
import ProblemsTab from "./OtherTabs/ProblemsTab";
import SpecializationsTab from "./OtherTabs/SpecializationsTab";

const EditUsefulInformations: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("client");

  // Получаем начальную вкладку из URL
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && ['client', 'specialist', 'problems', 'specializations'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, []);

  // Обновляем URL при изменении вкладки
  useEffect(() => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('tab', activeTab);
    setSearchParams(newSearchParams);
  }, [activeTab]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <AccountLayout>
      <div className="page-container edit-info">
        <h1 className="consultations-doctor__main-title">Редактирование полезной информации</h1>
        <Tabs
          tabs={[
            { name: "client", label: "ЛК клиента" },
            { name: "specialist", label: "ЛК специалиста" },
            { name: "problems", label: "Проблемы" },
            { name: "specializations", label: "Специализации" }
          ]}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          className="edit-info__tabs"
        />

        <div className="edit-info__content">
          {activeTab === "client" && <ClientInfoTab />}
          {activeTab === "specialist" && <SpecialistInfoTab />}
          {activeTab === "problems" && <ProblemsTab />}
          {activeTab === "specializations" && <SpecializationsTab />}
        </div>
      </div>
    </AccountLayout>
  );
};

export default EditUsefulInformations;