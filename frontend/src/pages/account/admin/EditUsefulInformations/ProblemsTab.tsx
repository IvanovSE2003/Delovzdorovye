import { useState, useEffect } from "react";
import ConsultationsStore from "../../../../store/consultations-store";

interface Problem {
    value: number;
    label: string;
}

const ProblemsTab: React.FC = () => {
    const store = new ConsultationsStore();
    const [problems, setProblems] = useState<Problem[]>([]);
    const [editingProblem, setEditingProblem] = useState<number | null>(null);
    const [newLabel, setNewLabel] = useState("");

    const loadProblems = async () => {
        const data = await store.getProblems();
        setProblems(data);
    };

    useEffect(() => {
        loadProblems();
    }, []);

    const handleSave = async () => {
        if (editingProblem !== null) {
            await store.updateProblem(editingProblem, newLabel);
            loadProblems();
            setEditingProblem(null);
        }
    };

    return (
        <div className="problems-list">
            <button
                className="problems-list__button"
                onClick={async () => {
                    await store.createProblem("Новая проблема");
                    loadProblems();
                }}>
                Добавить проблему
            </button>

            {problems.map(p => (
                <div key={p.value} className="problems-list__item">
                    {editingProblem === p.value ? (
                        <>
                            <input value={newLabel} onChange={e => setNewLabel(e.target.value)} />
                            <div className="problems-list__buttons">
                                <button
                                    className="problems-list__button"
                                    onClick={handleSave}
                                >
                                    Сохранить
                                </button>
                                <button
                                    className="problems-list__button btn-delete"
                                    onClick={() => setEditingProblem(null)}
                                >
                                    Отметить
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <span>{p.label}</span>
                            <div className="problems-list__buttons">
                                <button
                                    className="problems-list__button"
                                    onClick={() => { setEditingProblem(p.value); setNewLabel(p.label); }}
                                >
                                    Редактировать
                                </button>
                                <button
                                    className="problems-list__button btn-delete"
                                    onClick={async () => { await store.deleteProblem(p.value); loadProblems(); }}
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

export default ProblemsTab;
