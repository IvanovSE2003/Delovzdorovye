import { useContext, useEffect, useState } from 'react';
import './DoctorInfo.scss';
import { Context } from '../../../main';
import { observer } from 'mobx-react-lite';
import $api, { API_URL, URL } from '../../../http';
import MyInput from '../../../components/UI/MyInput/MyInput';
import Select from 'react-select';
import type { IDoctor } from '../../../pages/account/patient/Specialists/Specialists';
import type { TypeResponse } from '../../../models/response/DefaultResponse';
import type { AxiosError } from 'axios';
import DoctorService from '../../../services/DoctorService';

interface SpecializationForm {
    specialization: string;
    diploma: string | File;
    license: string | File;
}


const DoctorInfo = () => {
    const { store } = useContext(Context);

    const [edit, setEdit] = useState<boolean>(false);
    const [experienceYears, setExperienceYears] = useState<number>(0);
    const [specializations, setSpecializations] = useState<SpecializationForm[]>([]);
    const [availableSpecializations, setAvailableSpecializations] = useState<any[]>([]);

    const getDoctorInfo = async () => {
        try {
            const data: IDoctor = await store.getDoctorInfo(store.user.id);
            setExperienceYears(data.experienceYears || 0);

            // Преобразуем специализации в форму для редактирования
            const transformedSpecs = data.profData.map(spec => ({
                specialization: spec.specialization,
                diploma: spec.diploma,
                license: spec.license
            }));

            setSpecializations(transformedSpecs);
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
        }
    };

    const saveChanges = async () => {
        try {
            // Отправляем каждую специализацию отдельным запросом
            for (const spec of specializations) {
                const formData = new FormData();
                const dataToSend = {
                    specialization: spec.specialization,
                    diploma: spec.diploma instanceof File ? null : spec.diploma,
                    license: spec.license instanceof File ? null : spec.license
                };

                formData.append('data', JSON.stringify(dataToSend));

                if (spec.diploma instanceof File) {
                    formData.append('diploma', spec.diploma);
                }
                if (spec.license instanceof File) {
                    formData.append('license', spec.license);
                }

                await fetch(`http://localhost:5000/api/doctor/${store.user.id}`, {
                    method: 'PUT',
                    body: formData
                });
            }

            setEdit(false);
        } catch (error) {
            console.error('Ошибка сохранения:', error);
        }
    };





    const addSpecialization = () => {
        setSpecializations([...specializations, { specialization: "", diploma: "", license: "" }]);
    };

    const updateSpecialization = (index: number, field: keyof SpecializationForm, value: any) => {
        const updated = [...specializations];
        updated[index] = { ...updated[index], [field]: value };
        setSpecializations(updated);
    };

    const getSpecialization = async () => {
        try {
            const response = await DoctorService.getSpecializations();
            const specializations = response.data.map(item => ({ value: item.id, label: item.name }));
            setAvailableSpecializations(specializations);
            console.log(response.data.map(value => value.name));
        } catch (e) {
            const error = e as AxiosError<TypeResponse>;
            console.error("Ошибка при получении списка специализации: ", error.response?.data.message)
        }
    }

    useEffect(() => {
        getDoctorInfo();
    }, []);

    if (!store.user) {
        return <div>Загрузка...</div>;
    }

    return (
        <div className='doctor-info'>
            <div className="doctor-info__header">
                <h1 className="doctor-info__title">
                    {edit ? "Редактирование профиля" : "Профиль специалиста"}
                </h1>
                <p className="doctor-info__subtitle">
                    {edit ? "Обновите вашу профессиональную информацию" : "Ваша профессиональная информация"}
                </p>
            </div>

            <div className='doctor-info__content'>
                {edit ? (
                    <div className="doctor-info__edit">
                        <div className="form-section">
                            <label className="form-section__label">Опыт работы (лет)</label>
                            <MyInput
                                type="number"
                                value={experienceYears.toString()}
                                onChange={(e) => setExperienceYears(Number(e))}
                                placeholder="Введите опыт работы" id={''} label={''}
                            />
                        </div>

                        <div className="form-section">
                            <div className="form-section__header">
                                <label className="form-section__label">Специализации</label>
                                <button
                                    type="button"
                                    className="add-button"
                                    onClick={addSpecialization}
                                >
                                    + Добавить специализацию
                                </button>
                            </div>

                            {specializations.map((spec, index) => (
                                <div key={index} className="specialization-form">
                                    <div className="specialization-form__header">
                                        <Select
                                            options={availableSpecializations}
                                            placeholder="Выберите специализацию"
                                            className="doctor-info__select"
                                            classNamePrefix="custom-select"
                                            value={availableSpecializations.find(opt => opt.value === spec.specialization)}
                                            onMenuOpen={getSpecialization}
                                            onChange={(selected) =>
                                                updateSpecialization(index, 'specialization', selected?.value || '')
                                            }
                                        />

                                        <button
                                            type="button"
                                            className="remove-button"
                                            onClick={() => {
                                                setSpecializations(specializations.filter((_, i) => i !== index));
                                            }}
                                        >
                                            ❌
                                        </button>
                                    </div>

                                    <div className="file-upload">
                                        <label>Диплом:</label>
                                        <input
                                            type="file"
                                            accept=".pdf,.jpg,.jpeg"
                                            onChange={(e) => {
                                                if (e.target.files?.[0]) {
                                                    updateSpecialization(index, 'diploma', e.target.files[0]);
                                                }
                                            }}
                                        />
                                        {spec.diploma && (
                                            <span>
                                                {typeof spec.diploma === "string"
                                                    ? spec.diploma
                                                    : (spec.diploma as File).name}
                                            </span>
                                        )}
                                    </div>

                                    <div className="file-upload">
                                        <label>Лицензия:</label>
                                        <input
                                            type="file"
                                            accept=".pdf,.jpg,.jpeg"
                                            onChange={(e) => {
                                                if (e.target.files?.[0]) {
                                                    updateSpecialization(index, 'license', e.target.files[0]);
                                                }
                                            }}
                                        />
                                        {spec.license && (
                                            <span>
                                                {typeof spec.license === "string"
                                                    ? spec.license
                                                    : (spec.license as File).name}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}

                        </div>
                    </div>
                ) : (
                    <div className="doctor-info__view">
                        <div className="info-section">
                            <div className="info-section__header">
                                <div className="info-section__icon">⚒️</div>
                                <h3 className="info-section__title">Опыт работы</h3>
                            </div>
                            <div className="info-section__content">
                                <div className="info-item">
                                    <span className="info-item__value">
                                        {experienceYears} {experienceYears === 1 ? 'год' :
                                            experienceYears < 5 ? 'года' : 'лет'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="info-section">
                            <div className="info-section__header">
                                <div className="info-section__icon">💼</div>
                                <h3 className="info-section__title">Специализации</h3>
                            </div>
                            <div className="info-section__content">
                                {specializations.length > 0 ? (
                                    specializations.map((spec, index) => (
                                        <div key={index} className="specialization-item">
                                            <div className="specialization-item__header">
                                                <h4 className="specialization-item__name">{spec.specialization}</h4>
                                            </div>
                                            <div className="specialization-item__docs">
                                                {spec.diploma && (
                                                    <div className="doc-item">
                                                        <span className="doc-item__label">Диплом:</span>
                                                        <a
                                                            href={`${URL}/${spec.diploma}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="doc-item__link"
                                                        >
                                                            Посмотреть документ
                                                        </a>
                                                    </div>
                                                )}
                                                {spec.license && (
                                                    <div className="doc-item">
                                                        <span className="doc-item__label">Лицензия:</span>
                                                        <a
                                                            href={`${URL}/${spec.license}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="doc-item__link"
                                                        >
                                                            Посмотреть документ
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="info-item">
                                        <span className="info-item__value">Специализации не добавлены</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="doctor-info__actions">
                {edit ? (
                    <div className="action-buttons">
                        <button className="action-button action-button--primary" onClick={saveChanges}>
                            Сохранить изменения
                        </button>
                        <button
                            className="action-button action-button--secondary"
                            onClick={() => {
                                getDoctorInfo(); // Сбрасываем изменения
                                setEdit(false);
                            }}
                        >
                            Отмена
                        </button>
                    </div>
                ) : (
                    <button
                        className="action-button action-button--primary"
                        onClick={() => setEdit(true)}
                    >
                        Редактировать профиль
                    </button>
                )}
            </div>
        </div>
    );
};

export default observer(DoctorInfo);