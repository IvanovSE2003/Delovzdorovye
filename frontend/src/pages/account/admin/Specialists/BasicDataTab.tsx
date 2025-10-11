import { useContext, useEffect, useState } from "react";
import { Context } from "../../../../main";
import type { DataTabProps } from "./Specialists";
import { Link } from "react-router";
import type { IBasicData } from "../../../../models/IDatas";
import { processError } from "../../../../helpers/processError";
import { URL } from "../../../../http";
import LoaderUsefulInfo from "../../../../components/UI/LoaderUsefulInfo/LoaderUsefulInfo";

const FILE_EXTENSIONS = [".pdf", ".png", ".jpg", ".jpeg"];
const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg"];

interface BasicDataTabProps extends DataTabProps {
    basicDatas: IBasicData[];
    setBasicDatas: (data: IBasicData[]) => void;
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
    const [loading, setLoading] = useState<boolean>(false);
    const [modalImage, setModalImage] = useState<{ open: boolean, value: string }>({ open: false, value: "" });

    // Это файл?
    const isFile = (value: string) =>
        !!value && FILE_EXTENSIONS.some((ext) => value.toLowerCase().endsWith(ext));

    // Это изображение?
    const isImage = (filename: string) =>
        IMAGE_EXTENSIONS.some((ext) => filename.toLowerCase().endsWith(ext));


    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && modalImage.open) {
                setModalImage({ open: false, value: "" });
            }
        };

        if (modalImage.open) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'auto';
        };
    }, [modalImage.open]);

    // Обработчик специальных полей
    const renderValue = (value: string) => {
        if (!value) return "Пустое поле";

        if (isFile(value)) {
            const fileUrl = `${URL}/${value}`;

            if (isImage(value)) {
                return (
                    <a
                        onClick={() => setModalImage({ open: true, value: value })}
                        onMouseEnter={(e) => handleImageHover(e, value)}
                        onMouseLeave={() => setPreviewImage(null)}
                        onMouseMove={(e) => setPreviewPosition({ x: e.clientX, y: e.clientY })}
                    >
                        Изображение
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

    // Обработчик наведения на картинку с изображением
    const handleImageHover = (e: React.MouseEvent, imgPath: string) => {
        setPreviewImage(`${URL}/${imgPath}`);
        setPreviewPosition({ x: e.clientX, y: e.clientY });
    };

    // Получение данных
    const getBasicAll = async () => {
        try {
            setLoading(true);
            const data = await store.getBasicDataAll(10, 1);
            if (data?.basicDatas) {
                setBasicDatas(data.basicDatas);
            }
        } catch (e) {
            processError(e, "Ошибка при загрузке данных");
        } finally {
            setLoading(false);
        }
    };

    // Удаление данных
    const removeBatch = (id: number, message?: string) => {
        setMessage({ id: Date.now(), message: message || "Ошибка при удалении" })

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
            setLoading(true);
            const data = await store.confirmBasicData(id);
            data.success ? removeBatch(id, data.message) : setError({ id: Date.now(), message: data.message });
        } catch (e) {
            processError(e, "Ошибка при изменении пользователя", setError)
        } finally {
            setLoading(false);
        }
    };

    // Отклонить изменения пользователя
    const handleRejectSubmit = async () => {
        if (!currentBatchId || !rejectReason.trim()) {
            setError({ id: Date.now(), message: "Укажите причину отказа" })
            return;
        }

        try {
            setLoading(true);
            const data = await store.rejectBasicData(currentBatchId, rejectReason);

            if (data.success) {
                removeBatch(currentBatchId, data.message);
                closeRejectModal();
            } else {
                setError({ id: Date.now(), message: data.message || "Ошибка при отклонении" });
            }
        } catch (e) {
            processError(e, "Произошла ошибка при отклонении", setError);
        } finally {
            setLoading(false)
        }
    };

    // Открытие модалки
    const openRejectModal = (id: number) => {
        setCurrentBatchId(id);
        setShowRejectModal(true);
    };

    // Закрытие модалки
    const closeRejectModal = () => {
        setIsClosing(true);
        setTimeout(() => {
            setShowRejectModal(false);
            setIsClosing(false);
            setRejectReason("");
            setCurrentBatchId(null);
        }, 300);
    };

    useEffect(() => {
        getBasicAll();
    }, []);

    if (loading) return <LoaderUsefulInfo />;

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

            {modalImage.open && (
                <div className="modal modal--overlay" onClick={() => setModalImage({ open: false, value: "" })}>
                    <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
                        <div className="image-modal">
                            <p className="image-modal__hint">
                                Чтобы выйти из режима просмотра изображения нажмите ESC
                            </p>
                            <img
                                src={`${URL}/${modalImage.value}`}
                                alt="Просмотр изображения"
                                className="image-modal__img"
                            />
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

export default BasicDataTab;