import { useEffect, useState, useCallback } from "react";
import type { InfoBlock } from "../../../../models/InfoBlock";
import HomeService from "../../../../services/HomeService";

const SpecialistInfoTab: React.FC = () => {
  const [blocks, setBlocks] = useState<InfoBlock[]>([]);
  const [editingBlock, setEditingBlock] = useState<number | null>(null);
  const [newHeader, setNewHeader] = useState("");
  const [newText, setNewText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Мемоизированная функция для загрузки данных
  const fetchSpecialistsInfo = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await HomeService.getContent("useful_info_doctor");
      setBlocks(response.data);
    } catch (e) {
      console.error("Ошибка при получении полезной информации для ЛК пациента: ", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Загрузка данных при монтировании
  useEffect(() => {
    fetchSpecialistsInfo();
  }, [fetchSpecialistsInfo]);

  const handleAddBlock = () => {
    const newId = Math.max(...blocks.map(b => b.id), 0) + 1;
    const newBlocks = [
      ...blocks,
      { id: newId, header: "Заголовок", text: "Новый блок информации" },
    ];
    setBlocks(newBlocks);
    setHasChanges(true);
  };

  const handleEdit = (id: number) => {
    const block = blocks.find(b => b.id === id);
    if (block) {
      setEditingBlock(id);
      setNewHeader(block.header ?? "");
      setNewText(block.text);
    }
  };

  const handleSave = async () => {
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

  const handleCancelEdit = () => {
    setEditingBlock(null);
    setNewHeader("");
    setNewText("");
  };

  // Сохранение изменений на сервер только когда есть реальные изменения
  const handleSaveToServer = async () => {
    // if (!hasChanges) return;

    // try {
    //   setIsLoading(true);
    //   await HomeService.updateContent("useful_info_doctor", blocks);
    //   setHasChanges(false);
    //   console.log("Данные успешно сохранены на сервер");
    // } catch (e) {
    //   console.error("Ошибка при сохранении данных: ", e);
    // } finally {
    //   setIsLoading(false);
    // }
  };

  // Автосохранение при размонтировании компонента (опционально)
  useEffect(() => {
    return () => {
      if (hasChanges) {
        handleSaveToServer();
      }
    };
  }, [hasChanges]);

  if (isLoading && blocks.length === 0) {
    return <div>Загрузка...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button className="my-button edit-info__btn" onClick={handleAddBlock}>
          Добавить блок
        </button>

        {hasChanges && (
          <button
            className="edit-info__save-btn"
            onClick={handleSaveToServer}
            disabled={isLoading}
          >
            {isLoading ? 'Сохранение...' : 'Сохранить на сервер'}
          </button>
        )}
      </div>

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

      {blocks.length === 0 && !isLoading && (
        <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
          Нет информационных блоков. Добавьте первый блок.
        </div>
      )}
    </div>
  );
};

export default SpecialistInfoTab;