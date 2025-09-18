import './Informations.scss'
import AnimatedBlock from '../../../components/AnimatedBlock';
import { useEffect, useState } from 'react';
import type { ElementHomePageProps } from '../../../pages/Homepage';
import { processError } from '../../../helpers/processError';
import HomeService from '../../../services/HomeService';
import type { InfoBlock } from '../../../models/InfoBlock';
import ShowError from '../../../components/UI/ShowError/ShowError';

const Informations: React.FC<ElementHomePageProps> = ({ role }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [content, setContent] = useState<InfoBlock[]>([]);
    const [originalContent, setOriginalContent] = useState<InfoBlock[]>([]);

    const [error, setError] = useState<{ id: number; message: string }>({ id: 0, message: '' });
    const [message, setMessage] = useState<{ id: number; message: string }>({ id: 0, message: '' });

    const handleEditToggle = () => {
        if (isEditing) {
            // При выходе из редактирования восстанавливаем оригинальные данные
            setContent([...originalContent]);
        } else {
            // При входе в редактирование сохраняем текущие данные как оригинальные
            setOriginalContent([...content]);
        }
        setIsEditing(!isEditing);
    };

    const handleSave = async () => {
        try {
            // Сохраняем все блоки
            for (const block of content) {
                if (block.id) {
                    // Обновляем существующий блок
                    await HomeService.editContent("useful_informations", block);
                } else {
                    // Создаем новый блок
                    await HomeService.addContent("useful_informations", block);
                }
            }

            await fetchInformations();
            setMessage({ id: Date.now(), message: "Данные успешно сохранены" });
        } catch (e) {
            processError(e, "Ошибка при сохранении данных", setError);
        } finally {
            setIsEditing(false);
        }
    };

    const handleBlockTitleChange = (index: number, value: string) => {
        setContent(prev =>
            prev.map((block, i) =>
                i === index ? { ...block, header: value } : block
            )
        );
    };

    const handleBlockTextChange = (index: number, value: string) => {
        setContent(prev =>
            prev.map((block, i) =>
                i === index ? { ...block, text: value } : block
            )
        );
    };

    const deleteInformation = async (id: number) => {
        try {
            setContent(prev => prev.filter(block => block.id !== id));
            setOriginalContent(prev => prev.filter(block => block.id !== id));
            await HomeService.deleteContent("useful_informations", id);
            await fetchInformations();
            setMessage({ id: Date.now(), message: "Блок успешно удален" });

        } catch (e) {
            processError(e, "Ошибка при удалении блока информации", setError);
        }
    };

    const addNewBlock = () => {
        setContent(prev => [
            ...prev,
            {
                id: 0,
                header: "Новый заголовок",
                text: "Введите текст здесь"
            }
        ]);
    };

    const fetchInformations = async () => {
        try {
            const response = await HomeService.getContent('useful_informations');
            setContent(response.data.contents);
            setOriginalContent(response.data.contents);
        } catch (e) {
            processError(e, "Ошибка при получении данных");
        }
    };

    useEffect(() => {
        fetchInformations();
    }, []);

    return (
        <div className='informations container' id="informations">
            <AnimatedBlock>
                <div className="container__box">
                    <h2 className='informations__title'>Полезная информация</h2>

                    <ShowError
                        msg={error}
                    />

                    <ShowError
                        msg={message}
                        mode="MESSAGE"
                    />

                    {content.length > 0 ? content.map((block, blockIndex) => (
                        <div key={block.id || `new-${blockIndex}`} className={`informations__block ${isEditing ? "block-edit" : ""}`}>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={block.header}
                                    onChange={(e) => handleBlockTitleChange(blockIndex, e.target.value)}
                                    className="informations__block__title-input"
                                    placeholder="Заголовок блока"
                                />
                            ) : (
                                <h3 className="informations__block__title">
                                    {block.header}
                                </h3>
                            )}

                            {isEditing ? (
                                <div className="informations__block__edit-wrapper">
                                    <textarea
                                        value={block.text}
                                        onChange={(e) => handleBlockTextChange(blockIndex, e.target.value)}
                                        className="informations__block__textarea"
                                        rows={4}
                                        placeholder="Введите текст (используйте Enter для переноса строк)"
                                    />
                                    <button
                                        className='neg-button informations__block__button'
                                        onClick={() => block.id && deleteInformation(block.id)}
                                        disabled={!block.id}
                                        title={!block.id ? "Сначала сохраните блок" : "Удалить блок"}
                                    >
                                        Удалить
                                    </button>
                                </div>
                            ) : (
                                <p className="informations__block__text">{block.text}</p>
                            )}
                        </div>
                    )) : (
                        <div className="costs__block">
                            <h3 className="costs__block--none">
                                Нет данных
                            </h3>
                        </div>
                    )}

                    {isEditing && (
                        <div className="informations__add-block">
                            <button
                                className='my-button informations__add-button'
                                onClick={addNewBlock}
                            >
                                + Добавить новый блок
                            </button>
                        </div>
                    )}

                    <div className="informations__buttons">
                        {role === "ADMIN" && (
                            <button
                                className={`my-button ${isEditing ? 'editing' : ''}`}
                                onClick={isEditing ? handleSave : handleEditToggle}
                            >
                                {isEditing ? 'Сохранить' : 'Редактировать'}
                            </button>
                        )}

                        {isEditing && (
                            <button
                                className="neg-button"
                                onClick={handleEditToggle}
                            >
                                Отмена
                            </button>
                        )}
                    </div>
                </div>
            </AnimatedBlock>
        </div>
    )
}

export default Informations;