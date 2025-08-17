import { useContext, useEffect, useState } from "react";
import './PatientInfo.scss';
import { Context } from "../../../main";
import { observer } from "mobx-react-lite";
import type { PatientData } from "../../../models/PatientData";

const PatientInfo: React.FC = () => {
  const { store } = useContext(Context);
  const [patientData, setPatientData] = useState<PatientData>({} as PatientData);
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
        const data = await store.getPatientData(store.user.id);
        console.log(data)
        setPatientData(data);
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

  const { medicalData } = patientData;

  return (
    <div className="patientinfo">
      <div className="patientinfo__form">
        <h3>Карточка пациента</h3>

        <h2>Хирургические вмешательства</h2>
        <div className="patientinfo__info-section">
          {medicalData.surgeries.length > 0 ? (
            medicalData.surgeries.map((surgery, index) => (
              <div className="patientinfo__block" key={surgery.id}>
                <p><strong>Запись №{index+1}</strong></p>
                <p><strong>Год:</strong> {surgery.year}</p>
                <p><strong>Описание:</strong> {surgery.description || "Нет данных"}</p>
              </div>
            ))
          ) : (
            <p>Нет данных о хирургических вмешательствах</p>
          )}
        </div>

        <h2>Аллергии</h2>
        <div className="patientinfo__info-section">
          {medicalData.allergies.length > 0 ? (
            medicalData.allergies.map((allergy, index) => (
              <div className="patientinfo__block" key={allergy.id}>
                <p><strong>Запись №{index+1}</strong></p>
                <p><strong>Тип:</strong> {allergy.type}</p>
                <p><strong>Описание:</strong> {allergy.description || "Нет данных"}</p>
              </div>
            ))
          ) : (
            <p>Нет данных об аллергиях</p>
          )}
        </div>

        <h2>Лекарства</h2>
        <div className="patientinfo__info-section">
          {medicalData.medications.length > 0 ? (
            medicalData.medications.map((medication, index) => (
              <div className="patientinfo__block" key={medication.id}>
                <p><strong>Запись №{index+1}</strong></p>
                <p><strong>Название:</strong> {medication.name}</p>
                <p><strong>Дозировка:</strong> {medication.dosage || "Нет данных"}</p>
              </div>
            ))
          ) : (
            <p>Нет данных о лекарствах</p>
          )}
        </div>

        <h2>Обследования</h2>
        <div className="patientinfo__info-section">
          {medicalData.examinations.length > 0 ? (
            medicalData.examinations.map((examination, index) => (
              <div className="patientinfo__block" key={examination.id}>
                <p><strong>Запись №{index+1}</strong></p>
                <p><strong>Название:</strong> {examination.name}</p>
                <p><strong>Файл:</strong> {examination.file || "Нет данных"}</p>
              </div>
            ))
          ) : (
            <p>Нет данных о лекарствах</p>
          )}
        </div>

        <h2>Анализы</h2>
        <div className="patientinfo__info-section">
          {medicalData.analyses.length > 0 ? (
            medicalData.analyses.map((analyse, index) => (
              <div className="patientinfo__block" key={analyse.id}>
                <p><strong>Запись №{index+1}</strong></p>
                <p><strong>Название:</strong> {analyse.name}</p>
                <p><strong>Файл:</strong> {analyse.file || "Нет данных"}</p>
              </div>
            ))
          ) : (
            <p>Нет данных о лекарствах</p>
          )}
        </div>

        {/* <h2>Анализы и обследования</h2>
        <div className="info-section">
          <h3>Анализы</h3>
          {medicalData.analyses.length > 0 ? (
            medicalData.analyses.map(analysis => (
              <div key={analysis.id}>
                <p><strong>Название:</strong> {analysis.name || "Не указано"}</p>
                {analysis.file && <p><strong>Файл:</strong> {analysis.file}</p>}
              </div>
            ))
          ) : (
            <p>Нет данных об анализах</p>
          )}

          <h3>Обследования</h3>
          {medicalData.examinations.length > 0 ? (
            medicalData.examinations.map(examination => (
              <div key={examination.id}>
                <p><strong>Название:</strong> {examination.name || "Не указано"}</p>
                {examination.file && <p><strong>Файл:</strong> {examination.file}</p>}
              </div>
            ))
          ) : (
            <p>Нет данных об обследованиях</p>
          )} */}
        {/* </div> */}
      </div>
    </div>
  );
};

export default observer(PatientInfo);