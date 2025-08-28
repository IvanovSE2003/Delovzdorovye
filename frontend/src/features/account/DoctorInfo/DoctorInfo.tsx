import { useContext, useEffect, useState } from 'react';
import './DoctorInfo.scss';
import { Context } from '../../../main';
import { observer } from 'mobx-react-lite';
import { URL } from '../../../http';
import MyInputFile from '../../../components/UI/MyInput/MyInputFile';
import FilePreview from '../../../components/UI/MyInput/FilePreview';
import MyInput from '../../../components/UI/MyInput/MyInput';
import Select from 'react-select';

type FileType = 'DIPLOMA' | 'LICENSE';

const DoctorInfo = () => {
    const { store } = useContext(Context);

    const [edit, setEdit] = useState<boolean>(false);
    const [specialization, setSpecialization] = useState<string>('');
    const [experienceYears, setExperienceYears] = useState<number>(0);

    const [diplomas, setDiplomas] = useState<File[]>([]);
    const [licenses, setLicenses] = useState<File[]>([]);

    const [diplomaFileNames, setDiplomaFileNames] = useState<string[]>([]);
    const [licenseFileNames, setLicenseFileNames] = useState<string[]>([]);

    const getDoctorInfo = async () => {
        const data = await store.getDoctorInfo(store.user.id);
        setSpecialization(data.specialization || '');
        setExperienceYears(data.experienceYears || 0);
        setDiplomaFileNames(data.diploma ? [data.diploma] : []);
        setLicenseFileNames(data.license ? [data.license] : []);
    };

    const saveChange = () => {
        console.log({
            specialization,
            experienceYears,
            diplomas,
            licenses,
        });
        setEdit(false);
    };

    const handleFileChange = (files: File[], type: FileType) => {
        if (type === 'DIPLOMA') setDiplomas([...diplomas, ...files]);
        else setLicenses([...licenses, ...files]);
    };

    const handleRemoveFile = (index: number, type: FileType) => {
        if (type === 'DIPLOMA') setDiplomas(diplomas.filter((_, i) => i !== index));
        else setLicenses(licenses.filter((_, i) => i !== index));
    };

    useEffect(() => {
        getDoctorInfo();
    }, []);

    const options = [
        {value: '1', label: "Специализия 1"},
    ]

    return (
        <div className='doctor-info'>
            <h1 className="doctor-info__title">
                {edit ? "Редактирование" : "Карточка специалиста"}
            </h1>
            <div className="doctor-info__subtitle">
                {edit ? "Полной профессиональной информации" : "Полная профессиональная информация"}
            </div>

            <div className='doctor-info__content'>
                {edit ? (
                    <>
                        {/* <Select
                            isMulti
                            options={options}
                            placeholder="Выберите специализации"
                            onChange={}
                        />

                        <MyInput
                            id="expirenceYears"
                            label="Опыт работы в годах"
                            value={}
                            onChange={}
                            required
                        />

                        <div>
                            <MyInputFile
                                id="diploma-upload"
                                label="Перетащите файлы или нажмите для выбора"
                                onChange={(files) => handleFileChange(files, 'DIPLOMA')}
                                accept=".pdf"
                                multiple
                            />
                            <FilePreview
                                files={diplomas}
                                type="DIPLOMA"
                                onRemove={handleRemoveFile}
                            />
                        </div>

                        <div>
                            <MyInputFile
                                id="license-upload"
                                label="Перетащите файлы или нажмите для выбора"
                                onChange={(files) => handleFileChange(files, 'LICENSE')}
                                accept=".pdf"
                                multiple
                            />
                            <FilePreview
                                files={licenses}
                                type="LICENSE"
                                onRemove={handleRemoveFile}
                            />
                        </div> */}
                    </>
                ) : (
                    <>
                        <div className="medical-section">
                            <div className="section-header">
                                <div className="section-icon">💼</div>
                                <h2 className="section-title">Специализации</h2>
                            </div>
                            <div className="record">
                                <div className="record-details">
                                    <div className="detail-item">
                                        {specialization ? (
                                            <span className="detail-label">{specialization}</span>
                                        ) : (
                                            <span className="detail-label">Нет данных</span>
                                        )}
                                    </div>
                                </div>
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
                                        {experienceYears ? (
                                            <span className="detail-label">{experienceYears}</span>
                                        ) : (
                                            <span className="detail-label">Нет данных</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="medical-section">
                            <div className="section-header">
                                <div className="section-icon">📜</div>
                                <h2 className="section-title">Диплом</h2>
                            </div>
                            {diplomas.length > 0 ? (
                                diplomas.map((file, index) => (
                                    <div key={file.name} className="record">
                                        <span className="detail-label">
                                            <a href={`${URL}/${file.name}`} target="_blank" rel="noopener noreferrer">
                                                {`Документ №${index + 1}`}
                                            </a>
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="detail-item">
                                    <span className="detail-label">Файл не загружен</span>
                                </div>
                            )}
                        </div>

                        <div className="medical-section">
                            <div className="section-header">
                                <div className="section-icon">📋</div>
                                <h2 className="section-title">Лицензия</h2>
                            </div>
                            {licenses.length > 0 ? (
                                licenses.map((file, index) => (
                                    <div key={file.name} className="record">
                                        <span className="detail-label">
                                            <a href={`${URL}/${file.name}`} target="_blank" rel="noopener noreferrer">
                                                {`Документ №${index + 1}`}
                                            </a>
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="detail-item">
                                    <span className="detail-label">Файл не загружен</span>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            <div>
                {edit ? (
                    <>
                        <button className='my-button width100' onClick={saveChange}>Сохранить</button>
                        <button className='neg-button width100' onClick={() => setEdit(false)}>Отмена</button>
                    </>
                ) : (
                    <button className='my-button width100' onClick={() => setEdit(true)}>Редактировать</button>
                )}
            </div>
        </div>
    );
};

export default observer(DoctorInfo);
