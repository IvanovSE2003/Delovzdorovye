import { useState } from "react";
import AccountLayout from "../../AccountLayout";
import "./EditUsefulInformations.scss";
import ClientInfoTab from "./ClientInfoTab";
import SpecialistInfoTab from "./SpecialistInfoTab";
import ProblemsTab from "./ProblemsTab";
import SpecializationsTab from "./SpecializationsTab";
import MainTab from "./MainTab";

type TabType = "client" | "specialist" | "problems"| "specializations" | "main";

const EditUsefulInformations: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("main");

  return (
    <AccountLayout>
      <div className="page-container edit-info">
        <h1 className="admin-page__title">Редактирование полезной информации</h1>

        <div className="edit-info__tabs">
          <button
            className={`edit-info__tab ${activeTab === "main" ? "edit-info__tab--active" : ""}`}
            onClick={() => setActiveTab("main")}
          >
            Главная страница
          </button>

          <button
            className={`edit-info__tab ${activeTab === "client" ? "edit-info__tab--active" : ""}`}
            onClick={() => setActiveTab("client")}
          >
            ЛК клиента
          </button>
          <button
            className={`edit-info__tab ${activeTab === "specialist" ? "edit-info__tab--active" : ""}`}
            onClick={() => setActiveTab("specialist")}
          >
            ЛК специалиста
          </button>
          <button
            className={`edit-info__tab ${activeTab === "problems" ? "edit-info__tab--active" : ""}`}
            onClick={() => setActiveTab("problems")}
          >
            Проблемы
          </button>
          <button
            className={`edit-info__tab ${activeTab === "specializations" ? "edit-info__tab--active" : ""}`}
            onClick={() => setActiveTab("specializations")}
          >
            Специализации
          </button>
        </div>

        <div className="edit-info__content">
          {activeTab === "client" && <ClientInfoTab />}
          {activeTab === "specialist" && <SpecialistInfoTab />}
          {activeTab === "problems" && <ProblemsTab />}
          {activeTab === "specializations" && <SpecializationsTab/>}
          {activeTab === "main" && <MainTab/>}
        </div>
      </div>
    </AccountLayout>
  );
};

export default EditUsefulInformations;
