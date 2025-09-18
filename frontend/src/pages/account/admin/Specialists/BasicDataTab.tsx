import { useContext, useEffect, useState } from "react";
import { Context } from "../../../../main";
import type { DataTabProps } from "./Specialists";
import { Link } from "react-router";
import type { IBasicData } from "../../../../models/IDatas";
import { processError } from "../../../../helpers/processError";

const FILE_EXTENSIONS = [".pdf", ".png", ".jpg", ".jpeg"];
const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg"];

interface BasicDataTabProps extends DataTabProps {
    basicDatas: IBasicData[];
    setBasicDatas: (data: IBasicData[]) => void; // исправил
}

const BasicDataTab: React.FC<BasicDataTabProps> = ({
    basicDatas,
    setBasicDatas,
    searchTerm,
    setError,
    setMessage,
}) => {
    const { store } = useContext(Context);

    const [showRejectModal, setShowRejectModal] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [previewPosition, setPreviewPosition] = useState({ x: 0, y: 0 });
    const [rejectReason, setRejectReason] = useState("");
    const [currentBatchId, setCurrentBatchId] = useState<number | null>(null);

    // Хэлпиры для полей
    const isFile = (value: string) =>
        !!value && FILE_EXTENSIONS.some((ext) => value.toLowerCase().endsWith(ext));

    const isImage = (filename: string) =>
        IMAGE_EXTENSIONS.some((ext) => filename.toLowerCase().endsWith(ext));

    const renderValue = (value: string) => {
        if (!value) return "Пустое поле";

        if (isFile(value)) {
            const fileUrl = `${URL}/${value}`;

            if (isImage(value)) {
                return (
                    <a
                        href={fileUrl}
                        onMouseEnter={(e) => handleImageHover(e, value)}
                        onMouseLeave={handleImageLeave}
                        onMouseMove={(e) =>
                            setPreviewPosition({ x: e.clientX, y: e.clientY })
                        }
                    >
                        Документ
                    </a>
                );
            }

            return (
                <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                    {value}
                </a>
            );
        }

        return value;
    };

    const handleImageHover = (e: React.MouseEvent, imgPath: string) => {
        setPreviewImage(`${URL}/${imgPath}`);
        setPreviewPosition({ x: e.clientX, y: e.clientY });
    };

    const handleImageLeave = () => setPreviewImage(null);

    // Получение данных
    const getBasicAll = async () => {
        try {
            const data = await store.getBasicDataAll(10, 1);
            if (data?.basicDatas) {
                setBasicDatas(data.basicDatas);
            }
        } catch(e) {
            processError(e, "Ошибка при загрузке данных");
        }
    };

    // Удаление данных
    const removeBatch = (id: number, message?: string) => {
        setMessage({id: Date.now(), message: message || "Ошибка при удалении"})

        const marked = basicDatas.map(b =>
            b.id === id ? { ...b, className: "removing" } : b
        );
        setBasicDatas(marked);

        setTimeout(() => {
            setBasicDatas(marked.filter(b => b.id !== id));
        }, 300);
    };

    // Подтверждить изменения пользователя
    const confirm = async (id: number) => {
        try {
            const data = await store.confirmBasicData(id);
            data.success ? removeBatch(id, data.message) : setError({id: Date.now(), message: data.message});
        } catch(e) {
            processError(e, "Ошибка при изменении пользователя", setError)
        }
    };

    // Отклонить изменения пользователя
    const handleRejectSubmit = async () => {
        if (!currentBatchId || !rejectReason.trim()) {
            setError({id: Date.now(), message: "Укажите причину отказа"})
            return;
        }

        try {
            const data = await store.rejectBasicData(currentBatchId, rejectReason);

            if (data.success) {
                removeBatch(currentBatchId, data.message);
                closeRejectModal();
            } else {
                setError({id: Date.now(), message: data.message || "Ошибка при отклонении"});
            }
        } catch(e) {
            processError(e, "Произошла ошибка при отклонении", setError);
        }
    };

    // Модалка
    const openRejectModal = (id: number) => {
        setCurrentBatchId(id);
        setShowRejectModal(true);
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

    // Загрузка данных при открытии вкладки
    useEffect(() => {
        getBasicAll();
    }, []);

    return (
        <>
            {/* Превью картинки */}
            {previewImage && (
                <div
                    className="image-preview"
                    style={{
                        left: `${previewPosition.x + 20}px`,
                        top: `${previewPosition.y + 20}px`,
                    }}
                >
                    <img src={previewImage} alt="Preview" />
                </div>
            )}

            <p style={{textAlign: "justify"}}>
                В таблице «Основные данные» отображаются все изменения основных данных, внесённые специалистом. К ним относятся ФИО, пол и дата рождения.
            </p>

            {/* Таблица */}
            <table className="admin-page__table">
                <thead>
                    <tr>
                        <th>Специалист</th>
                        <th>Поле</th>
                        <th>Старое значение</th>
                        <th>Новое значение</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    {basicDatas.length > 0 ? (
                        basicDatas.map((data) => (
                            <tr key={data.id}>
                                <td>
                                    <Link to={`/profile/${data.userId}`}>
                                        {data.userSurname} {data.userName} {data?.userPatronymic}
                                    </Link>
                                </td>
                                <td>{data.field_name}</td>
                                <td>{renderValue(data.old_value)}</td>
                                <td>{renderValue(data.new_value)}</td>
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
                            <td colSpan={5}>
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

export default BasicDataTab;
