import { useContext, useEffect, useState } from "react";
import { Context } from "../../../main";
import { observer } from "mobx-react-lite";
import './DoctorInfo.scss';
import { processError } from "../../../helpers/processError";
import DoctorService, { type Specialization, type Specializations } from "../../../services/DoctorService";
import { URL } from "../../../http";
import { Link } from "react-router";
import MyInput from "../../../components/UI/MyInput/MyInput";
import Select from 'react-select';
import MyInputFile from "../../../components/UI/MyInput/MyInputFile";

const DoctorInfo = () => {
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

    // Получение данных
    const fetchProfData = async () => {
        try {
            const response = await DoctorService.getDoctorInfo(store.user.id);
            setDoctorInfo(response.data.profData);
        } catch (e) {
            processError(e, "Ошибка при получении профессональных данных доктора: ");
        }
    }

    // Удаление специализации
    const deleteSpecialization = async (info: Specialization) => {
        try {
            const response = await DoctorService.deleteProfInfo(store.user.id, info);
            console.log(response.data);
        } catch (e) {
            processError(e, "Ошибка при удалении профессиональной информации: ");
        } finally {
            setModal({ state: false, data: {} as Specialization })
        }
    }

    // Добавление специализации
    const addSpecialization = async (info: Specialization) => {
        try {
            const response = await DoctorService.addProfInfo(store.user.id, info);
            console.log(response.data);
        } catch (e) {
            processError(e, "Ошибка при добавлении нового блока: ");
        } finally {
            fetchProfData();
            setAddBlock(false);
        }
    }

    // Получение специализация для селекта
    const getSpecialization = async () => {
        try {
            const response = await DoctorService.getSpecializations();
            setSpecializations(response.data);
        } catch (e) {
            processError(e, "Ошибка при получении всех специлазаций: ");
        } finally {
            fetchProfData();
        }
    }

    // Загрузка данных при прогрузке информации
    useEffect(() => {
        getSpecialization();
        fetchProfData();
    }, [])

    return (
        <div className="doctor-info">
            <h1 className="doctor-info__title">Специализации доктора</h1>
            <p className="doctor-info__subtitle">Здесь находится список всех ваших специализаций</p>

            {/* Блок для добавления */}
            {addBlock && (
                <div className="doctor-info__flex-column doctor-info__add">
                    <h1 className="doctor-info__add-title">Добавление новой специализации</h1>

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
                    />

                    <MyInputFile
                        id="license"
                        label="Лицинзия"
                        className="doctor-info__input"
                        value={license || ""}
                        onChange={setLicense}
                    />

                    <textarea
                        id="comment"
                        value={comment}
                        className="doctor-info__textarea"
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Комментарий"
                    />

                    <button
                        className="doctor-info__add-button"
                        onClick={() => {
                            const info: Specialization = {
                                id: Date.now(),
                                specializationId: selectedSpecializationId || 0,
                                diploma: diploma?.name || "",
                                license: license?.name || "",
                                comment: comment
                            }
                            addSpecialization(info);
                        }}
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
            )}

            {doctorInfo && !addBlock && doctorInfo.map((info: Specialization) => (
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

                    {edit && (
                        <button
                            className="neg-button doctor-info__button"
                            onClick={() => setModal({ state: true, data: info })}
                        >
                            Удалить
                        </button>
                    )}
                </div>
            ))}

            {edit && (
                <button
                    className="my-button doctor-info__button"
                    onClick={() => setEdit(false)}
                >
                    Назад
                </button>
            )}

            {!edit && !addBlock && (
                <div className="doctor-info__buttons">
                    <button
                        className="my-button"
                        onClick={() => setEdit(true)}
                    >
                        Отредактировать
                    </button>

                    <button
                        className="my-button"
                        onClick={() => {
                            setEdit(false);
                            setAddBlock(true)
                        }}
                    >
                        Добавить новый блок
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
                            />

                            <div className="doctor-info__buttons">
                                <button
                                    className="neg-button"
                                    onClick={() => deleteSpecialization({ ...modal.data, comment })}
                                    disabled={comment.length <= 10}
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