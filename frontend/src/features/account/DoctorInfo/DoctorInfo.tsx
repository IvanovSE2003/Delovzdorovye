import { useState } from 'react';
import './DoctorInfo.scss';

const DoctorInfo = () => {
    const [edit, setEdit] = useState<boolean>(false);
    const [specialization, setSpecialization] = useState<string>('');
    const [diplomaFile, setDiplomaFile] = useState<File | null>(null);
    const [licenseFile, setLicenseFile] = useState<File | null>(null);

    const saveChange = () => {
        // Здесь можно добавить логику сохранения данных (например, API-запрос)
        console.log({
            specialization,
            diplomaFile,
            licenseFile
        });
        setEdit(false);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'diploma' | 'license') => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (type === 'diploma') {
                setDiplomaFile(file);
            } else {
                setLicenseFile(file);
            }
        }
    };

    const handleRemoveFile = (type: 'diploma' | 'license') => {
        if (type === 'diploma') {
            setDiplomaFile(null);
        } else {
            setLicenseFile(null);
        }
    };

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
                            <label><strong>Диплом о профильном образовании:</strong></label>
                            <div className="file-upload">
                                <div className="file-upload__buttons">
                                    <label className="file-upload__label">
                                        Выберите файл
                                        <input
                                            type="file"
                                            className="file-upload__input"
                                            onChange={(e) => handleFileChange(e, 'diploma')}
                                            accept=".pdf,.png,.jpeg,.jpg"
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
                            {diplomaFile && (
                                <div className="file-info">
                                    <span className="file-info__name">{diplomaFile.name}</span>
                                    <span className="file-info__size">({(diplomaFile.size / 1024).toFixed(2)} KB)</span>
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label><strong>Лицензия:</strong></label>
                            <div className="file-upload">
                                <div className="file-upload__buttons">
                                    <label className="file-upload__label">
                                        Выберите файл
                                        <input
                                            type="file"
                                            className="file-upload__input"
                                            onChange={(e) => handleFileChange(e, 'license')}
                                            accept=".pdf,.png,.jpeg,.jpg"
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
                            {licenseFile && (
                                <div className="file-info">
                                    <span className="file-info__name">{licenseFile.name}</span>
                                    <span className="file-info__size">({(licenseFile.size / 1024).toFixed(2)} KB)</span>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <>
                        <span><strong>Специализация: </strong> {specialization}</span>
                        <span><strong>Диплом о профильном образовании: </strong>
                            {diplomaFile ? (
                                <span className="file-info__name">{diplomaFile.name} (<a href="#">перейти</a>)</span>
                            ) : (
                                'Файл не загружен'
                            )}
                        </span>
                        <span><strong>Лицензия: </strong>
                            {licenseFile ? (
                                <span className="file-info__name">{licenseFile.name} (<a href="#">перейти</a>)</span>
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

export default DoctorInfo;