import { useState } from "react";
import type { InfoBlock } from "../../../../models/InfoBlock";

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

  return (
    <div>
      <button className="edit-info__add-btn" onClick={handleAddBlock}>
        Добавить блок
      </button>

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
              <button onClick={handleSave}>Сохранить</button>
            </>
          ) : (
            <>
              <h2>{block.header}</h2>
              <p>{block.text}</p>
              <button onClick={() => handleEdit(block.id)}>Редактировать</button>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default ClientInfoTab;
