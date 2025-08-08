import React, { useContext, useEffect, useState } from "react";
import './MainPersonal.scss';
import { Context } from "../../main";
import { observer } from "mobx-react-lite";

interface PatientData {
  id: number;
  generalInfo: {
    clinical_diseases: string;
    postponed_operations: string;
  };
  analysesExaminations: {
    recent_analyses_for_the_last_year: string;
  };
  additionally: {
    [key: string]: string;
  };
  createdAt: string;
  updatedAt: string;
  userId: number;
}

const MainPersonal: React.FC = () => {
  const { store } = useContext(Context);
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPatientData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!store.user?.id) {
          throw new Error("Пользователь не авторизован");
        }
        const data = await store.getPatientData(store.user.id) as unknown as PatientData;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Не удалось загрузить данные пациента');
      } finally {
        setLoading(false);
      }
    };
    
    loadPatientData();
  }, [store, store.user?.id]);

  if (loading) {
    return <div className="loading">Загрузка данных...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!patientData) {
    return <div>Данные пациента отсутствуют</div>;
  }

  return (
    <div className="content">
      <div className="content__form-client">
        <h2>Общая информация</h2>
        <div className="info-section">
          <p><strong>Клинические заболевания:</strong> {patientData.generalInfo.clinical_diseases}</p>
          <p><strong>Отложенные операции:</strong> {patientData.generalInfo.postponed_operations}</p>
        </div>

        <h2>Анализы и обследования</h2>
        <div className="info-section">
          <p><strong>Последние анализы за год:</strong> {patientData.analysesExaminations.recent_analyses_for_the_last_year}</p>
        </div>

        <h2>Дополнительно</h2>
        <div className="info-section">
          {Object.entries(patientData.additionally).map(([key, value]) => (
            <p key={key}>
              <strong>{key}:</strong> {value}
            </p>
          ))}
        </div>

        <button className="submit-button">Сохранить</button>
      </div>
    </div>
  );
};

export default observer(MainPersonal);