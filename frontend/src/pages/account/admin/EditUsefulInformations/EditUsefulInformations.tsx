import { useState } from "react";
import AccountLayout from "../../AccountLayout";
import "./EditUsefulInformations.scss";
import BatchService from "../../../../services/BatchService";
import ConsultationsStore from "../../../../store/consultations-store";

interface InfoBlock {
  id: number;
  header?: string;
  text: string;
}

interface Problem {
  value: number;
  label: string;
}

const EditUsefulInformations: React.FC = () => {
  const store = new ConsultationsStore();
  const [activeTab, setActiveTab] = useState<"client" | "specialist" | "problems">("client");
  const [infoData, setInfoData] = useState<Record<string, InfoBlock[]>>({
    client: [],
    specialist: [],
    problems: [],
  });

  const [problems, setProblems] = useState<Problem[]>([]);

  const [editingBlock, setEditingBlock] = useState<{ tab: string; id: number } | null>(null);
  const [newText, setNewText] = useState("");
  const [newHeader, setNewHeader] = useState<string>("");
  const [deletingBlock, setDeletingBlock] = useState<{ tab: string; id: number } | null>(null);

  // 🔹 Состояния для проблем
  const [editingProblem, setEditingProblem] = useState<number | null>(null);
  const [newProblemLabel, setNewProblemLabel] = useState<string>("");

  const loadClientData = async () => {
    // const response = BatchService.getClientUsefulBlock();
  };

  const loadSpecialistData = async () => {
    // const response = BatchService.
  };

  const handleEdit = (tab: string, id: number) => {
    const block = infoData[tab].find((item) => item.id === id);
    if (block) {
      setEditingBlock({ tab, id });
      setNewText(block.text);
      setNewHeader(block.header ?? "");
    }
  };

  const handleDelete = (tab: string, id: number) => {
    setDeletingBlock({ tab, id });
  };

  const confirmDelete = () => {
    if (deletingBlock) {
      const updatedData = { ...infoData };
      updatedData[deletingBlock.tab] = updatedData[deletingBlock.tab].filter(
        (item) => item.id !== deletingBlock.id
      );

      setInfoData(updatedData);
      setDeletingBlock(null);

      console.log("Блок удален:", updatedData);
    }
  };

  const cancelDelete = () => {
    setDeletingBlock(null);
  };

  const handleSave = () => {
    if (editingBlock) {
      const updatedData = { ...infoData };
      const blockIndex = updatedData[editingBlock.tab].findIndex(
        (item) => item.id === editingBlock.id
      );

      if (blockIndex !== -1) {
        updatedData[editingBlock.tab][blockIndex] = {
          ...updatedData[editingBlock.tab][blockIndex],
          header: newHeader,
          text: newText,
        };

        setInfoData(updatedData);

        console.log("Сохранение данных:", updatedData);
      }

      setEditingBlock(null);
      setNewText("");
      setNewHeader("");
    }
  };

  const handleCancel = () => {
    setEditingBlock(null);
    setNewText("");
    setNewHeader("");
  };

  const handleAddBlock = () => {
    const updatedData = { ...infoData };
    const newId = Math.max(...updatedData[activeTab].map((item) => item.id), 0) + 1;

    updatedData[activeTab].push({
      id: newId,
      header: "Заголовок",
      text: "Новый блок информации. Нажмите 'Редактировать', чтобы изменить содержимое.",
    });

    setInfoData(updatedData);

    console.log("Добавлен новый блок:", updatedData);
  };


  // 🔹 блок проблем

  const formRecordClick = async () => {
    try {
      const data = await store.getProblems();
      setProblems(data);
    } catch (e) {
      console.error("Ошибка при получении проблем: ", e);
    }
    setActiveTab("problems");
  };

  const handleEditProblem = (id: number) => {
    const problem = problems.find((p) => p.value === id);
    if (problem) {
      setEditingProblem(id);
      setNewProblemLabel(problem.label);
    }
  };

  const handleSaveProblem = async () => {
    if (editingProblem !== null) {
      const updatedProblems = problems.map((p) =>
        p.value === editingProblem ? { ...p, label: newProblemLabel } : p
      );
      setProblems(updatedProblems);
      console.log("Обновленные проблемы:", updatedProblems);

      await store.updateProblem(editingProblem, newProblemLabel)

      setEditingProblem(null);
      setNewProblemLabel("");
    }
  };

  const handleCancelProblem = () => {
    setEditingProblem(null);
    setNewProblemLabel("");
  };

  const handleAddProblem = async () => {
    const newId = Math.max(...problems.map((item) => item.value), 0) + 1;
    const newProblem = {
      value: newId,
      label: "Новая проблема",
    };

    setProblems([...problems, newProblem]);
    await store.createProblem(newProblem.label);
    formRecordClick();
    console.log("Добавлена новая проблема:", newProblem);
  };

  const handleDeleteProblem = async (id: number) => {
    await store.deleteProblem(id);
    formRecordClick();
    setEditingProblem(null);
    setNewProblemLabel("");
  }

  return (
    <AccountLayout>
      <div className="edit-info">
        <div className="edit-info__tabs">
          <button
            className={`edit-info__tab ${activeTab === "client" ? "edit-info__tab--active" : ""}`}
            onClick={() => {
              loadClientData();
              setActiveTab("client");
            }}
          >
            ЛК клиента
          </button>
          <button
            className={`edit-info__tab ${activeTab === "specialist" ? "edit-info__tab--active" : ""}`}
            onClick={() => {
              loadSpecialistData();
              setActiveTab("specialist");
            }}
          >
            ЛК специалиста
          </button>
          <button
            className={`edit-info__tab ${activeTab === "problems" ? "edit-info__tab--active" : ""}`}
            onClick={formRecordClick}
          >
            Форма записи
          </button>
        </div>

        <div className="edit-info__content">
          {activeTab !== "problems" ? (
            <>
              {infoData[activeTab].map((item) => (
                <div key={item.id} className="edit-info__block">
                  {editingBlock && editingBlock.tab === activeTab && editingBlock.id === item.id ? (
                    <>
                      <input
                        type="text"
                        value={newHeader}
                        onChange={(e) => setNewHeader(e.target.value)}
                        className="edit-info__input"
                      />

                      <textarea
                        className="edit-info__textarea"
                        value={newText}
                        onChange={(e) => setNewText(e.target.value)}
                        rows={5}
                      />
                      <div className="edit-info__actions">
                        <button className="edit-info__btn edit-info__btn--save" onClick={handleSave}>
                          Сохранить
                        </button>
                        <button className="edit-info__btn edit-info__btn--cancel" onClick={handleCancel}>
                          Отмена
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <h2 className="edit-info__text-header">{item.header}</h2>
                      <p className="edit-info__text">{item.text}</p>
                      <div className="edit-info__actions">
                        <button
                          className="edit-info__btn"
                          onClick={() => handleEdit(activeTab, item.id)}
                        >
                          Редактировать
                        </button>
                        <button
                          className="neg-button"
                          onClick={() => handleDelete(activeTab, item.id)}
                        >
                          Удалить
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}

              <button className="edit-info__add-btn" onClick={handleAddBlock}>
                Добавить блок
              </button>
            </>
          ) : (
            <>
              <button className="edit-info__add-btn" onClick={handleAddProblem}>
                Добавить проблему
              </button>
              <div className="problems-list">
                {problems.map((problem) => (
                  <div key={problem.value} className="problems-list__item">
                    {editingProblem === problem.value ? (
                      <>
                        <input
                          type="text"
                          value={newProblemLabel}
                          onChange={(e) => setNewProblemLabel(e.target.value)}
                          className="problems-list__input"
                        />
                        <div className="problems-list__actions">
                          <button className="btn-edit" onClick={handleSaveProblem}>
                            Сохранить
                          </button>
                          <button className="btn-delete" onClick={handleCancelProblem}>
                            Отмена
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <span>{problem.label}</span>
                        <div className="problems-list__actions">
                          <button className="btn-edit" onClick={() => handleEditProblem(problem.value)}>
                            Редактировать
                          </button>
                          <button className="btn-delete" onClick={() => handleDeleteProblem(problem.value)}>
                            Удалить
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {deletingBlock && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Подтверждение удаления</h3>
            <p>Вы уверены, что хотите удалить этот блок информации?</p>
            <div className="modal-actions">
              <button className="modal-btn modal-btn--cancel" onClick={cancelDelete}>
                Отмена
              </button>
              <button className="modal-btn modal-btn--confirm" onClick={confirmDelete}>
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </AccountLayout>
  );
};

export default EditUsefulInformations;
