import { Link } from "react-router";
import type { DataTabProps } from "./Specialists";
import { useContext, useEffect, useState } from "react";
import type { IProfData } from "../../../../models/IDatas";
import { Context } from "../../../../main";
import { API_URL } from "../../../../http";

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

    // Модалка
    const openRejectModal = (id: number) => {
        setCurrentBatchId(id);
        setShowRejectModal(true);
    };

    const confirm = async (id: number) => {
        const res = await store.confirmProfData(id);
        if (res.success) {
            setMessage("Данные подтверждены")
            console.log(res)
        }
        else {
            setError(`Неудалось выполнить действие: ${res.message}`);
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

    // Удаление данных
    const removeBatch = (id: number, message?: string) => {
        setMessage(message || "");

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
            setError("Укажите причину отказа");
            return;
        }

        try {
            setMessage("");
            setError("");
            const data = await store.rejectBasicData(currentBatchId, rejectReason);

            if (data.success) {
                removeBatch(currentBatchId, data.message);
                closeRejectModal();
            } else {
                setError(data.message || "Ошибка при отклонении");
            }
        } catch {
            setError("Произошла ошибка при отклонении");
        }
    };

    // Получение данных
    const getProfecionalAll = async () => {
        try {
            const data = await store.getProfDataAll(10, 1)
            if (data?.profDatas) {
                setProfecionalDatas(data.profDatas);
            }
        } catch {
            setError("Ошибка при загрузке данных");
        }
    };

    // Получение данных при открытии вкладки
    useEffect(() => {
        getProfecionalAll();
    }, []);

    return (
        <>
            <table className="admin-page__table">
                <thead>
                    <tr>
                        <th>Специалист</th>
                        <th>Диплом</th>
                        <th>Лицензия</th>
                        <th>Опыт</th>
                        <th>Специализация</th>
                        <th>Комментарий</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    {profecionalDatas.length > 0 ? (
                        profecionalDatas.map((data) => (
                            <tr key={data.id}>
                                <td>
                                    <Link target="_blank" to={`/profile/${data.userId}`}>
                                        {data.userSurname} {data.userName} {data?.userPatronymic}
                                    </Link>
                                </td>
                                <td>
                                    <Link target="_blank" to={`${API_URL}/${data.new_diploma}`}>
                                        Документ
                                    </Link>
                                </td>
                                <td>
                                    <Link target="_blank" to={`${API_URL}/${data.new_license}`}>
                                        Документ
                                    </Link>
                                </td>
                                <td>{data.new_experience_years}</td>
                                <td>{data.new_specialization}</td>
                                <td>{data.comment || <span style={{ color: "red" }}>Комментарий отсутсвует</span>}</td>
                                <td>
                                    <button
                                        className="btn btn-success"
                                        onClick={() => confirm(data.id)}
                                    >
                                        Подтвердить
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

export default ProfecionalDataTab;
