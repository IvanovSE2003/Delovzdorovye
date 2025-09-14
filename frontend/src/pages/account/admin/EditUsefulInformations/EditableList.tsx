import { useState, useEffect } from "react";
import ShowError from "../../../../components/UI/ShowError/ShowError";

interface EditableListProps<T> {
    title: string; // заголовок кнопки "Добавить"
    loadItems: () => Promise<T[]>;
    createItem: (label: string) => Promise<void>;
    updateItem: (id: number | string, label: string) => Promise<void>;
    deleteItem: (id: number | string) => Promise<void>;
    getId: (item: T) => number | string;
    getLabel: (item: T) => string;
}

export function EditableList<T>({
    title,
    loadItems,
    createItem,
    updateItem,
    deleteItem,
    getId,
    getLabel,
}: EditableListProps<T>) {
    const [items, setItems] = useState<T[]>([]);
    const [editing, setEditing] = useState<number | string | null>(null);
    const [newLabel, setNewLabel] = useState("");
    const [error, setError] = useState<{ id: number; message: string } | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [newItem, setNewItem] = useState("");

    const load = async () => {
        try {
            const data = await loadItems();
            // сортировка по алфавиту
            setItems([...data].sort((a, b) =>
                getLabel(a).localeCompare(getLabel(b), "ru", { sensitivity: "base" })
            ));
        } catch {
            setError({ id: Date.now(), message: "Ошибка при загрузке данных" });
        }
    };

    useEffect(() => {
        load();
    }, []);

    const handleCreate = async () => {
        if (!newItem.trim()) {
            setError({ id: Date.now(), message: "Название не может быть пустым!" });
            return;
        }
        if (items.some(i => getLabel(i).toLowerCase() === newItem.toLowerCase())) {
            setError({ id: Date.now(), message: "Элемент с таким названием уже существует!" });
            return;
        }

        try {
            await createItem(newItem.trim());
            await load();
            setIsAdding(false);
            setNewItem("");
        } catch {
            setError({ id: Date.now(), message: "Ошибка при создании элемента" });
        }
    };

    const handleSave = async () => {
        if (editing === null) return;
        if (items.some(i =>
            getId(i) !== editing && getLabel(i).toLowerCase() === newLabel.toLowerCase()
        )) {
            setError({ id: Date.now(), message: "Элемент с таким названием уже существует!" });
            return;
        }

        try {
            await updateItem(editing, newLabel.trim());
            await load();
        } catch {
            setError({ id: Date.now(), message: "Ошибка при обновлении элемента" });
        } finally {
            setEditing(null);
        }
    };

    const handleDelete = async (id: number | string) => {
        try {
            await deleteItem(id);
            await load();
        } catch {
            setError({ id: Date.now(), message: "Ошибка при удалении элемента" });
        }
    };

    return (
        <div className="lists">
            <ShowError msg={error} />

            {!isAdding ? (
                <button
                    className="lists__button"
                    onClick={() => setIsAdding(true)}
                >
                    {title}
                </button>
            ) : (
                <div className="lists__item">
                    <input
                        value={newItem}
                        onChange={e => setNewItem(e.target.value)}
                        placeholder="Введите название"
                    />
                    <div className="lists__buttons">
                        <button className="lists__button" onClick={handleCreate}>
                            Сохранить
                        </button>
                        <button
                            className="lists__button btn-delete"
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

            {items.map(i => {
                const id = getId(i);
                const label = getLabel(i);
                return (
                    <div key={id} className="lists__item">
                        {editing === id ? (
                            <>
                                <input
                                    value={newLabel}
                                    onChange={e => setNewLabel(e.target.value)}
                                />
                                <div className="lists__buttons">
                                    <button className="lists__button" onClick={handleSave}>
                                        Сохранить
                                    </button>
                                    <button
                                        className="lists__button btn-delete"
                                        onClick={() => setEditing(null)}
                                    >
                                        Отмена
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <span>{label}</span>
                                <div className="lists__buttons">
                                    <button
                                        className="lists__button"
                                        onClick={() => { setEditing(id); setNewLabel(label); }}
                                    >
                                        Редактировать
                                    </button>
                                    <button
                                        className="lists__button btn-delete"
                                        onClick={() => handleDelete(id)}
                                    >
                                        Удалить
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
