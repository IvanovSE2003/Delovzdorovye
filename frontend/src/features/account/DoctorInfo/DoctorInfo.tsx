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
            diplomaFile,
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
                } else {
                    setLicenseFile(result);
                }
            };

            reader.readAsDataURL(file); // Конвертируем в base64
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
            {edit && <h1>Редактирование данных</h1>}

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
                                        <span className="file-info__name">Файл загружен (<a href={`${URL}/${diplomaFile}`} target="_blank">{diplomaFile}</a>)</span>
                                    </div>
                                )}
                                <div className="file-upload__buttons">
                                    <label className="file-upload__label">
                                        Выберите файл
                                        <input
                                            type="file"
                                            className="file-upload__input"
                                            onChange={(e) => handleFileChange(e, 'diploma')}
                                            accept=".pdf"
                                        />
                                    </label>
                                    <button
                                        className="file-remove-button"
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
                                    <label className="file-upload__label">
                                        Выберите файл
                                        <input
                                            type="file"
                                            className="file-upload__input"
                                            onChange={(e) => handleFileChange(e, 'license')}
                                            accept=".pdf"
                                        />
                                    </label>
                                    <button
                                        className="file-remove-button"
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
                        <span><strong>Специализация: </strong> {specialization} </span>
                        <span><strong>Опыт работы в годах: </strong> {experienceYears} </span>
                        <span><strong>Диплом о профильном образовании: </strong>
                            {diplomaFile ? (
                                <span className="file-info__name"><a href={`${URL}/${diplomaFile}`} target="_blank">{diplomaFile}</a></span>
                            ) : (
                                'Файл не загружен'
                            )}
                        </span>
                        <span><strong>Лицензия: </strong>
                            {licenseFile ? (
                                <span className="file-info__name"><a href={`${URL}/${licenseFile}`} target="_blank">{licenseFile}</a></span>
                            ) : (
                                'Файл не загружен'
                            )}
                        </span>
                    </>
                )}
            </div>

            <button
                className='auth__button'
                onClick={edit ? saveChange : () => setEdit(true)}
            >
                {edit ? 'Сохранить' : 'Редактировать'}
            </button>
        </div>
    );
};

export default observer(DoctorInfo);