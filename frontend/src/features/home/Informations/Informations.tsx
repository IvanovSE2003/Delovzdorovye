import './Informations.scss'
import AnimatedBlock from '../../../components/AnimatedBlock';
import { useState } from 'react';
import type { ElementHomePageProps } from '../../../pages/Homepage';

type ContentBlock = {
    title: string;
    text: string;
}

type ContentData = {
    title: string;
    blocks: ContentBlock[];
}

const Informations: React.FC<ElementHomePageProps> = ({ role }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [content, setContent] = useState<ContentData>({
        title: "Полезная информация",
        blocks: [
            {
                title: "Как записаться на консультацию?",
                text: "Зарегистрируйтесь или войдите в личный кабинет.\nВыберите удобные дату и время.\nОплатите консультацию.\nВ назначенное время подключитесь к видеоконсультации."
            },
            {
                title: "Насколько конфиденциальны мои данные?",
                text: "Всё, что вы скажете на консультации, останется между вами и спциалистом. Мы не передаем данные третьим лицам и используем шифрование для защиты переписки."
            },
            {
                title: "Почему онлайн-консультации удобнее очных встреч?",
                text: "консультируйтесь не выходя из дома\nподключайтесь без поездок и очередей\nпереносите или продлевайте консультации в один клик"
            }
        ]
    });

    const handleEditToggle = () => {
        setIsEditing(!isEditing);
    };

    const handleSave = () => {
        setIsEditing(false);
        // Здесь можно добавить сохранение данных на сервер
    };

    const handleCancel = () => {
        setIsEditing(false);
        // Можно добавить сброс изменений
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setContent(prev => ({ ...prev, title: e.target.value }));
    };

    const handleBlockTitleChange = (index: number, value: string) => {
        setContent(prev => ({
            ...prev,
            blocks: prev.blocks.map((block, i) =>
                i === index ? { ...block, title: value } : block
            )
        }));
    };

    const handleBlockTextChange = (index: number, value: string) => {
        setContent(prev => ({
            ...prev,
            blocks: prev.blocks.map((block, i) =>
                i === index ? { ...block, text: value } : block
            )
        }));
    };

    return (
        <div className='informations container' id="informations">
            <AnimatedBlock>
                <div className="container__box">
                    <h2 className='informations__title'>{content.title}</h2>

                    {content.blocks.map((block, blockIndex) => (
                        <div key={blockIndex} className={`informations__block ${isEditing ? "block-edit" : ""}`}>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={block.title}
                                    onChange={(e) => handleBlockTitleChange(blockIndex, e.target.value)}
                                    className="informations__block__title-input"
                                />
                            ) : (
                                <h3 className="informations__block__title">
                                    {block.title}
                                </h3>
                            )}

                            {isEditing ? (
                                <textarea
                                    value={block.text}
                                    onChange={(e) => handleBlockTextChange(blockIndex, e.target.value)}
                                    className="informations__block__textarea"
                                    rows={6}
                                    placeholder="Введите текст (используйте Enter для переноса строк)"
                                />
                            ) : (
                                <p className='informations__block__text'>{block.text}</p>
                            )}
                        </div>
                    ))}

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
                                onClick={handleCancel}
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