import { useContext, useEffect, useState } from 'react';
import './DoctorInfo.scss';
import { Context } from '../../../main';
import { observer } from 'mobx-react-lite';
import { URL } from '../../../http';

const DoctorInfo = () => {
    const { store } = useContext(Context);

    const [edit, setEdit] = useState<boolean>(false);
    const [specialization, setSpecialization] = useState<string>('');
    const [experienceYears, setExperienceYears] = useState<number>(0);
    const [diplomaFile, setDiplomaFile] = useState<string | null>(null);
    const [diplomaFileName, setDiplomaFileName] = useState<string>("");
    const [licenseFile, setLicenseFile] = useState<string | null>(null);

    const getDoctorInfo = async () => {
        const data = await store.getDoctorInfo(store.user.id);
        setSpecialization(data.specialization);
        setExperienceYears(data.experienceYears);
        setDiplomaFile(data.diploma);
        setLicenseFile(data.license);
    };

    const saveChange = () => {
        console.log({
            specialization,
            experienceYears,
            diplomaFileName,
            licenseFile,
        });
        setEdit(false);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'diploma' | 'license') => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();

            reader.onload = (event) => {
                const result = event.target?.result as string;
                if (type === 'diploma') {
                    setDiplomaFile(result);
                    setDiplomaFileName(file.name);
                } else {
                    setLicenseFile(result);
                    setDiplomaFileName(file.name);
                }
            };

            reader.readAsDataURL(file);
        }
    };

    const handleRemoveFile = (type: 'diploma' | 'license') => {
        if (type === 'diploma') {
            setDiplomaFile(null);
        } else {
            setLicenseFile(null);
        }
    };

    useEffect(() => {
        getDoctorInfo();
    }, []);

    return (
        <div className='doctor-info'>
            <h1 className="doctor-info__title">
                {edit ? "Редактирование данных" : "Карточка специалиста"}
            </h1>
            {!edit && (<div className="doctor-info__subtitle">Полная профессиональная информация</div>)}

            <div className='doctor-info__content'>
                {edit ? (
                    <>
                        <div className="form-group">
                            <label><strong>Специализация:</strong></label>
                            <input
                                type="text"
                                value={specialization}
                                onChange={(e) => setSpecialization(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label><strong>Опыт работы:</strong></label>
                            <input
                                type="number"
                                value={experienceYears}
                                onChange={(e) => setExperienceYears(Number(e.target.value))}
                            />
                        </div>

                        <div className="form-group">
                            <label><strong>Диплом о профильном образовании:</strong></label>
                            <div className="file-upload">
                                {diplomaFile && (
                                    <div className="file-info">
                                        <span className="file-info__name">
                                            Файл загружен (
                                            <a href={`${URL}/${diplomaFileName}`} target="_blank">
                                                {diplomaFileName.length > 20 ? `${diplomaFileName.substring(0, 20)}...` : diplomaFileName}
                                            </a>
                                            )
                                        </span>
                                    </div>
                                )}
                                <div className="file-upload__buttons">
                                    <label className="my-button">
                                        Выберите файл
                                        <input
                                            type="file"
                                            className="file-upload__input"
                                            onChange={(e) => handleFileChange(e, 'diploma')}
                                            accept=".pdf"
                                        />
                                    </label>
                                    <button
                                        className="neg-button"
                                        onClick={() => handleRemoveFile('diploma')}
                                    >
                                        Удалить файл
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label><strong>Лицензия:</strong></label>
                            <div className="file-upload">
                                {licenseFile && (
                                    <div className="file-info">
                                        <span className="file-info__name">Файл загружен (<a href={`${URL}/${licenseFile}`} target="_blank">{licenseFile}</a>)</span>
                                    </div>
                                )}
                                <div className="file-upload__buttons">
                                    <label className="my-button">
                                        Выберите файл
                                        <input
                                            type="file"
                                            className="file-upload__input"
                                            onChange={(e) => handleFileChange(e, 'license')}
                                            accept=".pdf"
                                        />
                                    </label>
                                    <button
                                        className="neg-button"
                                        onClick={() => handleRemoveFile('license')}
                                    >
                                        Удалить файл
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="medical-section">
                            <div className="section-header">
                                <div className="section-icon">💼</div>
                                <h2 className="section-title">Специализации</h2>
                            </div>
                            <div className="record">
                                {specialization
                                    ?
                                    <div className="record-details">
                                        <div className="detail-item">
                                            <span className="detail-label">{specialization}</span>
                                        </div>
                                    </div>
                                    :
                                    <div className="record-not-data">Данных нет</div>
                                }
                            </div>
                        </div>

                        <div className="medical-section">
                            <div className="section-header">
                                <div className="section-icon">⚒️</div>
                                <h2 className="section-title">Опыт работы в годах</h2>
                            </div>
                            <div className="record">
                                <div className="record-details">
                                    <div className="detail-item">
                                        <span className="detail-label">{experienceYears}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="medical-section">
                            <div className="section-header">
                                <div className="section-icon">📜</div>
                                <h2 className="section-title">Диплом</h2>
                            </div>
                            <div className="record">
                                <div className="record-details">
                                    <div className="detail-item">
                                        {diplomaFileName ? (
                                            <span className="detail-label"><a href={`${URL}/${diplomaFileName}`} target="_blank">{diplomaFileName}</a></span>
                                        ) : (
                                            'Файл не загружен'
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="medical-section">
                            <div className="section-header">
                                <div className="section-icon">📋</div>
                                <h2 className="section-title">Лицензия</h2>
                            </div>
                            <div className="record">
                                <div className="record-details">
                                    <div className="detail-item">
                                        {licenseFile ? (
                                            <span className="detail-label"><a href={`${URL}/${licenseFile}`} target="_blank">{licenseFile}</a></span>
                                        ) : (
                                            'Файл не загружен'
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {edit
                ?
                <div>
                    <button
                        className='my-button width100'
                        onClick={saveChange}
                    >
                        Сохранить
                    </button>
                    <button
                        className='neg-button width100'
                        onClick={() => setEdit(false)}
                    >
                        Отмена
                    </button>
                </div>
                :
                <button
                    className='my-button width100'
                    onClick={() => setEdit(true)}
                >
                    Редактировать
                </button>
            }

        </div>
    );
};

export default observer(DoctorInfo);