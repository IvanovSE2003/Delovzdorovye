import { useContext, useEffect, useState } from "react";
import { Context } from "../../../main";
import { URL } from "../../../http";
import { observer } from "mobx-react-lite";
import AccountLayout from "../AccountLayout";
import type { Batch } from "../../../models/IBatch";
import SearchInput from "../../../components/UI/Search/Search";

const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg'];

const Specialists: React.FC = () => {
    const { store } = useContext(Context);

    const [message, setMessage] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [batches, setBatches] = useState<Batch[]>([]);
    const [filteredBatches, setFilteredBatches] = useState<Batch[]>([]);
    const [showRejectModal, setShowRejectModal] = useState<boolean>(false);
    const [isClosing, setIsClosing] = useState<boolean>(false);
    const [rejectReason, setRejectReason] = useState<string>("");
    const [currentBatchId, setCurrentBatchId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>(""); 
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [previewPosition, setPreviewPosition] = useState({ x: 0, y: 0 });

    // Фильтрация батчей по поисковому запросу
    useEffect(() => {
        if (searchTerm.trim() === "") {
            setFilteredBatches(batches);
        } else {
            const filtered = batches.filter(batch =>
                `${batch.userName} ${batch.userSurname} ${batch.userPatronymic || ''}`
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())
            );
            setFilteredBatches(filtered);
        }
    }, [searchTerm, batches]);

    const handleImageHover = (e: React.MouseEvent, imgPath: string) => {
        setPreviewImage(`${URL}/${imgPath}`);
        setPreviewPosition({ x: e.clientX, y: e.clientY });
    };

    const handleImageLeave = () => {
        setPreviewImage(null);
    };

    const getBatchAll = async () => {
        try {
            const data = await store.getBatchAll(10, 1);
            if (data && data.batches) {
                setBatches(data.batches);
                setFilteredBatches(data.batches);
            }
        } catch (err) {
            setError("Ошибка при загрузке данных");
        }
    }

    const isFile = (value: string) => {
        if (!value) return false;
        const fileExtensions = ['.pdf', '.png', '.jpg', '.jpeg'];
        return fileExtensions.some(ext => value.toLowerCase().endsWith(ext));
    }

    const isImage = (filename: string) => {
        return IMAGE_EXTENSIONS.some(ext =>
            filename.toLowerCase().endsWith(ext)
        );
    };

    const renderValue = (value: string) => {
        if(value == "") return "Пустое поле";

        if (isFile(value)) {
            const fileUrl = `${URL}/${value}`;

            if (isImage(value)) {
                return (
                    <a
                        href={`${URL}/${value}`}
                        onMouseEnter={(e) => handleImageHover(e, value)}
                        onMouseLeave={handleImageLeave}
                        onMouseMove={(e) => setPreviewPosition({ x: e.clientX, y: e.clientY })}
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

    const confirm = async (id: number) => {
        try {
            setMessage("");
            setError("");
            const data = await store.confirmChange(id);

            if (data.success) {
                setMessage(data.message||"");
                setBatches(prev => prev.map(b =>
                    b.id === id ? { ...b, className: 'removing' } : b
                ));
                setTimeout(() => {
                    setBatches(prev => prev.filter(b => b.id !== id));
                }, 300);
            } else {
                setError(data.message || "Ошибка при подтверждении");
            }
        } catch (err) {
            setError("Произошла ошибка при подтверждении");
        }
    }

    const openRejectModal = (id: number) => {
        setCurrentBatchId(id);
        setShowRejectModal(true);
    }

    const handleRejectSubmit = async () => {
        if (!currentBatchId || !rejectReason.trim()) {
            setError("Укажите причину отказа");
            return;
        }

        try {
            setMessage("");
            setError("");
            const data = await store.rejectChange(currentBatchId, rejectReason);

            if (data.success) {
                setMessage(data.message||"");
                setBatches(prev => prev.map(b =>
                    b.id === currentBatchId ? { ...b, className: 'removing' } : b
                ));
                setTimeout(() => {
                    setBatches(prev => prev.filter(b => b.id !== currentBatchId));
                }, 300);
                closeRejectModal();
            } else {
                setError(data.message || "Ошибка при отклонении");
            }
        } catch (err) {
            setError("Произошла ошибка при отклонении");
        }
    }

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
        getBatchAll();
    }, []);

    return (
        <AccountLayout>
            {message && <div className="alert alert-success">{message}</div>}
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="page-container">
                <h1 className="admin-page__title">Редактирование профилей</h1>

                <div className="admin-page__search">
                    <SearchInput
                        placeholder="Поиск по фамилии, имени, отчеству специалиста"
                        value={searchTerm}
                        onChange={setSearchTerm}
                    />
                </div>

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
                        {filteredBatches.length > 0 ? (
                            filteredBatches.map((batch) => (
                                <tr key={batch.id}>
                                    <td>
                                        {batch.userName} {batch.userSurname} {batch.userPatronymic}
                                        <br />
                                        ID: {batch.id}
                                    </td>
                                    <td>{batch.field_name}</td>
                                    <td>{renderValue(batch.old_value)}</td>
                                    <td>{renderValue(batch.new_value)}</td>
                                    <td>
                                        <button
                                            className="btn btn-success"
                                            onClick={() => confirm(batch.id)}
                                        >
                                            Подтвердить
                                        </button>
                                        <button
                                            className="btn btn-danger ml-2"
                                            onClick={() => openRejectModal(batch.id)}
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
            </div>

            {/* Модальное окно для причины отказа */}
            {showRejectModal && (
                <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className={`modal-content ${isClosing ? 'closing' : ''}`}>
                            <div className="modal-header">
                                <h5 className="modal-title">Укажите причину отказа</h5>
                                <button type="button" onClick={closeRejectModal}>×</button>
                            </div>
                            <div className="modal-body">
                                <textarea
                                    className="form-control"
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
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
        </AccountLayout>
    )
}

export default observer(Specialists);