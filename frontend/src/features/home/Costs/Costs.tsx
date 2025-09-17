import './Costs.scss'
import AnimatedBlock from '../../../components/AnimatedBlock';
import { useEffect, useState } from 'react';
import type { AxiosError } from 'axios';
import type { TypeResponse } from '../../../models/response/DefaultResponse';
import HomeService from '../../../services/HomeService';
import type { InfoBlock } from '../../../models/InfoBlock';
import type { ElementHomePageProps } from '../../../pages/Homepage';

const Costs: React.FC<ElementHomePageProps> = ({ role }) => {
    const [data, setData] = useState<InfoBlock[]>([] as InfoBlock[]);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [message, setMessage] = useState<string>("");
    const [error, setError] = useState<string>("");

    // Получение данных о стоимости услуг
    const fetchData = async () => {
        try {
            const response = await HomeService.getContent("cost_consultation");
            setData(response.data);
        } catch (e) {
            const error = e as AxiosError<TypeResponse>;
            console.error(error.response?.data.message);
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
            setIsEditing(false);
            setMessage("Данные успешно сохранены!")
        } catch (e) {
            const error = e as AxiosError<TypeResponse>;
            console.error("Ошибка при сохранении блока: ", error.response?.data.message);
            setError(`Ошибка при сохранении блока: ${error.response?.data.message}`)
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

            setData(prev => [...prev, newBlock]);
            // await HomeService.addContent("cost_consultation", newBlock);
            setMessage("Блок успешно добавлен!")
        } catch (e) {
            const error = e as AxiosError<TypeResponse>;
            console.error("Ошибка при добавлении блока: ", error.response?.data.message);
            setError(`Ошибка при добавлении блока: ${error.response?.data.message}`)
        }
    };

    const handleDelete = async (id: number) => {
        try {
            // await HomeService.deleteContent("cost_consultation", id);
        } catch (e) {
            const error = e as AxiosError<TypeResponse>;
            console.error("Ошибка при удалении блока: ", error.response?.data.message);
            setError(`Ошибка при удалении блока: ${error.response?.data.message}`)
        }
    }


    if (data.length === 0) return (
        <AnimatedBlock>
            <div className="costs container" id="costs">
                <div className="container__box">
                    <h2 className='costs__title'>Стоимость консультации</h2>

                    <div className="costs__block">
                        <h3 className="costs__block--none">
                            Нет данных
                        </h3>
                    </div>
                </div>
            </div>
        </AnimatedBlock>
    )

    return (
        <AnimatedBlock>
            <div className="costs container" id="costs">
                <div className="container__box">
                    <h2 className='costs__title'>Стоимость консультации</h2>
                    {message && (<div className='costs__message--good costs__message'>{message}</div>)}
                    {error && (<div className='costs__message--bad costs__message'>{error}</div>)}
                    <div className={`${isEditing ? "costs__box" : ""}`}>
                        {data && data.map(d => (
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
                        ))}
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
                                Добавить блок
                            </button>

                            <button
                                className='costs__button-edit'
                                onClick={() => setIsEditing(false)}
                            >
                                Выйти из редактирования
                            </button>
                        </>
                    )}

                </div>
            </div>
        </AnimatedBlock >
    )
}

export default Costs;