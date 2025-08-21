import { useContext, useEffect, useState } from "react";
import './PatientInfo.scss';
import { Context } from "../../../main";
import { observer } from "mobx-react-lite";
import type { PatientData } from "../../../models/PatientData";
import Loader from "../../../components/UI/Loader/Loader";
import EditPatientForm from "../EditPatientForm/EditPatientForm";

const PatientInfo: React.FC = () => {
  const { store } = useContext(Context);
  const [patientData, setPatientData] = useState<PatientData>({} as PatientData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  useEffect(() => {
    const loadPatientData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!store.user?.id) {
          throw new Error("Пользователь не авторизован");
        }
        const data = await store.getPatientData(store.user.id);
        setPatientData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Не удалось загрузить данные пациента');
      } finally {
        setLoading(false);
      }
    };

    loadPatientData();
  }, [store, store.user?.id]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSave = async (updatedData: PatientData) => {
    console.log(updatedData);
    // await store.updatePatientData(store.user.id, updatedData);
    // setPatientData(updatedData);
    // setIsEditing(false);
  };

  if (loading) return <Loader />;
  if (error) return <div className="error">{error}</div>;
  if (!patientData) return <div>Данные пациента отсутствуют</div>;

  const { medicalData } = patientData;

  return (
    <div className="patient-card">
      {isEditing ? (
        <EditPatientForm
          patientData={patientData}
          onSave={handleSave}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <>
          <div className="card-header">
            <h1>Карточка пациента</h1>
            <div className="subtitle">Полная медицинская информация</div>
          </div>

          <div className="medical-sections">

            {/* Хирургия */}
            <div className="medical-section">
              <div className="section-header">
                <div className="section-icon">🩺</div>
                <h2 className="section-title">Хирургические вмешательства</h2>
              </div>
              {medicalData.surgeries.length > 0 ? (
                medicalData.surgeries.map((surgery, index) => (
                  <div className="record" key={surgery.id}>
                    <div className="record-header">
                      <span className="record-number">Запись №{index + 1}</span>
                      <span className="record-date">{surgery.year}</span>
                    </div>
                    <div className="record-details">
                      <div className="detail-item">
                        <span className="detail-label">Год:</span>
                        <span className="detail-value">{surgery.year}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Описание:</span>
                        <span className={`detail-value ${!surgery.description ? "no-data" : ""}`}>
                          {surgery.description || "Нет данных"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p>Нет данных</p>
              )}
            </div>

            {/* Аллергии */}
            <div className="medical-section">
              <div className="section-header">
                <div className="section-icon">⚠️</div>
                <h2 className="section-title">Аллергии</h2>
              </div>
              {medicalData.allergies.length > 0 ? (
                medicalData.allergies.map((allergy, index) => (
                  <div className="record" key={allergy.id}>
                    <div className="record-header">
                      <span className="record-number">Запись №{index + 1}</span>
                    </div>
                    <div className="record-details">
                      <div className="detail-item">
                        <span className="detail-label">Тип:</span>
                        <span className="detail-value">{allergy.type || "Не указан"}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Описание:</span>
                        <span className={`detail-value ${!allergy.description ? "no-data" : ""}`}>
                          {allergy.description || "Нет данных"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p>Нет данных</p>
              )}
            </div>

            {/* Лекарства */}
            <div className="medical-section">
              <div className="section-header">
                <div className="section-icon">💊</div>
                <h2 className="section-title">Лекарства</h2>
              </div>
              {medicalData.medications.length > 0 ? (
                medicalData.medications.map((medication, index) => (
                  <div className="record" key={medication.id}>
                    <div className="record-header">
                      <span className="record-number">Запись №{index + 1}</span>
                    </div>
                    <div className="record-details">
                      <div className="detail-item">
                        <span className="detail-label">Название:</span>
                        <span className="detail-value">{medication.name || "Не указано"}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Дозировка:</span>
                        <span className={`detail-value ${!medication.dosage ? "no-data" : ""}`}>
                          {medication.dosage || "Нет данных"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p>Нет данных</p>
              )}
            </div>

            {/* Обследования */}
            <div className="medical-section">
              <div className="section-header">
                <div className="section-icon">🔍</div>
                <h2 className="section-title">Обследования</h2>
              </div>
              {medicalData.examinations.length > 0 ? (
                medicalData.examinations.map((examination, index) => (
                  <div className="record" key={examination.id}>
                    <div className="record-header">
                      <span className="record-number">Запись №{index + 1}</span>
                    </div>
                    <div className="record-details">
                      <div className="detail-item">
                        <span className="detail-label">Название:</span>
                        <span className="detail-value">{examination.name || "Не указано"}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Файл:</span>
                        <span className={`detail-value ${!examination.file ? "no-data" : ""}`}>
                          {examination.file || "Нет данных"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p>Нет данных</p>
              )}
            </div>

            {/* Анализы */}
            <div className="medical-section">
              <div className="section-header">
                <div className="section-icon">🧪</div>
                <h2 className="section-title">Анализы</h2>
              </div>
              {medicalData.analyses.length > 0 ? (
                medicalData.analyses.map((analyse, index) => (
                  <div className="record" key={analyse.id}>
                    <div className="record-header">
                      <span className="record-number">Запись №{index + 1}</span>
                    </div>
                    <div className="record-details">
                      <div className="detail-item">
                        <span className="detail-label">Название:</span>
                        <span className="detail-value">{analyse.name || "Не указано"}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Файл:</span>
                        <span className={`detail-value ${!analyse.file ? "no-data" : ""}`}>
                          {analyse.file || "Нет данных"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p>Нет данных</p>
              )}
            </div>
          </div>

          <div className="edit-btn">
            <button onClick={handleEditClick}>Редактировать данные</button>
          </div>
        </>
      )}
    </div>
  );
};

export default observer(PatientInfo);
