import { useState } from "react";
import type {
    PatientData,
    Surgery,
    Allergy,
    Medication,
    Examination,
    Analysis
} from "../../../models/PatientData";
import './EditPatientForm.scss';

interface EditPatientFormProps {
    patientData: PatientData;
    onSave: (updatedData: PatientData) => void;
    onCancel: () => void;
}

const EditPatientForm: React.FC<EditPatientFormProps> = ({ patientData, onSave, onCancel }) => {
    // Состояния с явным указанием типов
    const [surgeries, setSurgeries] = useState<Surgery[]>(patientData.medicalData.surgeries);
    const [allergies, setAllergies] = useState<Allergy[]>(patientData.medicalData.allergies);
    const [medications, setMedications] = useState<Medication[]>(patientData.medicalData.medications);
    const [examinations, setExaminations] = useState<Examination[]>(patientData.medicalData.examinations);
    const [analyses, setAnalyses] = useState<Analysis[]>(patientData.medicalData.analyses);

    // Создание новой записи с правильным типом
    const addNewSurgery = () => {
        const newSurgery: Surgery = {
            id: Date.now(), // или generateId() если id должен быть string
            year: 0,
            description: ''
        };
        setSurgeries([...surgeries, newSurgery]);
    };

    // Обработчик изменений с правильными типами
    const handleSurgeryChange = (id: number, field: keyof Surgery, value: string) => {
        setSurgeries(surgeries.map(s =>
            s.id === id ? { ...s, [field]: value } : s
        ));
    };

    // Аналогичные функции для других типов данных...

    const handleSave = () => {
        const updatedData: PatientData = {
            ...patientData,
            medicalData: {
                surgeries,
                allergies,
                medications,
                examinations,
                analyses,
            }
        };
        onSave(updatedData);
    };

    // Обработчик удаления записи
    const deleteRecord = (type: keyof PatientData['medicalData'], id: string) => {
        switch (type) {
            case 'surgeries':
                setSurgeries(surgeries.filter(s => s.id !== Number(id)));
                break;
            // Аналогично для других типов...
        }
    };

    return (
        <div className="edit-form">
            <h2>Редактирование данных пациента</h2>

            <div className="form-section">
                <h3>Хирургические вмешательства</h3>
                {surgeries.map((surgery, index) => (
                    <div key={surgery.id} className="form-record">
                        <h4>Запись #{index + 1}</h4>
                        <div className="form-group">
                            <label>Год:</label>
                            <input
                                type="text"
                                value={surgery.year}
                                onChange={(e) => handleSurgeryChange(surgery.id, 'year', e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Описание:</label>
                            <textarea
                                value={surgery.description}
                                onChange={(e) => handleSurgeryChange(surgery.id, 'description', e.target.value)}
                            />
                        </div>
                        <button
                            className="delete-btn"
                            onClick={() => deleteRecord('surgeries', surgery.id.toString())}
                        >
                            Удалить
                        </button>
                    </div>
                ))}
                <button onClick={addNewSurgery}>+ Добавить вмешательство</button>
            </div>

            <div className="form-section">
                <h3>Аллергии</h3>
                {allergies.map((allergy, index) => (
                    <div key={allergy.id} className="form-record">
                        <h4>Запись #{index + 1}</h4>
                        <div className="form-group">
                            <label>Тип:</label>
                            <input
                                type="text"
                                value={allergy.type}
                                // onChange={(e) => handleSurgeryChange(allergy.id, '', e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Описание:</label>
                            <textarea
                                value={allergy.description}
                                // onChange={(e) => handleSurgeryChange(surgery.id, 'description', e.target.value)}
                            />
                        </div>
                        <button
                            className="delete-btn"
                            onClick={() => deleteRecord('allergies', allergy.id.toString())}
                        >
                            Удалить
                        </button>
                    </div>
                ))}
                <button onClick={addNewSurgery}>+ Добавить аллергию</button>
            </div>


            <div className="form-actions">
                <button className="save-btn" onClick={handleSave}>
                    Сохранить изменения
                </button>
                <button className="cancel-btn" onClick={onCancel}>
                    Отмена
                </button>
            </div>
        </div>
    );
};

export default EditPatientForm;