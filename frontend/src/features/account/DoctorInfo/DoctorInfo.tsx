import { useContext, useEffect, useState } from 'react';
import './DoctorInfo.scss';
import { Context } from '../../../main';
import { observer } from 'mobx-react-lite';
import { URL } from '../../../http';
import MyInput from '../../../components/UI/MyInput/MyInput';
import Select from 'react-select';
import type { IDoctor } from '../../../pages/account/patient/Specialists/Specialists';
import type { TypeResponse } from '../../../models/response/DefaultResponse';
import type { AxiosError } from 'axios';
import DoctorService from '../../../services/DoctorService';
import MyInputFile from '../../../components/UI/MyInput/MyInputFile';

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
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const [selectedSpecialization, setSelectedSpecialization] = useState<number | null>(null);

    const toggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

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
            for (const spec of specializations) {
                const formData = new FormData();
                const dataToSend = {
                    specialization: selectedSpecialization,
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

                console.log(formData);
                await DoctorService.saveChangeDoctorInfo(store.user.id, formData);
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
        getSpecialization();
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
                            <MyInput
                                type="number"
                                value={experienceYears.toString()}
                                onChange={(e) => setExperienceYears(Number(e))}
                                placeholder="Введите опыт работы"
                                id="experienceYears"
                                label="Опыт работы (лет)"
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
                                            value={availableSpecializations.find(opt => opt.label === spec.specialization) || null}
                                            onChange={(selected) => {
                                                updateSpecialization(index, 'specialization', selected?.label || '')
                                                setSelectedSpecialization(selected?.value);
                                            }}
                                        />

                                        <button
                                            type="button"
                                            className="neg-button"
                                            onClick={() => {
                                                setSpecializations(specializations.filter((_, i) => i !== index));
                                            }}
                                        >
                                            Удалить
                                        </button>
                                    </div>

                                    <MyInputFile
                                        id="diploma"
                                        label="Диплом"
                                        value={spec.diploma}
                                        onChange={(file) => updateSpecialization(index, "diploma", file ?? "")}
                                    />

                                    <MyInputFile
                                        id="license"
                                        label="Лицензия"
                                        value={spec.license}
                                        onChange={(file) => updateSpecialization(index, "license", file ?? "")}
                                    />

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
                                            <button
                                                className="specialization-item__header"
                                                onClick={() => toggle(index)}
                                            >
                                                <span className="specialization-item__name">
                                                    {spec.specialization}
                                                </span>
                                                <span className="specialization-item__arrow">
                                                    {openIndex === index ? "▲" : "▼"}
                                                </span>
                                            </button>

                                            {openIndex === index && (
                                                <div className="specialization-item__content">
                                                    <div className="specialization-docs">
                                                        <div className="specialization-docs__item">
                                                            <span className="specialization-docs__label">Диплом:</span>
                                                            <a
                                                                href={`${URL}/${spec.diploma}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="specialization-docs__link"
                                                            >
                                                                Посмотреть документ
                                                            </a>
                                                        </div>
                                                        <div className="specialization-docs__item">
                                                            <span className="specialization-docs__label">Лицензия:</span>
                                                            <a
                                                                href={`${URL}/${spec.license}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="specialization-docs__link"
                                                            >
                                                                Посмотреть документ
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
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
                        <button
                            className="my-button"
                            onClick={saveChanges}
                        >
                            Сохранить изменения
                        </button>
                        <button
                            className="neg-button"
                            onClick={() => {
                                getDoctorInfo();
                                setEdit(false);
                            }}
                        >
                            Отмена
                        </button>
                    </div>
                ) : (
                    <button
                        className="my-button"
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