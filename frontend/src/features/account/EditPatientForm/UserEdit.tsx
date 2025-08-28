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
    const [surgeries, setSurgeries] = useState<Surgery[]>(patientData.medicalData.surgeries);
    const [allergies, setAllergies] = useState<Allergy[]>(patientData.medicalData.allergies);
    const [medications, setMedications] = useState<Medication[]>(patientData.medicalData.medications);
    const [examinations, setExaminations] = useState<Examination[]>(patientData.medicalData.examinations);
    const [analyses, setAnalyses] = useState<Analysis[]>(patientData.medicalData.analyses);

    const addNewSurgery = () => {
        const newSurgery: Surgery = {
            id: Date.now(),
            year: 0,
            description: ''
        };
        setSurgeries([...surgeries, newSurgery]);
    };

    const handleSurgeryChange = (id: number, field: keyof Surgery, value: string) => {
        setSurgeries(surgeries.map(s =>
            s.id === id ? { ...s, [field]: value } : s
        ));
    };

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

    const deleteRecord = (type: keyof PatientData['medicalData'], id: string) => {
        switch (type) {
            case 'surgeries':
                setSurgeries(surgeries.filter(s => s.id !== Number(id)));
                break;
        }
    };

    return (
        <div className="edit-form">
            <h3>Редактирование данных пациента</h3>

            <div className="edit-form__section">
                <h2>Хирургические вмешательства</h2>
                {surgeries.map((surgery, index) => (
                    <div key={surgery.id} className="edit-form__record">
                        <h4>Запись #{index + 1}</h4>
                        <div className="edit-form__group">
                            <label>Год:</label>
                            <input
                                type="text"
                                value={surgery.year}
                                // onChange={(e) => handleSurgeryChange(surgery.id, 'year', e.target.value)}
                            />
                        </div>
                        <div className="edit-form__group">
                            <label>Описание:</label>
                            <textarea
                                value={surgery.description}
                                // onChange={(e) => handleSurgeryChange(surgery.id, 'description', e.target.value)}
                            />
                        </div>
                        <button
                            className="delete-btn"
                            // onClick={() => deleteRecord('surgeries', surgery.id.toString())}
                        >
                            Удалить
                        </button>
                    </div>
                ))}
                <button
                    className="edit-form__add"
                    onClick={addNewSurgery}
                >
                    + Добавить вмешательство
                </button>
            </div>

            <div className="edit-form__section">
                <h2>Аллергии</h2>
                {allergies 
                    ? allergies.map((allergy, index) => (
                        <div key={allergy.id} className="edit-form__record">
                            <h4>Запись #{index + 1}</h4>
                            <div className="edit-form__group">
                                <label>Тип:</label>
                                <input
                                    type="text"
                                    value={allergy.type}
                                // onChange={(e) => handleSurgeryChange(allergy.id, '', e.target.value)}
                                />
                            </div>
                            <div className="edit-form__group">
                                <label>Описание:</label>
                                <textarea
                                    value={allergy.description}
                                // onChange={(e) => handleSurgeryChange(surgery.id, 'description', e.target.value)}
                                />
                            </div>
                            <button
                                className="delete-btn"
                                // onClick={() => deleteRecord('allergies', allergy.id.toString())}
                            >
                                Удалить
                            </button>
                        </div>
                    ))
                    : <div>Данные не найдены</div>
                }
                <button
                    className="edit-form__add"
                    onClick={addNewSurgery}
                >
                    + Добавить аллергию
                </button>
            </div>


            <div className="edit-form__actions">
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