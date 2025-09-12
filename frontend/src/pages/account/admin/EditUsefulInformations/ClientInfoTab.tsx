import { useEffect, useState } from "react";
import type { InfoBlock } from "../../../../models/InfoBlock";
import HomeService from "../../../../services/HomeService";

const ClientInfoTab: React.FC = () => {
  const [blocks, setBlocks] = useState<InfoBlock[]>([]);
  const [editingBlock, setEditingBlock] = useState<number | null>(null);
  const [newHeader, setNewHeader] = useState("");
  const [newText, setNewText] = useState("");

  const handleAddBlock = () => {
    const newId = Math.max(...blocks.map(b => b.id), 0) + 1;
    setBlocks([
      ...blocks,
      { id: newId, header: "Заголовок", text: "Новый блок информации" },
    ]);
  };

  const handleEdit = (id: number) => {
    const block = blocks.find(b => b.id === id);
    if (block) {
      setEditingBlock(id);
      setNewHeader(block.header ?? "");
      setNewText(block.text);
    }
  };

  const handleSave = () => {
    if (editingBlock !== null) {
      setBlocks(blocks.map(b =>
        b.id === editingBlock ? { ...b, header: newHeader, text: newText } : b
      ));
      setEditingBlock(null);
      setNewHeader("");
      setNewText("");
    }
  };

  const fetchClientInfo = async () => {
    try {
      const response = await HomeService.getContent("useful_info_patient");
      setBlocks(response.data);
    } catch (e) {
      console.error("Ошибка при получениир полезной информации для ЛК пациента: ", e);
    }
  }

  const handleCancelEdit = () => {
    setEditingBlock(null);
    setNewHeader("");
    setNewText("");
  };

  useEffect(() => {
    fetchClientInfo();
  }, [])

  return (
    <div>
      <button className="my-button edit-info__btn" onClick={handleAddBlock}>
        Добавить блок
      </button>

      <div className="edit-info__blocks">
        {blocks.map(block => (
          <div key={block.id} className="edit-info__block">
            {editingBlock === block.id ? (
              <>
                <input
                  value={newHeader}
                  onChange={e => setNewHeader(e.target.value)}
                  className="edit-info__input"
                />
                <textarea
                  value={newText}
                  onChange={e => setNewText(e.target.value)}
                  className="edit-info__textarea"
                />
                <div className="edit-info__actions">
                  <button
                    className="edit-info__btn my-button"
                    onClick={handleSave}>
                    Сохранить
                  </button>
                  <button
                    className="edit-info__btn neg-button"
                    onClick={handleCancelEdit}
                  >
                    Отмена
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="edit-info__header"> {block.header} </h2>
                <p className="edit-info__text"> {block.text} </p>
                <div className="edit-info__actions">
                  <button
                    className="edit-info__btn my-button"
                    onClick={() => handleEdit(block.id)}
                  >
                    Редактировать
                  </button>
                  <button
                    className="edit-info__btn neg-button"
                  >
                    Удалить
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {blocks.length === 0 && (
        <div className="consultation__empty">
            Нет информационных блоков. Добавьте первый блок.
        </div>
      )}
    </div>
  );
};

export default ClientInfoTab;
