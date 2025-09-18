import React, { useContext, useEffect, useState } from "react";
import { Context } from "../../../main";
import { observer } from "mobx-react-lite";
import './DoctorInfo.scss';
import { processError } from "../../../helpers/processError";
import DoctorService, { type Specializations } from "../../../services/DoctorService";
import { URL } from "../../../http";
import { Link } from "react-router";
import Select from 'react-select';
import MyInputFile from "../../../components/UI/MyInput/MyInputFile";
import ShowError from "../../../components/UI/ShowError/ShowError";
import type { Specialization } from "../../../models/IDoctor";

interface DoctorInfoProps {
    type: "READ" | "WRITE";
    userId?: number;
}

interface SpecializationForSend {
    specializationId: number;
    diploma: File;
    license: File;
    comment: string;
}

const DoctorInfo: React.FC<DoctorInfoProps> = ({ type, userId = undefined }) => {
    const { store } = useContext(Context);
    const [doctorInfo, setDoctorInfo] = useState<Specialization[]>([] as Specialization[]);
    const [edit, setEdit] = useState<boolean>(false);
    const [modal, setModal] = useState<{ state: boolean, data: Specialization }>({ state: false, data: {} as Specialization });
    const [comment, setComment] = useState<string>("");
    const [addBlock, setAddBlock] = useState<boolean>(false);

    const [specializations, setSpecializations] = useState<Specializations[]>([] as Specializations[])
    const [selectedSpecializationId, setSelectedSpecializationId] = useState<number | null>(null);
    const [diploma, setDiploma] = useState<File | null>(null)
    const [license, setLicense] = useState<File | null>(null)

    const [error, setError] = useState<{ id: number, message: string }>({ id: 0, message: "" });
    const [message, setMessage] = useState<{ id: number, message: string }>({ id: 0, message: "" });

    // Получение данных
    const fetchProfData = async () => {
        try {
            const response = await DoctorService.getDoctorInfo(userId || store.user.id);
            setDoctorInfo(response.data.profData);
        } catch (e) {
            processError(e, "Ошибка при получении профессональных данных доктора: ");
        }
    }

    // Удаление блока специализации
    const deleteSpecialization = async (info: Specialization) => {
        try {
            const formData = new FormData();
            formData.append('comment', comment);
            formData.append('type', 'DELETE');
            formData.append('specializationId', info.id.toString());
            formData.append('diploma', info.diploma!);
            formData.append('license', info.license!);

            const response = await DoctorService.deleteProfInfo(store.user.id, formData);
            response.data.success
                ? setMessage({ id: Date.now(), message: response.data.message })
                : setError({ id: Date.now(), message: response.data.message });
        } catch (e: any) {
            processError(e, "Ошибка при удалении профессиональной информации");
        } finally {
            setModal({ state: false, data: {} as Specialization });
            setComment("");
            fetchProfData();
        }
    }

    // Добавление блока специализаци
    const addSpecialization = async (info: SpecializationForSend) => {
        try {
            const formData = new FormData();
            formData.append('type', 'ADD');
            formData.append('specializationId', info.specializationId.toString());
            formData.append('comment', info.comment || '');
            formData.append('diploma', info.diploma);
            formData.append('license', info.license);

            const response = await DoctorService.addProfInfo(store.user.id, formData);
            response.data.success
                ? setMessage({ id: Date.now(), message: response.data.message })
                : setError({ id: Date.now(), message: response.data.message });
        } catch (e) {
            processError(e, "Ошибка при добавлении нового блока: ");
        } finally {
            fetchProfData();
            setAddBlock(false);
            setSelectedSpecializationId(null);
            setDiploma(null);
            setLicense(null);
            setComment("");
        }
    }

    // Обработка нажатия на добавление специализации
    const handleAdd = async () => {
        if (!selectedSpecializationId || !diploma || !license) {
            setError({ id: Date.now(), message: "Выберите специализацию и загрузите файлы" })
            return;
        }

        const info: SpecializationForSend = {
            specializationId: selectedSpecializationId,
            diploma: diploma as File,
            license: license as File,
            comment: comment
        }
        addSpecialization(info);
    }

    // Получение специализация для селекта
    const getSpecialization = async () => {
        try {
            const response = await DoctorService.getSpecializations();
            setSpecializations(response.data);
        } catch (e) {
            processError(e, "Ошибка при получении всех специлазаций: ");
        }
    }

    // Загрузка данных при прогрузке информации
    useEffect(() => {
        getSpecialization();
        fetchProfData();
    }, [])

    // Основной рендер
    return (
        <div className="doctor-info">
            <h1 className="doctor-info__title">Специализации доктора</h1>
            <p className="doctor-info__subtitle">Здесь находится список всех специализаций</p>
            <ShowError msg={message} mode="MESSAGE" />

            {/* Блок для добавления */}
            {addBlock && (
                <div className="doctor-info__flex-column doctor-info__add">
                    <h1 className="doctor-info__add-title">Добавление новой специализации</h1>

                    <ShowError msg={error} /><br />

                    <Select
                        options={specializations.map(spec => ({ value: spec.id, label: spec.name }))}
                        placeholder="Выберите специализацию"
                        className="doctor-info__select"
                        classNamePrefix="custom-select"
                        onChange={(selected) => setSelectedSpecializationId(selected?.value || null)}
                    />

                    <MyInputFile
                        id="diploma"
                        label="Диплом"
                        value={diploma || ""}
                        className="doctor-info__input"
                        onChange={setDiploma}
                        accept=".pdf"
                    />

                    <MyInputFile
                        id="license"
                        label="Лицензия"
                        className="doctor-info__input"
                        value={license || ""}
                        onChange={setLicense}
                        accept=".pdf"
                    />

                    <textarea
                        id="comment"
                        value={comment}
                        className="doctor-info__textarea"
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Комментарий"
                        rows={4}
                    />

                    <div className="doctor-info__buttons">
                        <button
                            className="doctor-info__add-button my-button"
                            onClick={handleAdd}
                            disabled={!selectedSpecializationId || !diploma || !license}
                        >
                            Добавить
                        </button>

                        <button
                            className="my-button doctor-info__button"
                            onClick={() => setAddBlock(false)}
                        >
                            Назад
                        </button>
                    </div>
                </div>
            )}

            {doctorInfo.length > 0 ? !addBlock && doctorInfo.map((info: Specialization) => (
                <div key={info.id} className="info-section">
                    <div className="info-section__header">
                        <div className="info-section__title">{info.specialization}</div>
                    </div>

                    <div className="info-item">
                        <div className="info-item__label">Диплом: </div>
                        <Link className="info-item__value" target="_blank" to={`${URL}/${info.diploma}`}>
                            Посмотреть документ
                        </Link>
                    </div>

                    <div className="info-item">
                        <div className="info-item__label">Лицензия: </div>
                        <Link className="info-item__value" target="_blank" to={`${URL}/${info.license}`}>
                            Посмотреть документ
                        </Link>
                    </div>

                    {info.comment && (
                        <div className="info-item">
                            <div className="info-item__label">Комментарий: </div>
                            <div className="info-item__value">{info.comment}</div>
                        </div>
                    )}

                    {edit && (
                        <button
                            className="neg-button doctor-info__button"
                            onClick={() => setModal({ state: true, data: info })}
                        >
                            Удалить
                        </button>
                    )}
                </div>
            )) : (
                !addBlock &&
                <div className="doctor-info__no-data">
                    Пока нет данных о специализациях
                </div>
            )}

            {edit && (
                <button
                    className="my-button doctor-info__button"
                    onClick={() => setEdit(false)}
                >
                    Назад
                </button>
            )}

            {!edit && !addBlock && type == "WRITE" && (
                <div className="doctor-info__buttons">
                    <button
                        className="my-button"
                        onClick={() => setEdit(true)}
                    >
                        Редактировать
                    </button>

                    <button
                        className="my-button"
                        onClick={() => {
                            setEdit(false);
                            setAddBlock(true);
                        }}
                    >
                        + Добавить новую специализацию
                    </button>
                </div>
            )}

            {modal.state && (
                <div className="modal">
                    <div className='delete-modal'>
                        <div className="doctor-info__flex-column">
                            <h1>Удаление данных</h1>

                            <p>Напишите причину удаления этих данных: </p>
                            <textarea
                                id="comment"
                                value={comment}
                                className="doctor-info__textarea"
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Причина удаления (не менее 10 символов)"
                                rows={4}
                            />

                            <div className="doctor-info__buttons">
                                <button
                                    className="neg-button"
                                    onClick={() => deleteSpecialization(modal.data)}
                                    disabled={comment.length < 10}
                                >
                                    Удалить
                                </button>
                                <button
                                    className="my-button"
                                    onClick={() => {
                                        setModal({ state: false, data: {} as Specialization });
                                        setComment("");
                                    }}
                                >
                                    Отменить
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}

export default observer(DoctorInfo);