import { Link } from "react-router";
import type { DataTabProps } from "./Specialists";
import { useContext, useEffect, useState } from "react";
import type { IProfData } from "../../../../models/IDatas";
import { Context } from "../../../../main";
import { URL } from "../../../../http";
import { observer } from "mobx-react-lite";
import { processError } from "../../../../helpers/processError";

interface ProfecionalDataTabProps extends DataTabProps {
    profecionalDatas: IProfData[];
    setProfecionalDatas: React.Dispatch<React.SetStateAction<IProfData[]>>;
}

const ProfecionalDataTab: React.FC<ProfecionalDataTabProps> = ({
    profecionalDatas,
    searchTerm,
    setProfecionalDatas,
    setError,
    setMessage,
}) => {
    const { store } = useContext(Context);

    const [currentBatchId, setCurrentBatchId] = useState<number | null>(null);
    const [isClosing, setIsClosing] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [commentModal, setCommentModal] = useState<string | null>(null);

    // Модалки
    const openRejectModal = (id: number) => {
        setCurrentBatchId(id);
        setShowRejectModal(true);
    };

    const confirm = async (id: number) => {
        const res = await store.confirmProfData(id);
        if (res.success) {
            setMessage({ id: Date.now(), message: "Данные подтверждены" })
            await getProfecionalAll();
        }
        else {
            setError({ id: Date.now(), message: `Неудалось выполнить действие: ${res.message}` })
            console.log(res)
        }
    };

    const closeRejectModal = () => {
        setIsClosing(true);
        setTimeout(() => {
            setShowRejectModal(false);
            setIsClosing(false);
            setRejectReason("");
            setCurrentBatchId(null);
        }, 300);
    };

    const openCommentModal = (comment: string) => {
        setCommentModal(comment);
    };

    const closeCommentModal = () => {
        setCommentModal(null);
    };

    // Удаление данных
    const removeBatch = (id: number, message?: string) => {
        setMessage({ id: Date.now(), message: message || "" });

        const marked = profecionalDatas.map(b =>
            b.id === id ? { ...b, className: "removing" } : b
        );
        setProfecionalDatas(marked);

        setTimeout(() => {
            setProfecionalDatas(marked.filter(b => b.id !== id));
        }, 300);
    };

    // Отклонить изменения пользователя
    const handleRejectSubmit = async () => {
        if (!currentBatchId || !rejectReason.trim()) {
            setError({ id: Date.now(), message: "Укажите причину отказа" })
            setShowRejectModal(false);
            return;
        }

        try {
            const data = await store.rejectProfData(currentBatchId, rejectReason);

            if (data.success) {
                removeBatch(currentBatchId, data.message);
                closeRejectModal();
            } else {
                setError({ id: Date.now(), message: data.message || "Ошибка при отклонении" })
            }
        } catch {
            setError({ id: Date.now(), message: "Произошла ошибка при отклонении" })
        }
    };

    // Получение данных
    const getProfecionalAll = async () => {
        try {
            const data = await store.getProfDataAll(10, 1)
            if (data?.profDatas) {
                setProfecionalDatas(data.profDatas);
            }
        } catch (e) {
            processError(e, "Ошибка при загрузке данных", setError);
        }
    };

    // Получение данных при открытии вкладки
    useEffect(() => {
        getProfecionalAll();
    }, []);

    // Основной рендер
    return (
        <>
            <p
                style={{ textAlign: 'justify' }}
            >
                В таблице «Полфессиональные данные» отображаются все изменения профессиональных данных, внесённые специалистом. К ним относятся диплом об образовании, лицензия и специализация.
            </p>

            <table className="admin-page__table">
                <thead>
                    <tr>
                        <th>Специалист</th>
                        <th>Диплом</th>
                        <th>Лицензия</th>
                        <th>Специализация</th>
                        <th>Комментарий</th>
                        <th>Тип запроса</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    {profecionalDatas.length > 0 ? (
                        profecionalDatas.map((data) => (
                            <tr key={data.id}>
                                <td>
                                    <Link to={`/profile/${data.userId}`}>
                                        {data.userSurname} {data.userName} {data?.userPatronymic}
                                    </Link>
                                </td>
                                <td>
                                    <Link target="_blank" to={`${URL}/${data.new_diploma}`}>
                                        Документ
                                    </Link>
                                </td>
                                <td>
                                    <Link target="_blank" to={`${URL}/${data.new_license}`}>
                                        Документ
                                    </Link>
                                </td>
                                <td>{data.new_specialization}</td>
                                <td
                                    className="admin-page__comment-cell"
                                    onClick={() => data.comment && openCommentModal(data.comment)}
                                >
                                    {data.comment ? (
                                        <span className="comment-text">{data.comment}</span>
                                    ) : (
                                        <span style={{ color: "red" }}>Комментарий отсутствует</span>
                                    )}
                                </td>


                                <td>
                                    {data.type === 'ADD' ? <span style={{color: "green"}}>Добавление данных</span>: <span  style={{color: "red"}}>Удаление данных</span>}
                                </td>

                                <td>
                                    <button
                                        className="btn btn-success"
                                        onClick={() => confirm(data.id)}
                                    >
                                        {data.type === 'ADD' ? "Подтвердить" : "Удалить"}
                                    </button>
                                    <button
                                        className="btn btn-danger ml-2"
                                        onClick={() => openRejectModal(data.id)}
                                    >
                                        Отклонить
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={7}>
                                {searchTerm ? "Ничего не найдено" : "Нет данных"}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {commentModal && (
                <div className="modal modal--overlay">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Комментарий</h5>
                                <button type="button" onClick={closeCommentModal}>×</button>
                            </div>
                            <div className="modal-body">
                                <p
                                    style={{
                                        color: 'white',
                                        textAlign: 'justify',
                                        padding: '0 2rem',
                                    }}
                                >{commentModal}</p>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={closeCommentModal}>
                                    Закрыть
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}


            {/* Модальное окно */}
            {showRejectModal && (
                <div className="modal modal--overlay">
                    <div className="modal-dialog">
                        <div
                            className={`modal-content ${isClosing ? "closing" : ""
                                }`}
                        >
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    Укажите причину отказа
                                </h5>
                                <button
                                    type="button"
                                    onClick={closeRejectModal}
                                >
                                    ×
                                </button>
                            </div>
                            <div className="modal-body">
                                <textarea
                                    className="form-control"
                                    value={rejectReason}
                                    onChange={(e) =>
                                        setRejectReason(e.target.value)
                                    }
                                    placeholder="Введите причину отказа..."
                                    rows={3}
                                />
                            </div>
                            <div className="modal-footer">
                                <button
                                    className="btn btn-secondary"
                                    onClick={closeRejectModal}
                                >
                                    Отмена
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleRejectSubmit}
                                >
                                    Подтвердить
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default observer(ProfecionalDataTab);
