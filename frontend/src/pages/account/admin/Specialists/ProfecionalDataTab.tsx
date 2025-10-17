import { Link } from "react-router";
import type { DataTabProps } from "./Specialists";
import { useContext, useEffect, useState } from "react";
import type { IProfData } from "../../../../models/IDatas";
import { Context } from "../../../../main";
import { URL } from "../../../../http";
import { observer } from "mobx-react-lite";
import { processError } from "../../../../helpers/processError";
import AdminService from "../../../../services/AdminService";
import LoaderUsefulInfo from "../../../../components/UI/LoaderUsefulInfo/LoaderUsefulInfo";
import ModalHeader from "../../../../components/UI/Modals/ModalHeader/ModalHeader";

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
    const [rejectReason, setRejectReason] = useState("");
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [commentModal, setCommentModal] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [allProfecionalDatas, setAllProfecionalDatas] = useState<IProfData[]>([]); // Все данные

    // Фильтрация данных по поисковому запросу
    const filteredProfecionalDatas = allProfecionalDatas.filter(data => {
        if (!searchTerm.trim()) return true;
        
        const fullName = `${data.userSurname} ${data.userName} ${data.userPatronymic || ''}`.toLowerCase();
        const search = searchTerm.toLowerCase();
        
        return fullName.includes(search);
    });

    // Открытие модалки
    const openRejectModal = (id: number) => {
        setCurrentBatchId(id);
        setShowRejectModal(true);
    };

    // Удаление данных
    const removeBatch = (id: number, message?: string) => {
        setMessage({ id: Date.now(), message: message || "" });

        const marked = allProfecionalDatas.map(b =>
            b.id === id ? { ...b, className: "removing" } : b
        );
        setAllProfecionalDatas(marked);

        setTimeout(() => {
            const filtered = marked.filter(b => b.id !== id);
            setAllProfecionalDatas(filtered);
            setProfecionalDatas(filtered);
        }, 300);
    };

    // Подтвердить изменения пользователя
    const confirm = async (id: number) => {
        try {
            const res = await store.confirmProfData(id);
            if (res.success) {
                setMessage({ id: Date.now(), message: res.message })
                await getProfecionalAll();
            }
            else {
                setError({ id: Date.now(), message: `Неудалось выполнить действие: ${res.message}` })
            }
        } catch (e) {
            processError(e, "Ошибка при подтвердении изменения")
        } finally {
            await AdminService.getCountAdminData();
        }
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
                setShowRejectModal(false);
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
            setLoading(true);
            const data = await store.getProfDataAll(10, 1)
            if (data?.profDatas) {
                setAllProfecionalDatas(data.profDatas); // Сохраняем все данные
                setProfecionalDatas(data.profDatas);
            }
        } catch (e) {
            processError(e, "Ошибка при загрузке данных", setError);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getProfecionalAll();
    }, []);

    if (loading) return <LoaderUsefulInfo />;

    return (
        <>
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
                    {filteredProfecionalDatas.length > 0 ? (
                        filteredProfecionalDatas.map((data) => (
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
                                    onClick={() => data.comment && setCommentModal(data.comment)}
                                >
                                    {data.comment ? (
                                        <span className="comment-text">{data.comment}</span>
                                    ) : (
                                        <span style={{ color: "red" }}>Комментарий отсутствует</span>
                                    )}
                                </td>


                                <td>
                                    {data.type === 'ADD' ? <span style={{ color: "green" }}>Добавление данных</span> : <span style={{ color: "red" }}>Удаление данных</span>}
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

            {/* Модальное окно для комментария */}
            {commentModal && (
                <div className="modal">
                    <div className="modal-content">
                        <ModalHeader title="Комментарий" onClose={() => setCommentModal(null)} />
                        <div className="modal-body__comment">
                            {commentModal}
                        </div>
                        <button
                            className="neg-button width100"
                            onClick={() => setCommentModal(null)}
                        >
                            Закрыть
                        </button>
                    </div>
                </div>
            )}


            {/* Модальное окно */}
            {showRejectModal && (
                <div className="modal">
                    <div className="modal-content">
                        <ModalHeader title="Отказ" onClose={() => setShowRejectModal(false)} />
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
                                className="neg-button"
                                onClick={() => setShowRejectModal(false)}
                            >
                                Отмена
                            </button>
                            <button
                                className="my-button"
                                onClick={handleRejectSubmit}
                            >
                                Подтвердить
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default observer(ProfecionalDataTab);