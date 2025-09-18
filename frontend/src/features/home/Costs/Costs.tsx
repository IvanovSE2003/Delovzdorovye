import AnimatedBlock from '../../../components/AnimatedBlock';
import { useEffect, useState } from 'react';
import HomeService from '../../../services/HomeService';
import type { InfoBlock } from '../../../models/InfoBlock';
import type { ElementHomePageProps } from '../../../pages/Homepage';
import { processError } from '../../../helpers/processError';
import './Costs.scss'
import ShowError from '../../../components/UI/ShowError/ShowError';

const Costs: React.FC<ElementHomePageProps> = ({ role }) => {
    const [data, setData] = useState<InfoBlock[]>([] as InfoBlock[]);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [message, setMessage] = useState<{ id: number; message: string }>({ id: 0, message: "" })
    const [error, setError] = useState<{ id: number; message: string }>({ id: 0, message: "" });

    // Получение данных о стоимости услуг
    const fetchData = async () => {
        try {
            const response = await HomeService.getContent("cost_consultation");
            setData(response.data.contents);
        } catch (e) {
            processError(e, "Ошибка при получении данных о стоимости услуг", setError);
        }
    }

    // Получение данных при загрузке блока
    useEffect(() => {
        fetchData();
    }, [])

    // Изменение заголовка
    const handleHeaderChange = (id: number, newHeader: string) => {
        setData(prev =>
            prev.map(item =>
                item.id === id ? { ...item, header: newHeader } : item
            )
        );
    };

    // Изменение текста
    const handleTextChange = (id: number, newText: string) => {
        setData(prev =>
            prev.map(item =>
                item.id === id ? { ...item, text: newText } : item
            )
        );
    };

    // Сохранение измененного блока
    const handleSave = async (data: InfoBlock) => {
        try {
            await HomeService.editContent("cost_consultation", data);
            setMessage({ id: Date.now(), message: "Блок стомости успешно изменен" });
        } catch (e) {
            processError(e, "Ошибка при сохранение блока стоимости", setError);
        } finally {
            setIsEditing(false);
        }
    };

    // Добавление нового блока
    const handleAdd = async () => {
        try {
            const newBlock: InfoBlock = {
                id: Date.now(),
                header: "Заголовок",
                text: "Текст"
            };

            await HomeService.addContent("cost_consultation", newBlock);
            setData(prev => [...prev, newBlock]);
            setMessage({ id: Date.now(), message: "Блок стоимости успешно добавлен" });
        } catch (e) {
            processError(e, "Ошибка при добавлении блока стоимости", setError);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await HomeService.deleteContent(id);
            setMessage({ id: Date.now(), message: "Блок стоимости успешно удален"});
        } catch (e) {
            processError(e, "Ошибка при удалении блока стоимости", setError);
        }
    }

    return (
        <AnimatedBlock>
            <div className="costs container" id="costs">
                <div className="container__box">
                    <h2 className='costs__title'>Стоимость консультации</h2>

                    <ShowError msg={message} mode="MESSAGE" />
                    <ShowError msg={error} />

                    <div className={`${isEditing ? "costs__box" : ""}`}>
                        {data.length > 0 ? data.map(d => (
                            <div key={d.id} className="costs__block">
                                {isEditing ? (
                                    <>
                                        <input
                                            type="text"
                                            className="costs__block__input"
                                            value={d.header}
                                            onChange={(e) => handleHeaderChange(d.id, e.target.value)}
                                        />
                                        <textarea
                                            className="costs__block__textarea"
                                            value={d.text}
                                            onChange={(e) => handleTextChange(d.id, e.target.value)}
                                        />

                                        <button
                                            className='costs__button-edit'
                                            onClick={() => handleSave(d)}
                                        >
                                            Сохранить
                                        </button>

                                        <button
                                            className='costs__button-edit costs__button-delete'
                                            onClick={() => handleDelete(d.id)}
                                        >
                                            Удалить
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <h3 className="costs__block__title">{d.header}</h3>
                                        <p className="costs__block__description">{d.text}</p>
                                    </>
                                )}
                            </div>
                        )) : (
                            <div className="costs__block">
                                <h3 className="costs__block--none">
                                    Нет данных
                                </h3>
                            </div>
                        )}
                    </div>

                    {role === "ADMIN" && !isEditing && (
                        <button
                            className='costs__button-edit'
                            onClick={() => setIsEditing(true)}
                        >
                            Редактировать
                        </button>
                    )}

                    {isEditing && (
                        <>
                            <button
                                className='costs__button-edit'
                                onClick={handleAdd}
                            >
                                + Добавить новый блок
                            </button>

                            <button
                                className='neg-button costs__button-edit'
                                onClick={() => setIsEditing(false)}
                            >
                                Отмена
                            </button>
                        </>
                    )}

                </div>
            </div>
        </AnimatedBlock >
    )
}

export default Costs;