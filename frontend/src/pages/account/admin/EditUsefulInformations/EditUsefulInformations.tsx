import { useState } from "react";
import AccountLayout from "../../AccountLayout";
import "./EditUsefulInformations.scss";
import SpecialistInfoTab from "./LKtabs/SpecialistInfoTab";
import ClientInfoTab from "./LKtabs/ClientInfoTab";
import Tabs from "../../../../components/UI/Tabs/Tabs";
import ProblemsTab from "./OtherTabs/ProblemsTab";
import SpecializationsTab from "./OtherTabs/SpecializationsTab";

const EditUsefulInformations: React.FC = () => {
  const [activeTab, setActiveTab] = useState("client");

  return (
    <AccountLayout>
      <div className="page-container edit-info">
        <h1 className="admin-page__title">Редактирование полезной информации</h1>
        <Tabs
          tabs={[
            { name: "client", label: "ЛК клиента" },
            { name: "specialist", label: "ЛК специалиста" },
            { name: "problems", label: "Проблемы" },
            { name: "specializations", label: "Специализации" }
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
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
