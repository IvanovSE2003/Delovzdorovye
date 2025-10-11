import './Informations.scss'
import AnimatedBlock from '../../../components/AnimatedBlock';
import { useEffect, useState } from 'react';
import type { ElementHomePageProps } from '../../../pages/Homepage';
import { processError } from '../../../helpers/processError';
import HomeService from '../../../services/HomeService';
import type { InfoBlock } from '../../../models/InfoBlock';
import ShowError from '../../../components/UI/ShowError/ShowError';
import LoaderUsefulInfo from '../../../components/UI/LoaderUsefulInfo/LoaderUsefulInfo';

const Informations: React.FC<ElementHomePageProps> = ({ role }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [content, setContent] = useState<InfoBlock[]>([]);
    const [originalContent, setOriginalContent] = useState<InfoBlock[]>([]);

    const [error, setError] = useState<{ id: number; message: string }>({ id: 0, message: '' });
    const [message, setMessage] = useState<{ id: number; message: string }>({ id: 0, message: '' });
    const [loading, setLoading] = useState<boolean>(false);

    // Получение блоков информации
    const fetchInformations = async () => {
        try {
            setLoading(true);
            const response = await HomeService.getContent('useful_informations');
            setContent(response.data.contents);
            setOriginalContent(response.data.contents);
        } catch (e) {
            processError(e, "Ошибка при получении данных");
        } finally {
            setLoading(false);
        }
    };

    // Сохранение блока информации
    const handleSave = async () => {
        try {
            setLoading(true);
            for (const block of content) {
                if (block.id) {
                    // Либо обновляем текущий блок
                    await HomeService.editContent("useful_informations", block);
                } else {
                    // Либо создаем новую блок
                    await HomeService.addContent("useful_informations", block);
                }
            }

            await fetchInformations();
            setMessage({ id: Date.now(), message: "Данные успешно сохранены" });
        } catch (e) {
            processError(e, "Ошибка при сохранении данных", setError);
        } finally {
            setIsEditing(false);
            setLoading(false);
        }
    };

    // Добавление нового блока информации
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

    // Удаление блока информации
    const deleteInformation = async (id: number) => {
        try {
            setLoading(true);
            setContent(prev => prev.filter(block => block.id !== id));
            setOriginalContent(prev => prev.filter(block => block.id !== id));
            await HomeService.deleteContent(id);
            await fetchInformations();
            setMessage({ id: Date.now(), message: "Блок успешно удален" });

        } catch (e) {
            processError(e, "Ошибка при удалении блока информации", setError);
        } finally {
            setLoading(false);
        }
    };

    // Изменение заголовка
    const handleBlockTitleChange = (index: number, value: string) => {
        setContent(prev =>
            prev.map((block, i) =>
                i === index ? { ...block, header: value } : block
            )
        );
    };

    // Изменение текстовой части
    const handleBlockTextChange = (index: number, value: string) => {
        setContent(prev =>
            prev.map((block, i) =>
                i === index ? { ...block, text: value } : block
            )
        );
    };

    // Редактирование/отмена редактирования
    const handleEditToggle = () => {
        if (isEditing) {
            setContent([...originalContent]);
        } else {
            setOriginalContent([...content]);
        }
        setIsEditing(!isEditing);
    };

    useEffect(() => {
        fetchInformations();
    }, []);

    if (loading) return (
        <div className='informations container' id="informations">
            <AnimatedBlock>
                <div className="container__box">
                    <h2 className='informations__title'>Полезная информация</h2>
                    <div className="informations__block">
                        <LoaderUsefulInfo />
                    </div>
                </div>
            </AnimatedBlock>
        </div>
    )

    return (
        <div className='informations container' id="informations">
            <AnimatedBlock>
                <div className="container__box">
                    <h2 className='informations__title'>Полезная информация</h2>

                    <ShowError msg={error} />
                    <ShowError msg={message} mode="MESSAGE" />

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
                                <p className="informations__block__text">
                                    {block.text}
                                </p>
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