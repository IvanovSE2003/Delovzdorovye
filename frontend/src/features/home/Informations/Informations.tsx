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

    const [error, setError] = useState<{id: number; message: string}>({id: 0, message: ''});
    const [message, setMessage] = useState<{id: number; message: string}>({id: 0, message: ''});

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
                    // await HomeService.createContent("useful_informations", {
                    //     header: block.header,
                    //     text: block.text
                    // });
                }
            }
            
            setMessage({id: Date.now(), message: "Данные успешно сохранены"});
            fetchInformations();
        } catch (e) {
            processError(e, "Ошибка при сохранении данных", setError);
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
            await HomeService.deleteContent("useful_informations", id);
            setMessage({id: Date.now(), message: "Блок успешно удален"});
            fetchInformations();
        } catch (e) {
            processError(e, "Ошибка при удалении блока информации");
        }
    };

    const addNewBlock = () => {
        setContent(prev => [
            ...prev,
            {
                id: 0, // 0 или null для новых блоков
                header: "Новый заголовок",
                text: "Введите текст здесь"
            }
        ]);
    };

    const fetchInformations = async () => {
        try {
            const response = await HomeService.getContent('useful_informations');
            setContent(response.data);
            setOriginalContent(response.data);
        } catch (e) {
            processError(e, "Ошибка при получении данных", setError);
            // Устанавливаем данные по умолчанию при ошибке
            // setContent([
            //     {
            //         id: 1,
            //         header: "Как записаться на консультацию?",
            //         text: "Зарегистрируйтесь или войдите в личный кабинет.\nВыберите удобные дату и время.\nОплатите консультацию.\nВ назначенное время подключитесь к видеоконсультации."
            //     },
            //     {
            //         id: 2,
            //         header: "Насколько конфиденциальны мои данные?",
            //         text: "Всё, что вы скажете на консультации, останется между вами и специалистом. Мы не передаем данные третьим лицам и используем шифрование для защиты переписки."
            //     },
            //     {
            //         id: 3,
            //         header: "Почему онлайн-консультации удобнее очных встреч?",
            //         text: "консультируйтесь не выходя из дома\nподключайтесь без поездок и очередей\nпереносите или продлевайте консультации в один клик"
            //     }
            // ]);
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

                    {content.map((block, blockIndex) => (
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
                    ))}

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