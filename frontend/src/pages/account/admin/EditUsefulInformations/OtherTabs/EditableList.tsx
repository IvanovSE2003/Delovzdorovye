import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import LoaderUsefulInfo from "../../../../../components/UI/LoaderUsefulInfo/LoaderUsefulInfo";
import Search from "../../../../../components/UI/Search/Search";
import ShowError from "../../../../../components/UI/ShowError/ShowError";
import { processError } from "../../../../../helpers/processError";
import '../EditUsefulInformations.scss';

interface EditableListProps<T> {
    loadItems: () => Promise<T[]>;
    createItem: (label: string) => Promise<void>;
    updateItem: (id: number, label: string) => Promise<void>;
    deleteItem: (id: number) => Promise<void>;
    getId: (item: T) => number;
    getLabel: (item: T) => string;
    placeholder?: string;
    emptyMessage?: string;
    addMessage?: string;
    tabName: string;
}

const EditableList = <T,>({
    loadItems,
    createItem,
    updateItem,
    deleteItem,
    getId,
    getLabel,
    placeholder = "Введите название",
    emptyMessage = "Элементы не найдены",
    addMessage = "Добавить элемент",
    tabName
}: EditableListProps<T>) => {
    const [items, setItems] = useState<T[]>([]);
    const [editing, setEditing] = useState<number | null>(null);
    const [isAdding, setIsAdding] = useState<boolean>(false);
    const [newLabel, setNewLabel] = useState<string>("");
    const [newItem, setNewItem] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [operationInProgress, setOperationInProgress] = useState<number | string | null>(null);

    const [searchParams, setSearchParams] = useSearchParams();
    const [error, setError] = useState<{ id: number; message: string }>({ id: 0, message: "" });
    const [message, setMessage] = useState<{ id: number; message: string }>({ id: 0, message: "" });

    const [search, setSearch] = useState<string>("");

    useEffect(() => {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set('tab', tabName);
        setSearchParams(newSearchParams);
    }, [tabName]);

    const fetchInfo = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await loadItems();
            setItems([...data].sort((a, b) =>
                getLabel(a).localeCompare(getLabel(b), "ru", { sensitivity: "base" })
            ));
        } catch (e) {
            processError(e, "Ошибка при получении данных")
        } finally {
            setIsLoading(false);
        }
    }, [loadItems, getLabel]);

    useEffect(() => {
        fetchInfo();
    }, [fetchInfo]);

    // Создание
    const handleCreate = async () => {
        if (!newItem.trim()) {
            setError({ id: Date.now(), message: "Название не может быть пустым!" });
            return;
        }

        const trimmedNewItem = newItem.trim();
        if (items.some(i => getLabel(i).toLowerCase() === trimmedNewItem.toLowerCase())) {
            setError({ id: Date.now(), message: "Элемент с таким названием уже существует!" });
            return;
        }

        setOperationInProgress("create");
        try {
            setIsLoading(true);
            await createItem(trimmedNewItem);
            setMessage({ id: Date.now(), message: "Новый блок успешно добавлен" })
            setError({id: 0, message: ""})
            setNewItem("");
            setIsAdding(false);
            await fetchInfo();
        } catch (e) {
            processError(e, "Ошибка при создании блока", setError);
        } finally {
            setOperationInProgress(null);
            setIsLoading(false);
        }
    };

    // Сохранение
    const handleSave = async () => {
        if (editing === null) return;

        const trimmedNewLabel = newLabel.trim();
        if (!trimmedNewLabel) {
            setError({ id: Date.now(), message: "Название не может быть пустым!" });
            return;
        }

        if (items.some(i =>
            getId(i) !== editing && getLabel(i).toLowerCase() === trimmedNewLabel.toLowerCase()
        )) {
            setError({ id: Date.now(), message: "Элемент с таким названием уже существует!" });
            return;
        }

        setOperationInProgress(editing);
        try {
            setIsLoading(true);
            await updateItem(editing, trimmedNewLabel);
            setError({id: 0, message: ""})
            setMessage({ id: Date.now(), message: "Блок успешно сохранен" });
            await fetchInfo();
            setEditing(null);
        } catch (e) {
            processError(e, "Ошибка при сохранении блока", setError);
        } finally {
            setOperationInProgress(null);
            setIsLoading(false);
        }
    };

    // Удаление
    const handleDelete = async (id: number) => {
        if (!window.confirm("Вы уверены, что хотите удалить этот элемент?")) {
            return;
        }

        setOperationInProgress(`delete-${id}`);
        try {
            setIsLoading(true);
            await deleteItem(id);
            setError({id: 0, message: ""})
            setMessage({ id: Date.now(), message: "Блок успешно удален" })
            await fetchInfo();
        } catch (e) {
            processError(e, "Ошибка при удалении блока", setError);
        } finally {
            setOperationInProgress(null);
            setIsLoading(false);
        }
    };

    const filteredItems = items.filter(i =>
        getLabel(i).toLowerCase().includes(search.toLowerCase())
    );

    if (isLoading) {
        return <LoaderUsefulInfo />;
    }

    return (
        <div className="lists">
            <Search
                placeholder={placeholder}
                value={search}
                onChange={setSearch}
                className="lists__search"
            />

            <div>
                <ShowError msg={error} />
                <ShowError msg={message} mode="MESSAGE" />
            </div>

            {!isAdding ? (
                <button
                    className="lists__button lists__button--add"
                    onClick={() => setIsAdding(true)}
                >
                    {addMessage}
                </button>
            ) : (
                <div className="lists__item lists__item--new">
                    <input
                        value={newItem}
                        onChange={e => setNewItem(e.target.value)}
                        placeholder={placeholder}
                        disabled={operationInProgress === "create"}
                        className="lists__input"
                    />
                    <div className="lists__buttons">
                        <button
                            className="my-button"
                            onClick={handleCreate}
                        >
                            {operationInProgress === "create" ? "Сохранение..." : "Сохранить"}
                        </button>
                        <button
                            className="neg-button"
                            onClick={() => {
                                setIsAdding(false);
                                setNewItem("");
                            }}
                        >
                            Отмена
                        </button>
                    </div>
                </div>
            )}

            {filteredItems.length === 0 && search.length > 0 ? (
                <div className="lk-tab lk-tab--empty">
                    <div className="lk-tab__empty-content">
                        <div className="lk-tab__empty-icon">🔍</div>
                        <h3 className="lk-tab__empty-title">Ничего не найдено</h3>
                        <p className="lk-tab__empty-description">Попробуйте изменить поисковый запрос</p>
                        <button
                            className="my-button lk-tab__btn"
                            onClick={() => setSearch("")}
                        >
                            Очистить поиск
                        </button>
                    </div>
                </div>
            ) : filteredItems.length === 0 && search.length === 0 ? (
                <div className="lk-tab lk-tab--empty">
                    <div className="lk-tab__empty-content">
                        <div className="lk-tab__empty-icon">📝</div>
                        <h3 className="lk-tab__empty-title">{emptyMessage}</h3>
                        <p className="lk-tab__empty-description">Если хотите можете добавить новый элемент</p>
                    </div>
                </div>
            ) : (
                <div className="lists__items">
                    {filteredItems.map(i => {
                        const id = getId(i);
                        const label = getLabel(i);
                        const isEditing = editing === id;
                        const isProcessing = operationInProgress === id ||
                            operationInProgress === `delete-${id}`;

                        return (
                            <div key={id} className={`lists__item ${isEditing ? "lists__item--editing" : ""}`}>
                                {isEditing ? (
                                    <>
                                        <input
                                            id={newLabel}
                                            value={newLabel}
                                            onChange={e => setNewLabel(e.target.value)}
                                            disabled={isProcessing}
                                            className="lists__input"
                                            autoFocus
                                        />
                                        <div className="lists__buttons">
                                            <button
                                                className="my-button"
                                                onClick={handleSave}
                                                disabled={isProcessing || !newLabel.trim() || newLabel.trim() === label}
                                            >
                                                {operationInProgress === id ? "Сохранение..." : "Сохранить"}
                                            </button>
                                            <button
                                                className="neg-button"
                                                onClick={() => setEditing(null)}
                                                disabled={isProcessing}
                                            >
                                                Отмена
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <span className="lists__label">{label}</span>
                                        <div className="lists__buttons">
                                            <button
                                                className="my-button lists__button"
                                                onClick={() => { setEditing(id); setNewLabel(label); }}
                                                disabled={!!operationInProgress || !!editing}
                                            >
                                                Редактировать
                                            </button>
                                            <button
                                                className="neg-button lists__button--delete"
                                                onClick={() => handleDelete(id)}
                                                disabled={!!operationInProgress}
                                            >
                                                {operationInProgress === `delete-${id}` ? "Удаление..." : "Удалить"}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default EditableList;