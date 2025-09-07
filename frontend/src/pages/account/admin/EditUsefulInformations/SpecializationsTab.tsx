import { useState, useEffect } from "react";
import type { TypeResponse } from "../../../../models/response/DefaultResponse";
import type { AxiosError } from "axios";
import DoctorService from "../../../../services/DoctorService";

export interface Specializations {
    id: number;
    name: string;
}

const DEFAULT_NAME = "Новая специализация";

// Сортировка специализация в алфавитном порядке
const sortSpecializations = (items: Specializations[]) =>
    [...items].sort((a, b) => a.name.localeCompare(b.name, "ru", { sensitivity: "base" }));

const SpecializationsTab: React.FC = () => {
    const [specializations, setSpecializations] = useState<Specializations[]>([]);
    const [editing, setEditing] = useState<number | null>(null);
    const [newLabel, setNewLabel] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [fadeOut, setFadeOut] = useState(false);

    const showError = (msg: string) => {
        setError(msg);
        setFadeOut(false);

        setTimeout(() => setFadeOut(true), 4000);
        setTimeout(() => {
            setError(null);
            setFadeOut(false);
        }, 5000);
    };

    // Вывод ошибки с сервера
    const handleError = (e: unknown, message: string) => {
        const error = e as AxiosError<TypeResponse>;
        const msg = `${message} ${error.response?.data.message ?? ""}`;
        showError(msg);
    };

    // Загрузка данных
    const loadSpecializations = async () => {
        try {
            const response = await DoctorService.getSpecializations();
            setSpecializations(sortSpecializations(response.data));
        } catch (e) {
            handleError(e, "Ошибка при получении специализаций:");
        }
    };

    // Удаление данных
    const deleteSpecialization = async (id: number) => {
        try {
            await DoctorService.deleteSpecialization(id);
            setSpecializations(prev => prev.filter(s => s.id !== id));
        } catch (e) {
            handleError(e, "Ошибка при удалении специализации:");
        }
    };

    // Создание данных
    const createSpecialization = async () => {
        try {
            if (specializations.some(s => s.name.toLowerCase() === DEFAULT_NAME.toLowerCase())) {
                showError("Специализация с таким названием уже существует!");
                return;
            }

            const tempId = Date.now();
            const newItem: Specializations = { id: tempId, name: DEFAULT_NAME };

            setSpecializations(prev => [newItem, ...prev]);

            const response = await DoctorService.createSpecialization(DEFAULT_NAME);

            setSpecializations(prev =>
                prev.map(s => (s.id === tempId ? { ...s, id: response.data.id } : s))
            );
        } catch (e) {
            handleError(e, "Ошибка при создании специализации:");
        }
    };

    // Сохранение данных на сервер
    const handleSave = async () => {
        if (editing === null) return;

        if (specializations.some(s =>
            s.id !== editing && s.name.toLowerCase() === newLabel.toLowerCase()
        )) {
            showError("Специализация с таким названием уже существует!");
            return;
        }

        try {
            await DoctorService.updateSpecialization(editing, newLabel);

            setSpecializations(prev =>
                sortSpecializations(
                    prev.map(s => (s.id === editing ? { ...s, name: newLabel } : s))
                )
            );
        } catch (e) {
            handleError(e, "Ошибка при изменении специализации:");
        } finally {
            setEditing(null);
        }
    };

    // Загрузка данных при открытии вкладки
    useEffect(() => {
        loadSpecializations();
    }, []);

    return (
        <div className="problems-list">
            <div className="problems-list">
                {error && (
                    <div className={`problems-list__error ${fadeOut ? "fade-out" : ""}`}>
                        {error}
                    </div>
                )}
            </div>

            <button className="problems-list__button" onClick={createSpecialization}>
                Добавить специализацию
            </button>

            {specializations.map(p => (
                <div key={p.id} className="problems-list__item">
                    {editing === p.id ? (
                        <>
                            <input
                                value={newLabel}
                                onChange={e => setNewLabel(e.target.value)}
                            />
                            <div className="problems-list__buttons">
                                <button className="problems-list__button" onClick={handleSave}>
                                    Сохранить
                                </button>
                                <button
                                    className="problems-list__button btn-delete"
                                    onClick={() => setEditing(null)}
                                >
                                    Отмена
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <span>{p.name}</span>
                            <div className="problems-list__buttons">
                                <button
                                    className="problems-list__button"
                                    onClick={() => {
                                        setEditing(p.id);
                                        setNewLabel(p.name);
                                    }}
                                >
                                    Редактировать
                                </button>
                                <button
                                    className="problems-list__button btn-delete"
                                    onClick={() => deleteSpecialization(p.id)}
                                >
                                    Удалить
                                </button>
                            </div>
                        </>
                    )}
                </div>
            ))}
        </div>
    );
};

export default SpecializationsTab;
