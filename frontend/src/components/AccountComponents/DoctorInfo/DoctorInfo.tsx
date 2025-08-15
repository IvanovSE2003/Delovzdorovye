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
                            <input
                                type="file"
                                onChange={(e) => handleFileChange(e, 'diploma')}
                            />
                            {diplomaFile && <span>{diplomaFile.name}</span>}
                        </div>
                        
                        <div className="form-group">
                            <label><strong>Лицензия:</strong></label>
                            <input
                                type="file"
                                onChange={(e) => handleFileChange(e, 'license')}
                            />
                            {licenseFile && <span>{licenseFile.name}</span>}
                        </div>
                    </>
                ) : (
                    <>
                        <span><strong>Специализация:</strong> {specialization}</span> 
                        <span><strong>Диплом о профильном образовании:</strong> 
                            {diplomaFile ? diplomaFile.name : ' Файл не загружен'}
                        </span>
                        <span><strong>Лицензия:</strong> 
                            {licenseFile ? licenseFile.name : ' Файл не загружен'}
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