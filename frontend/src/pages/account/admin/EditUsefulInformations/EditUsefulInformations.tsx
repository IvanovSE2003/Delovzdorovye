import { useState, useEffect } from "react";
import AccountLayout from "../../AccountLayout";
import "./EditUsefulInformations.scss";
import BatchService from "../../../../services/BatchService";

interface InfoBlock {
  id: number;
  header: string;
  text: string;
}

const EditUsefulInformations: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"client" | "specialist">("client");
  const [infoData, setInfoData] = useState<Record<string, InfoBlock[]>>({
    client: [],
    specialist: [],
  });
  const [editingBlock, setEditingBlock] = useState<{ tab: string; id: number } | null>(null);
  const [newText, setNewText] = useState("");
  const [newHeader, setNewHeader] = useState<string>("");
  const [deletingBlock, setDeletingBlock] = useState<{ tab: string; id: number } | null>(null);

  const loadClientData = async () => {
    // const response = BatchService.getClientUsefulBlock();
  }

  const loadSpecialistData = async () => {
    // const response = BatchService.
  }

  const handleEdit = (tab: string, id: number) => {
    const block = infoData[tab].find(item => item.id === id);
    if (block) {
      setEditingBlock({ tab, id });
      setNewText(block.text);
      setNewHeader(block.header);
    }
  };

  const handleDelete = (tab: string, id: number) => {
    setDeletingBlock({ tab, id });
  };

  const confirmDelete = () => {
    if (deletingBlock) {
      const updatedData = { ...infoData };
      updatedData[deletingBlock.tab] = updatedData[deletingBlock.tab].filter(
        item => item.id !== deletingBlock.id
      );

      setInfoData(updatedData);
      setDeletingBlock(null);

      // В реальном приложении здесь был бы API-запрос для удаления
      console.log("Блок удален:", updatedData);
    }
  };

  const cancelDelete = () => {
    setDeletingBlock(null);
  };

  const handleSave = () => {
    if (editingBlock) {
      const updatedData = { ...infoData };
      const blockIndex = updatedData[editingBlock.tab].findIndex(item => item.id === editingBlock.id);

      if (blockIndex !== -1) {
        updatedData[editingBlock.tab][blockIndex] = {
          ...updatedData[editingBlock.tab][blockIndex],
          text: newText
        };

        setInfoData(updatedData);

        // В реальном приложении здесь был бы API-запрос для сохранения
        console.log("Сохранение данных:", updatedData);
      }

      setEditingBlock(null);
      setNewText("");
    }
  };

  const handleCancel = () => {
    setEditingBlock(null);
    setNewText("");
  };

  const handleAddBlock = () => {
    const updatedData = { ...infoData };
    const newId = Math.max(...updatedData[activeTab].map(item => item.id), 0) + 1;

    updatedData[activeTab].push({
      id: newId,
      header: "Заголовок",
      text: "Новый блок информации. Нажмите 'Редактировать', чтобы изменить содержимое."
    });

    setInfoData(updatedData);

    // В реальном приложении здесь был бы API-запрос для сохранения
    console.log("Добавлен новый блок:", updatedData);
  };


  return (
    <AccountLayout>
      <div className="edit-info">
        <div className="edit-info__tabs">
          <button
            className={`edit-info__tab ${activeTab === "client" ? "edit-info__tab--active" : ""}`}
            onClick={() => {
              loadClientData();
              setActiveTab("client")
            }}
          >
            ЛК клиента
          </button>
          <button
            className={`edit-info__tab ${activeTab === "specialist" ? "edit-info__tab--active" : ""}`}
            onClick={() => setActiveTab("specialist")}
          >
            ЛК специалиста
          </button>
        </div>

        <div className="edit-info__content">
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