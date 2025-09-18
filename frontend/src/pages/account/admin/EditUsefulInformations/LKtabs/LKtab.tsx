import { useEffect, useState, useCallback } from "react";
import type { InfoBlock } from "../../../../../models/InfoBlock";
import HomeService from "../../../../../services/HomeService";
import LoaderUsefulInfo from "../../../../../components/UI/LoaderUsefulInfo/LoaderUsefulInfo";
import "./LKtab.scss";
import { processError } from "../../../../../helpers/processError";
import ShowError from "../../../../../components/UI/ShowError/ShowError";

interface InfoTabProps {
    contentType: "useful_info_patient" | "useful_info_doctor";
    tabName: string;
    showSaveButton?: boolean;
}

const LKtab: React.FC<InfoTabProps> = ({ contentType, tabName, showSaveButton = false }) => {
    const [blocks, setBlocks] = useState<InfoBlock[]>([]);
    const [editingBlock, setEditingBlock] = useState<number | null>(null);
    const [newHeader, setNewHeader] = useState<string>("");
    const [newText, setNewText] = useState<string>("");
    const [hasChanges, setHasChanges] = useState<boolean>(false);
    const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);
    const [error, setError] = useState<{ id: number; message: string }>({ id: 0, message: "" })
    const [message, setMessage] = useState<{ id: number; message: string }>({ id: 0, message: "" });

    // Загрузка информационных блоков
    const fetchInfo = useCallback(async () => {
        try {
            setIsInitialLoad(true);
            const response = await HomeService.getContent(contentType);
            setBlocks(response.data.contents);
        } catch (e) {
            console.error(`Ошибка при получении информации для ${tabName}: `, e);
        } finally {
            setIsInitialLoad(false);
        }
    }, [contentType, tabName]);

    // Загрузка при окрытии вкладки
    useEffect(() => {
        fetchInfo();
    }, [fetchInfo]);

    // Добавление информационного блока
    const handleAddBlock = async () => {
        try {
            const newId = Math.max(...blocks.map(b => b.id), 0) + 1;
            const newBlock: InfoBlock = { id: newId, header: "Заголовок", text: "Новый блок информации" }

            await HomeService.addContent(contentType, newBlock);
            setBlocks([
                ...blocks,
                newBlock,
            ]);

            setMessage({ id: Date.now(), message: "Информационный блок успешно добавлен" })
        } catch (e) {
            processError(e, "Ошибка при добавлении блока", setError)
        }
    };

    // Удаление информационного блока
    const handleDelete = async (id: number) => {
        if (!window.confirm("Вы уверены, что хотите удалить этот информационный блок?")) {
            return;
        }

        try {
            await HomeService.deleteContent(id);
            const updatedBlocks = blocks.filter(b => b.id !== id);
            setBlocks(updatedBlocks);
            setMessage({ id: Date.now(), message: "Инфоромационный блок успешно удален" });
        } catch (e) {
            processError(e, "Ошибка при удалении информационного блока", setError);
        }
    };

    // Сохраниение всех информационных блоков
    const handleSaveToServer = async () => {
        if (!hasChanges) return;

        try {
            for (const block of blocks) {
                await HomeService.editContent(contentType, block);
            }

            setHasChanges(false);
            setMessage({ id: Date.now(), message: "Информационные блоки успешно обновлены" })
        } catch (e) {
            processError(e, "Ошибка при сохранении информационного блока", setError);
        }
    };

    // Войти в режим редактирования
    const handleEdit = (id: number) => {
        const block = blocks.find(b => b.id === id);
        if (block) {
            setEditingBlock(id);
            setNewHeader(block.header ?? "");
            setNewText(block.text);
        }
    };

    // Выйти из режима редактирования
    const handleCancelEdit = () => {
        setEditingBlock(null);
        setNewHeader("");
        setNewText("");
    };

    // Сохранить изменения информационного блока
    const handleSave = () => {
        if (editingBlock !== null) {
            const updatedBlocks = blocks.map(b =>
                b.id === editingBlock ? { ...b, header: newHeader, text: newText } : b
            );

            setBlocks(updatedBlocks);
            setEditingBlock(null);
            setNewHeader("");
            setNewText("");
            setHasChanges(true);
        }
    };

    // Загрузка
    if (isInitialLoad) {
        return <LoaderUsefulInfo />;
    }

    // Нет информационных блоков в БД
    if (blocks.length === 0) {
        return (
            <div className="lk-tab lk-tab--empty">
                <div className="lk-tab__empty-content">
                    <div className="lk-tab__empty-icon">📝</div>
                    <h3 className="lk-tab__empty-title">Нет информационных блоков</h3>
                    <p className="lk-tab__empty-description">Добавьте первый блок информации</p>
                    <button className="my-button lk-tab__add-btn" onClick={handleAddBlock}>
                        + Добавить новый блок
                    </button>
                </div>
            </div>
        );
    }

    // Основной рендер
    return (
        <div className="lk-tab">
            <div className="lk-tab__header">
                <div className="lk-tab__actions">
                    <button className="my-button lk-tab__add-btn" onClick={handleAddBlock}>
                        + Добавить новый блок
                    </button>

                    {showSaveButton && hasChanges && (
                        <button
                            className="my-button lk-tab__save-btn"
                            onClick={handleSaveToServer}
                        >
                            Сохранить все изменения
                        </button>
                    )}
                </div>
            </div>

            <div className="lk-tab__errors">
                <ShowError msg={error} />
                <ShowError msg={message} mode="MESSAGE" />
            </div>

            <div className="lk-tab__blocks">
                {blocks.map(block => (
                    <div key={block.id} className="lk-tab__block">
                        {editingBlock === block.id ? (
                            <>
                                <input
                                    value={newHeader}
                                    onChange={e => setNewHeader(e.target.value)}
                                    className="lk-tab__input"
                                    placeholder="Введите заголовок"
                                />
                                <textarea
                                    value={newText}
                                    onChange={e => setNewText(e.target.value)}
                                    className="lk-tab__textarea"
                                    placeholder="Введите текст"
                                    rows={4}
                                />
                                <div className="lk-tab__actions">
                                    <button
                                        className="my-button lk-tab__save-btn"
                                        onClick={handleSave}
                                    >
                                        Сохранить
                                    </button>
                                    <button
                                        className="neg-button"
                                        onClick={handleCancelEdit}
                                    >
                                        Отмена
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <h2 className="lk-tab__block-header">{block.header}</h2>
                                <p className="lk-tab__block-text">{block.text}</p>
                                <div className="lk-tab__actions">
                                    <button
                                        className="my-button lk-tab__save-btn"
                                        onClick={() => handleEdit(block.id)}
                                    >
                                        Редактировать
                                    </button>
                                    <button
                                        className="neg-button"
                                        onClick={() => handleDelete(block.id)}
                                    >
                                        Удалить
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LKtab;